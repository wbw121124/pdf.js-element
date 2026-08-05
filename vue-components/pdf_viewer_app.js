/* Copyright 2026 wbw121124
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { AppOptions } from "../web/app_options.js";
import { createPDFViewerApplication } from "../web/app.js";
import { GlobalWorkerOptions } from "pdfjs-lib";
import { viewerHtml } from "../element/viewer_template.js";

const ID_REFERENCE_ATTRIBUTES = [
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
  "for",
];

// The (former) `@media (max-width: Npx)` breakpoints of the viewer CSS,
// which are toggled as classes on the instance root based on the *container*
// width (the viewport width is irrelevant in the embedded context). Note
// that the 560px breakpoint is dropped by `scopeCSSForElement()` in the
// gulpfile, since the zoom select must remain visible even when narrow.
const NARROW_BREAKPOINTS = [840, 750, 690];

// The viewer events that are forwarded to the `onViewerEvent` callback.
const FORWARDED_EVENTS = [
  "documentloaded",
  "documentinit",
  "documentloadfailed",
  "pagesloaded",
  "pagechanging",
  "scalechanging",
  "rotationchanging",
  "zoomchanging",
  "pagerendered",
  "pagerendererror",
  "pageerrors",
  "updateviewarea",
  "find",
  "findbaropen",
  "findbarclose",
  "presentationmodechanged",
  "cursorchanged",
  "sidebarviewchanged",
];

// Maps the asset-related options to the corresponding `AppOptions` names.
const ASSET_OPTIONS = [
  ["workerSrc", "workerSrc"],
  ["cMapUrl", "cMapUrl"],
  ["standardFontDataUrl", "standardFontDataUrl"],
  ["wasmUrl", "wasmUrl"],
  ["sandboxBundleSrc", "sandboxBundleSrc"],
];

let idCounter = 0;

/**
 * Creates an embeddable viewer application *without* relying on Web
 * Components / Custom Elements (unlike the `<pdf-viewer-element>` Custom
 * Element in `element/`, which this module is derived from). The viewer
 * DOM is built inside the provided (regular) container element, and the
 * returned object mirrors the public API of the Custom Element.
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - The (regular) element that will
 *   host the viewer DOM; it receives the `pdfjs-element` class.
 * @param {string} [options.uiStyle = "new"] - The initial UI style, either
 *   `"new"` (the default, i.e. the modern UI) or `"old"` (the legacy flat
 *   UI); see `element/pdf-viewer-element-old-ui.css`.
 * @param {Object} [options.assets] - Asset-related overrides, i.e.
 *   `workerSrc`, `cMapUrl`, `standardFontDataUrl`, `wasmUrl`,
 *   `sandboxBundleSrc`, `lang` and `l10nUrl` (only applied at creation
 *   time).
 * @param {Function} [options.getViewState] - Returns the current
 *   `{ src, page, zoom }` values; used when (re-)opening a document.
 * @param {Function} [options.onViewerEvent] - Callback invoked for every
 *   forwarded viewer event, with `(name, data)` arguments.
 * @returns {Object} - The viewer application handle, with `ready`, `open`,
 *   `close`, `nextPage`, `previousPage`, `firstPage`, `lastPage`,
 *   `gotoPage`, `zoomIn`, `zoomOut`, `zoomReset`, `setZoom`, `rotateCW`,
 *   `rotateCCW`, `setUiStyle` and `destroy`, plus the `page`, `pagesCount`,
 *   `zoom`, `isOpen`, `pdfViewerApplication` and `pdfViewer` getters.
 */
function createViewerApp({
  container,
  uiStyle = "new",
  assets = {},
  getViewState = () => ({}),
  onViewerEvent = () => {},
}) {
  const idPrefix = `pdfjs-vue-${idCounter++}`;
  let app = null;
  let readyPromise = null;
  let resizeObserver = null;

  /**
   * The asset URLs must be resolved relative to the location of the
   * application bundle (i.e. the location of this script/CSS), hence they
   * cannot use the `../build/...` defaults that are used by the standalone
   * viewer. All values can be overridden by the caller.
   */
  function applyAssetOptions() {
    for (const [name, option] of ASSET_OPTIONS) {
      const value = assets[name];
      if (value) {
        AppOptions.set(option, value);
      }
    }
    const workerSrc = AppOptions.get("workerSrc");
    if (workerSrc) {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    // The UI language is passed to the application via `AppOptions`, and the
    // translations are loaded from the `l10nUrl` directory (which must
    // contain `locale.json` and the `*.ftl` files). The `GenericL10n`
    // implementation looks for a document-level
    // `<link rel="resource" type="application/l10n">` element pointing at
    // `locale.json`; since that is page-wide, only one locale directory can
    // be used per page (the first instance defining `l10nUrl` wins).
    if (assets.lang) {
      AppOptions.set("localeProperties", { lang: assets.lang });
    }
    if (assets.l10nUrl) {
      const baseUrl = new URL(assets.l10nUrl, document.baseURI);
      const normalizedBase = baseUrl.href.endsWith("/")
        ? baseUrl.href
        : `${baseUrl.href}/`;
      let link = document.querySelector(`link[type="application/l10n"]`);
      if (!link) {
        link = document.createElement("link");
        link.rel = "resource";
        link.type = "application/l10n";
        document.head.append(link);
      }
      link.href = new URL("locale.json", normalizedBase).href;
    }
  }

  /**
   * Toggles the UI style, i.e. `data-ui-style="old"` is set on the instance
   * root (see `element/pdf-viewer-element-old-ui.css`) for the "old" style,
   * otherwise the (default) modern UI applies.
   */
  function setUiStyle(style) {
    if (style === "old") {
      container.setAttribute("data-ui-style", "old");
    } else {
      container.removeAttribute("data-ui-style");
    }
  }

  /**
   * Prefix all `id` attributes in the (instance) DOM, and add the
   * corresponding classes so that the (scoped) CSS rules apply; finally fix
   * any attribute that references one of those ids.
   */
  function assignIds(root) {
    const idMap = new Map();
    root.querySelectorAll("[id]").forEach(el => {
      const id = el.id;
      idMap.set(id, el);
      el.id = `${idPrefix}-${id}`;
      if (!el.classList.contains(id)) {
        el.classList.add(id);
      }
    });
    root
      .querySelectorAll(
        ID_REFERENCE_ATTRIBUTES.map(attr => `[${attr}]`).join(",")
      )
      .forEach(el => {
        for (const attr of ID_REFERENCE_ATTRIBUTES) {
          const reference = el.getAttribute(attr);
          if (!reference || !idMap.has(reference)) {
            continue;
          }
          el.setAttribute(attr, `${idPrefix}-${reference}`);
        }
      });
    return idMap;
  }

  function getViewerConfiguration(ids) {
    const id = name => ids.get(name);
    return {
      principalContainer: id("mainContainer"),
      mainContainer: id("viewerContainer"),
      viewerContainer: id("viewer"),
      viewerAlert: id("viewer-alert"),
      toolbar: {
        container: id("toolbarContainer"),
        numPages: id("numPages"),
        pageNumber: id("pageNumber"),
        scaleSelect: id("scaleSelect"),
        customScaleOption: id("customScaleOption"),
        previous: id("previous"),
        next: id("next"),
        zoomIn: id("zoomInButton"),
        zoomOut: id("zoomOutButton"),
      },
      secondaryToolbar: {
        toolbar: id("secondaryToolbar"),
        toggleButton: id("secondaryToolbarToggleButton"),
        presentationModeButton: id("presentationMode"),
        openFileButton: id("secondaryOpenFile"),
        viewBookmarkButton: id("viewBookmark"),
        firstPageButton: id("firstPage"),
        lastPageButton: id("lastPage"),
        pageRotateCwButton: id("pageRotateCw"),
        pageRotateCcwButton: id("pageRotateCcw"),
        cursorSelectToolButton: id("cursorSelectTool"),
        cursorHandToolButton: id("cursorHandTool"),
        scrollPageButton: id("scrollPage"),
        scrollVerticalButton: id("scrollVertical"),
        scrollHorizontalButton: id("scrollHorizontal"),
        scrollWrappedButton: id("scrollWrapped"),
        spreadNoneButton: id("spreadNone"),
        spreadOddButton: id("spreadOdd"),
        spreadEvenButton: id("spreadEven"),
        documentPropertiesButton: id("documentProperties"),
      },
      viewsManager: {
        outerContainer: id("outerContainer"),
        toggleButton: id("viewsManagerToggleButton"),
        sidebarContainer: id("viewsManager"),
        resizer: id("viewsManagerResizer"),
        thumbnailButton: id("thumbnailsViewMenu"),
        outlineButton: id("outlinesViewMenu"),
        attachmentsButton: id("attachmentsViewMenu"),
        layersButton: id("layersViewMenu"),
        viewsManagerSelectorButton: id("viewsManagerSelectorButton"),
        viewsManagerSelectorOptions: id("viewsManagerSelectorOptions"),
        thumbnailsView: id("thumbnailsView"),
        outlinesView: id("outlinesView"),
        attachmentsView: id("attachmentsView"),
        layersView: id("layersView"),
        viewsManagerCurrentOutlineButton: id(
          "viewsManagerCurrentOutlineButton"
        ),
        viewsManagerHeaderLabel: id("viewsManagerHeaderLabel"),
      },
      findBar: {
        bar: id("findbar"),
        toggleButton: id("viewFindButton"),
        findField: id("findInput"),
        highlightAllCheckbox: id("findHighlightAll"),
        caseSensitiveCheckbox: id("findMatchCase"),
        matchDiacriticsCheckbox: id("findMatchDiacritics"),
        entireWordCheckbox: id("findEntireWord"),
        findMsg: id("findMsg"),
        findResultsCount: id("findResultsCount"),
        findPreviousButton: id("findPreviousButton"),
        findNextButton: id("findNextButton"),
      },
      passwordOverlay: {
        dialog: id("passwordDialog"),
        label: id("passwordText"),
        input: id("password"),
        submitButton: id("passwordSubmit"),
        cancelButton: id("passwordCancel"),
      },
      documentProperties: {
        dialog: id("documentPropertiesDialog"),
        closeButton: id("documentPropertiesClose"),
        fields: {
          fileName: id("fileNameField"),
          fileSize: id("fileSizeField"),
          title: id("titleField"),
          author: id("authorField"),
          subject: id("subjectField"),
          keywords: id("keywordsField"),
          creationDate: id("creationDateField"),
          modificationDate: id("modificationDateField"),
          creator: id("creatorField"),
          producer: id("producerField"),
          version: id("versionField"),
          pageCount: id("pageCountField"),
          pageSize: id("pageSizeField"),
          linearized: id("linearizedField"),
        },
      },
      loadingBar: id("loadingBar"),
      viewBookmarkSeparator: id("viewBookmarkSeparator"),
    };
  }

  /**
   * Open the document referenced by the (current) `src` value and then
   * apply the (current) `page` and `zoom` values.
   */
  function openWithUrl(url) {
    return app.open({ url }).then(() => applyViewState());
  }

  /**
   * Apply the `page` and `zoom` values; note that this runs *after* the
   * initial view (including the stored view history) has been applied, so
   * that the values always take precedence over it.
   */
  async function applyViewState() {
    if (!app?.pdfViewer) {
      return;
    }
    try {
      await app.pdfViewer.pagesPromise;
    } catch {
      // Ignore failures here, to avoid breaking the viewer rendering.
    }
    if (!app.isInitialViewSet) {
      // Wait for `setInitialView` (see `app.js`) to complete.
      await new Promise(resolve => {
        app.eventBus.on("documentinit", resolve, { once: true });
        setTimeout(resolve, 1000);
      });
    }
    const { page, zoom } = getViewState();
    if (page) {
      await viewerApp.gotoPage(parseInt(page, 10));
    }
    if (zoom) {
      viewerApp.setZoom(zoom);
    }
  }

  function forwardEvents(instance) {
    const { eventBus } = instance;
    for (const name of FORWARDED_EVENTS) {
      eventBus.on(name, evt => {
        onViewerEvent(name, evt);
      });
    }
  }

  /**
   * The viewer DOM is built as regular DOM inside the container, since the
   * viewer implementation (and its CSS) relies on regular document behavior
   * such as `:focus` and global events.
   */
  async function initialize() {
    applyAssetOptions();

    container.className = "pdfjs-element";
    setUiStyle(uiStyle);
    // The markup comes from the bundled (static) `viewer_template.js`
    // module, and is hence *not* user-controlled.
    // eslint-disable-next-line no-unsanitized/property
    container.innerHTML = viewerHtml;

    const ids = assignIds(container);

    // Toggle the (former media query) narrow-width classes based on the
    // *container* width, rather than the viewport width.
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      for (const breakpoint of NARROW_BREAKPOINTS) {
        container.classList.toggle(
          `pdfjs-element-narrow-${breakpoint}`,
          width <= breakpoint
        );
      }
    });
    resizeObserver.observe(container);

    const appConfig = getViewerConfiguration(ids);
    appConfig.appContainer = container;

    const instance = createPDFViewerApplication({
      initialBookmark: "",
      isViewerEmbedded: true,
      isViewerElement: true,
      viewHistoryPrefix: idPrefix,
    });
    app = instance;

    return instance.initialize(appConfig).then(() => {
      // The instance may have been destroyed while the application was
      // initializing; in that case the (discarded) instance must not be
      // finalized.
      if (app !== instance) {
        return undefined;
      }
      forwardEvents(instance);

      const { src } = getViewState();
      if (src) {
        return openWithUrl(src);
      }
      return undefined;
    });
  }

  /**
   * @param {Object} options - Accepts any/all of the properties from
   *   {@link DocumentInitParameters}, and also a `originalUrl` string.
   * @returns {Promise} - Promise that is resolved when the document is opened.
   */
  async function open(options) {
    if (typeof options === "string") {
      options = { url: options };
    }
    await viewerApp.ready;
    if (!app) {
      throw new Error(
        "createViewerApp.open: the viewer is not mounted in the DOM."
      );
    }
    return app.open(options).then(() => applyViewState());
  }

  function close() {
    return app?.close();
  }

  function nextPage() {
    if (app?.pdfDocument) {
      app.eventBus.dispatch("nextpage", { source: viewerApp });
    }
  }

  function previousPage() {
    if (app?.pdfDocument) {
      app.eventBus.dispatch("previouspage", { source: viewerApp });
    }
  }

  function firstPage() {
    if (app?.pdfDocument) {
      app.eventBus.dispatch("firstpage", { source: viewerApp });
    }
  }

  function lastPage() {
    if (app?.pdfDocument) {
      app.eventBus.dispatch("lastpage", { source: viewerApp });
    }
  }

  async function gotoPage(pageNumber) {
    const pdfViewer = app?.pdfViewer;
    if (!pdfViewer || !app?.pdfDocument) {
      return;
    }
    // The page *views* are created lazily (per visible page), hence wait for
    // all of them to be available before setting the current page number,
    // since `app.page = ...` would otherwise throw.
    try {
      await pdfViewer.pagesPromise;
    } catch {
      // Ignore failures here, to avoid breaking the viewer rendering.
    }
    if (pageNumber >= 1 && pageNumber <= pdfViewer.pagesCount) {
      app.page = pageNumber;
    }
  }

  function zoomIn() {
    app?.zoomIn();
  }

  function zoomOut() {
    app?.zoomOut();
  }

  function zoomReset() {
    app?.zoomReset();
  }

  /**
   * @param {string|number} value - Accepts either a numeric scale factor or
   *   one of the "named" zoom values, e.g. `"auto"` or `"page-fit"`.
   */
  function setZoom(value) {
    if (app?.pdfViewer) {
      app.pdfViewer.currentScaleValue = String(value);
    }
  }

  function rotateCW() {
    app?.eventBus.dispatch("rotatecw", { source: viewerApp });
  }

  function rotateCCW() {
    app?.eventBus.dispatch("rotateccw", { source: viewerApp });
  }

  /**
   * Destroys the viewer application and removes the viewer DOM; the
   * container element is removed as well.
   * @returns {Promise} - Promise that is resolved when the document has
   *   been destroyed.
   */
  function destroy() {
    const instance = app;
    app = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
    container.remove();
    readyPromise = null;
    if (!instance) {
      return Promise.resolve();
    }
    return instance
      .close()
      .catch(() => {})
      .finally(() => {
        instance._globalAbortController.abort();
      });
  }

  const viewerApp = {
    get ready() {
      return readyPromise || Promise.resolve();
    },
    open,
    close,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    gotoPage,
    zoomIn,
    zoomOut,
    zoomReset,
    setZoom,
    rotateCW,
    rotateCCW,
    setUiStyle,
    destroy,
    get pdfViewerApplication() {
      return app;
    },
    get pdfViewer() {
      return app?.pdfViewer || null;
    },
    get page() {
      return app?.page || 0;
    },
    get pagesCount() {
      return app?.pagesCount || 0;
    },
    get zoom() {
      return app?.pdfViewer?.currentScale || 0;
    },
    get isOpen() {
      return !!app?.pdfDocument;
    },
  };

  readyPromise = initialize();
  return viewerApp;
}

export { createViewerApp };
