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
import { viewerHtml } from "./viewer_template.js";

const ID_REFERENCE_ATTRIBUTES = [
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
  "for",
];

// The (former) `@media (max-width: Npx)` breakpoints of the viewer CSS,
// which are toggled as classes on the instance root based on the *element*
// width (the viewport width is irrelevant in the element context). Note
// that the 560px breakpoint is dropped by `scopeCSSForElement()` in the
// gulpfile, since the zoom select must remain visible even when narrow.
const NARROW_BREAKPOINTS = [840, 750, 690];

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

/**
 * The `<pdf-viewer-element>` Custom Element, providing an embeddable,
 * multi-instance PDF viewer.
 *
 * Multiple instances of the element can coexist on the same page; each
 * instance owns an independent viewer application (see
 * `createPDFViewerApplication` in `web/app.js`) and a scoped copy of the
 * viewer DOM, hence all CSS rules are scoped to the `.pdfjs-element` class
 * and all `id` attributes are prefixed per instance.
 *
 * Supported attributes:
 *  - `src`: URL of the PDF document to open (when changed, the currently
 *    opened document is replaced).
 *  - `page`: the (initial) page number to display.
 *  - `zoom`: the (initial) zoom value, e.g. `"1.5"`, `"auto"` or `"page-fit"`.
 *  - `worker-src`: overrides `GlobalWorkerOptions.workerSrc`.
 *  - `c-map-url`, `standard-font-data-url`, `wasm-url`, `sandbox-bundle-src`:
 *    overrides for the corresponding `AppOptions`.
 *  - `lang`: the UI language of the viewer, e.g. `"zh-CN"` or `"en-US"`.
 *    The translations are loaded from the locale directory (see
 *    `l10n-url`); if the requested language is not available, the embedded
 *    English fallback is used.
 *  - `l10n-url`: base URL of the directory containing the `locale.json`
 *    and `*.ftl` files, e.g. `"locale/"` (relative URLs are resolved
 *    against the URL of the page). Note that the document can only use a
 *    single locale directory; the first element on the page that specifies
 *    this attribute wins.
 *  - `ui-style`: the UI style of the viewer, either `"new"` (the default,
 *    i.e. the modern UI) or `"old"` (the legacy flat UI); the modern UI is
 *    entirely driven by CSS variables, so the "old" style only overrides
 *    those variable values (see `element/pdf-viewer-element-old-ui.css`).
 *
 * Methods (mirroring the `PDFViewerApplication` API): `open`, `close`,
 * `nextPage`, `previousPage`, `firstPage`, `lastPage`, `gotoPage`,
 * `zoomIn`, `zoomOut`, `zoomReset`, `setZoom`, `rotateCW`, `rotateCCW`.
 *
 * Getters: `ready` (Promise), `pdfViewerApplication`, `pdfViewer`,
 * `page`, `pagesCount`, `zoom`, `isOpen`.
 *
 * Events: viewer events (e.g. `pagechanging`, `scalechanging`,
 * `pagerendered`, `documentloaded`) are re-dispatched on the element as
 * `pdfjs-*` CustomEvents (e.g. `pdfjs-pagechanging`), with the original
 * event data in `detail`.
 *
 * @example
 * <pdf-viewer-element src="example.pdf" style="height: 600px">
 * </pdf-viewer-element>
 */
class PDFViewerElement extends HTMLElement {
  static get observedAttributes() {
    return ["src", "page", "zoom", "ui-style"];
  }

  #app = null;

  #container = null;

  #ids = null;

  #initialized = false;

  #idPrefix = "";

  #resizeObserver = null;

  constructor() {
    super();
    this._readyPromise = null;
  }

  async connectedCallback() {
    this._readyPromise ||= this.#initialize();
    await this._readyPromise.catch(() => {});
  }

  async disconnectedCallback() {
    if (!this.#app) {
      return;
    }
    // Close the document and remove the listeners that the application
    // added on the window object.
    const app = this.#app;
    this.#app = null;
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#container?.remove();
    this.#container = null;
    this._readyPromise = null;
    this.#initialized = false;
    try {
      await app.close();
    } catch (ex) {
      console.error("PDFViewerElement.disconnectedCallback:", ex);
    }
    app._globalAbortController.abort();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#initialized) {
      return;
    }
    switch (name) {
      case "src":
        if (newValue) {
          this.open({ url: newValue });
        }
        break;
      case "page":
        if (newValue) {
          this.gotoPage(parseInt(newValue, 10));
        }
        break;
      case "zoom":
        if (newValue) {
          this.setZoom(newValue);
        }
        break;
      case "ui-style":
        this.#applyUiStyle();
        break;
    }
  }

  /**
   * Toggles the `ui-style` of the viewer, i.e. `data-ui-style="old"` is set
   * on the instance root (see `element/pdf-viewer-element-old-ui.css`) when
   * the `ui-style="old"` attribute is present, otherwise the (default)
   * modern UI applies.
   */
  #applyUiStyle() {
    if (this.getAttribute("ui-style") === "old") {
      this.#container?.setAttribute("data-ui-style", "old");
    } else {
      this.#container?.removeAttribute("data-ui-style");
    }
  }

  /**
   * The `<pdf-viewer-element>` DOM is built as "light DOM", i.e. as a child
   * of the Custom Element itself, since the viewer implementation (and its
   * CSS) relies on regular document behavior such as `:focus` and global
   * events.
   */
  #initialize() {
    this.#idPrefix = `pdfjs-element-${PDFViewerElement.#idCounter++}`;

    this.#applyAssetOptions();

    const container = document.createElement("div");
    container.className = "pdfjs-element";
    this.append(container);
    this.#container = container;
    this.#applyUiStyle();
    // The markup comes from the bundled (static) `viewer_template.js` module,
    // and is hence *not* user-controlled.
    // eslint-disable-next-line no-unsanitized/property
    container.innerHTML = viewerHtml;

    this.#ids = new Map();
    this.#assignIds(container);

    // Toggle the (former media query) narrow-width classes based on the
    // *element* width, rather than the viewport width.
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      for (const breakpoint of NARROW_BREAKPOINTS) {
        container.classList.toggle(
          `pdfjs-element-narrow-${breakpoint}`,
          width <= breakpoint
        );
      }
    });
    this.#resizeObserver.observe(container);

    const appConfig = this.#getViewerConfiguration();
    appConfig.appContainer = container;

    const app = createPDFViewerApplication({
      initialBookmark: "",
      isViewerEmbedded: true,
      isViewerElement: true,
      viewHistoryPrefix: this.#idPrefix,
    });
    this.#app = app;

    return app.initialize(appConfig).then(() => {
      // The element may have been disconnected while the application was
      // initializing; in that case the (discarded) instance must not be
      // finalized, since `disconnectedCallback` already cleaned it up.
      if (this.#app !== app) {
        return undefined;
      }
      this.#initialized = true;
      this.#forwardEvents();

      const src = this.getAttribute("src");
      if (src) {
        return this.#openWithUrl(src);
      }
      return undefined;
    });
  }

  /**
   * Open the document referenced by the `src` attribute and then apply the
   * (initial) `page` and `zoom` attributes.
   */
  #openWithUrl(url) {
    return this.#app.open({ url }).then(() => this.#applyViewState());
  }

  /**
   * Apply the `page` and `zoom` attributes; note that this runs *after* the
   * initial view (including the stored view history) has been applied, so
   * that the attributes always take precedence over it.
   */
  async #applyViewState() {
    const app = this.#app;
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
    const page = this.getAttribute("page");
    if (page) {
      await this.gotoPage(parseInt(page, 10));
    }
    const zoom = this.getAttribute("zoom");
    if (zoom) {
      this.setZoom(zoom);
    }
  }

  /**
   * @param {Object} options - Accepts any/all of the properties from
   *   {@link DocumentInitParameters}, and also a `originalUrl` string.
   * @returns {Promise} - Promise that is resolved when the document is opened.
   */
  async open(options) {
    if (typeof options === "string") {
      options = { url: options };
    }
    await this.ready;
    if (!this.#app) {
      throw new Error(
        "PDFViewerElement.open: the element is not connected to the DOM."
      );
    }
    return this.#app.open(options).then(() => this.#applyViewState());
  }

  /**
   * @returns {Promise} - Promise that is resolved when the document is
   *   destroyed.
   */
  close() {
    return this.#app?.close();
  }

  nextPage() {
    if (this.#app?.pdfDocument) {
      this.#app.eventBus.dispatch("nextpage", { source: this });
    }
  }

  previousPage() {
    if (this.#app?.pdfDocument) {
      this.#app.eventBus.dispatch("previouspage", { source: this });
    }
  }

  firstPage() {
    if (this.#app?.pdfDocument) {
      this.#app.eventBus.dispatch("firstpage", { source: this });
    }
  }

  lastPage() {
    if (this.#app?.pdfDocument) {
      this.#app.eventBus.dispatch("lastpage", { source: this });
    }
  }

  async gotoPage(pageNumber) {
    const pdfViewer = this.#app?.pdfViewer;
    if (!pdfViewer || !this.#app?.pdfDocument) {
      return;
    }
    // The page *views* are created lazily (per visible page), hence wait for
    // all of them to be available before setting the current page number,
    // since `this.#app.page = ...` would otherwise throw.
    try {
      await pdfViewer.pagesPromise;
    } catch {
      // Ignore failures here, to avoid breaking the viewer rendering.
    }
    if (pageNumber >= 1 && pageNumber <= pdfViewer.pagesCount) {
      this.#app.page = pageNumber;
    }
  }

  zoomIn() {
    this.#app?.zoomIn();
  }

  zoomOut() {
    this.#app?.zoomOut();
  }

  zoomReset() {
    this.#app?.zoomReset();
  }

  /**
   * @param {string|number} value - Accepts either a numeric scale factor or
   *   one of the "named" zoom values, e.g. `"auto"` or `"page-fit"`.
   */
  setZoom(value) {
    if (this.#app?.pdfViewer) {
      this.#app.pdfViewer.currentScaleValue = String(value);
    }
  }

  rotateCW() {
    this.#app?.eventBus.dispatch("rotatecw", { source: this });
  }

  rotateCCW() {
    this.#app?.eventBus.dispatch("rotateccw", { source: this });
  }

  /**
   * @returns {Promise} - Promise that is resolved once the viewer has been
   *   initialized (and the document referenced by the `src` attribute, if
   *   any, has been opened).
   */
  get ready() {
    return this._readyPromise || Promise.resolve();
  }

  get pdfViewerApplication() {
    return this.#app;
  }

  get pdfViewer() {
    return this.#app?.pdfViewer || null;
  }

  get page() {
    return this.#app?.page || 0;
  }

  get pagesCount() {
    return this.#app?.pagesCount || 0;
  }

  get zoom() {
    return this.#app?.pdfViewer?.currentScale || 0;
  }

  get isOpen() {
    return !!this.#app?.pdfDocument;
  }

  #applyAssetOptions() {
    // The asset URLs must be resolved relative to the location of the
    // element (i.e. the location of this script/CSS), hence they cannot use
    // the `../build/...` defaults that are used by the standalone viewer.
    // All values can be overridden with the corresponding attributes.
    const assetOptions = [
      ["worker-src", "workerSrc"],
      ["c-map-url", "cMapUrl"],
      ["standard-font-data-url", "standardFontDataUrl"],
      ["wasm-url", "wasmUrl"],
      ["sandbox-bundle-src", "sandboxBundleSrc"],
    ];
    for (const [attr, option] of assetOptions) {
      const value = this.getAttribute(attr);
      if (value) {
        AppOptions.set(option, value);
      }
    }
    const workerSrc = AppOptions.get("workerSrc");
    if (workerSrc) {
      GlobalWorkerOptions.workerSrc = workerSrc;
    }

    // The UI language is passed to the application via `AppOptions`, and the
    // translations are loaded from the `l10n-url` directory (which must
    // contain `locale.json` and the `*.ftl` files). The `GenericL10n`
    // implementation looks for a document-level
    // `<link rel="resource" type="application/l10n">` element pointing at
    // `locale.json`; since that is page-wide, only one locale directory can
    // be used per page (the first element defining `l10n-url` wins).
    const lang = this.getAttribute("lang");
    if (lang) {
      AppOptions.set("localeProperties", { lang });
    }
    const l10nUrl = this.getAttribute("l10n-url");
    if (l10nUrl) {
      const baseUrl = new URL(l10nUrl, this.baseURI);
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
   * Prefix all `id` attributes in the (instance) DOM, and add the
   * corresponding classes so that the (scoped) CSS rules apply; finally fix
   * any attribute that references one of those ids.
   */
  #assignIds(root) {
    const idMap = new Map();
    root.querySelectorAll("[id]").forEach(el => {
      const id = el.id;
      idMap.set(id, el);
      el.id = `${this.#idPrefix}-${id}`;
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
          el.setAttribute(attr, `${this.#idPrefix}-${reference}`);
        }
      });
    this.#ids = idMap;
  }

  #getViewerConfiguration() {
    const id = name => this.#ids.get(name);
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

  #forwardEvents() {
    const { eventBus } = this.#app;
    for (const name of FORWARDED_EVENTS) {
      eventBus.on(name, evt => {
        this.dispatchEvent(
          new CustomEvent(`pdfjs-${name}`, {
            bubbles: true,
            detail: evt,
          })
        );
      });
    }
  }

  static #idCounter = 0;
}

if (!customElements.get("pdf-viewer-element")) {
  customElements.define("pdf-viewer-element", PDFViewerElement);
}

export { PDFViewerElement };
