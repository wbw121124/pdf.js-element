<!--
 * Vue 3 wrapper component for the embeddable PDF viewer of this
 * repository. The component instantiates the viewer application directly
 * (see `pdf_viewer_app.js`) inside a regular element, i.e. it does *not*
 * rely on Web Components / Custom Elements. The component:
 *   - creates one viewer application instance per component instance,
 *   - keeps the viewer state in sync with the component props (the `src`,
 *     `page`, `zoom` props take effect immediately at runtime, and also the
 *     `ui-style` "new"/"old" toggle),
 *   - forwards the viewer events as `pdfjs-*` Vue events,
 *   - exposes the viewer methods and getters to the parent via `ref`.
 *
 * The viewer assets (worker, CMaps, locale files, ...) must be served
 * separately; see the `worker-src`, `c-map-url`, `l10n-url`, ... props.
 *
 * @example
 * <PdfViewerElement
 *   ref="viewer"
 *   src="/element/compressed.tracemonkey-pldi-09.pdf"
 *   lang="zh-CN"
 *   l10n-url="/element/locale/"
 *   :ui-style="oldUi ? 'old' : 'new'"
 *   height="600px"
 *   @pdfjs-pagechanging="onPageChanging"
 * />
 -->
<template>
  <div ref="host" class="pdfjs-vue-host" :style="hostStyle">
    <div ref="container" class="pdfjs-element"></div>
  </div>
</template>

<script>
import "../build/generic/element/pdf-viewer-element.css";
import { createViewerApp } from "../build/vue-components/pdf-viewer-app.mjs";

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

const METHOD_PROPS = [
  "open",
  "close",
  "nextPage",
  "previousPage",
  "firstPage",
  "lastPage",
  "gotoPage",
  "zoomIn",
  "zoomOut",
  "zoomReset",
  "setZoom",
  "rotateCW",
  "rotateCCW",
  "setUiStyle",
];

export default {
  name: "PdfViewerElement",
  props: {
    src: { type: String, default: "" },
    page: { type: Number, default: null },
    zoom: { type: [String, Number], default: "" },
    lang: { type: String, default: "" },
    l10nUrl: { type: String, default: "" },
    uiStyle: { type: String, default: "new" },
    workerSrc: { type: String, default: "" },
    cMapUrl: { type: String, default: "" },
    standardFontDataUrl: { type: String, default: "" },
    wasmUrl: { type: String, default: "" },
    sandboxBundleSrc: { type: String, default: "" },
    height: { type: String, default: "600px" },
    width: { type: String, default: "100%" },
  },
  emits: FORWARDED_EVENTS.map((name) => `pdfjs-${name}`),
  data() {
    return { viewer: null };
  },
  computed: {
    hostStyle() {
      return { height: this.height, width: this.width };
    },
    ready() {
      return this.viewer ? this.viewer.ready : null;
    },
    instance() {
      return this.viewer;
    },
  },
  watch: {
    src(value) {
      if (value) {
        this.viewer?.open({ url: value });
      }
    },
    page(value) {
      if (value) {
        this.viewer?.gotoPage(value);
      }
    },
    zoom(value) {
      if (value) {
        this.viewer?.setZoom(value);
      }
    },
    uiStyle(value) {
      this.viewer?.setUiStyle(value);
    },
  },
  mounted() {
    this.viewer = createViewerApp({
      container: this.$refs.container,
      uiStyle: this.uiStyle,
      assets: {
        workerSrc: this.workerSrc,
        cMapUrl: this.cMapUrl,
        standardFontDataUrl: this.standardFontDataUrl,
        wasmUrl: this.wasmUrl,
        sandboxBundleSrc: this.sandboxBundleSrc,
        lang: this.lang,
        l10nUrl: this.l10nUrl,
      },
      getViewState: () => ({ src: this.src, page: this.page, zoom: this.zoom }),
      onViewerEvent: (name, data) => this.$emit(`pdfjs-${name}`, data),
    });
  },
  beforeUnmount() {
    this.viewer?.destroy();
    this.viewer = null;
  },
  methods: Object.fromEntries(
    METHOD_PROPS.map((name) => [
      name,
      function (...args) {
        return this.viewer ? this.viewer[name](...args) : null;
      },
    ])
  ),
  expose: ["ready", "instance", ...METHOD_PROPS],
};
</script>

<style scoped>
.pdfjs-vue-host {
  display: flex;
  overflow: hidden;
}

.pdfjs-vue-host > .pdfjs-element {
  flex: 1;
  min-width: 0;
}
</style>