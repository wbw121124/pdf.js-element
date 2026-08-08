<script>
import PdfViewerElement from "../PdfViewerElement.vue";

export default {
  name: "App",
  components: { PdfViewerElement },
  data() {
    return {
      src: "/element/compressed.tracemonkey-pldi-09.pdf",
      page: 1,
      oldUi: false,
      log: [],
    };
  },
  methods: {
    onViewerEvent(eventName, detail) {
      const replacer = (key, value) => {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          value.constructor !== Object
        ) {
          return undefined;
        }
        return value;
      };
      let entry = eventName;
      try {
        entry += ` ${JSON.stringify(detail ?? {}, replacer)}`;
      } catch {
        entry += " (unserializable detail)";
      }
      this.log.unshift(entry);
      this.log = this.log.slice(0, 8);
    },
  },
};
</script>

<template>
  <div class="app">
    <h1>&lt;pdf-viewer-element&gt; · Vue 3</h1>
    <p class="hint">
      将 <code>build/element/</code> 目录（worker、locale、cmaps 等）
      复制到 Vite 的 public 目录，使资源可通过
      <code>/element/...</code> 访问。
    </p>
    <div class="controls">
      <button @click="$refs.viewer.nextPage()">下一页</button>
      <button @click="$refs.viewer.previousPage()">上一页</button>
      <button @click="$refs.viewer.gotoPage(3)">第 3 页</button>
      <button @click="$refs.viewer.zoomIn()">放大</button>
      <button @click="$refs.viewer.zoomOut()">缩小</button>
      <button @click="$refs.viewer.rotateCW()">顺时针旋转</button>
      <label>
        页码
        <input v-model.number="page" type="number" min="1" style="width: 60px" />
      </label>
      <label>
        <input v-model="oldUi" type="checkbox" />
        旧版 UI（ui-style="old"）
      </label>
      <button @click="$refs.viewer.open({ url: src })">重新打开</button>
    </div>
    <PdfViewerElement
      ref="viewer"
      :src="src"
      :page="page"
      lang="zh-CN"
      l10n-url="/element/locale/"
      worker-src="/element/pdf.worker.mjs"
      c-map-url="/element/cmaps/"
      standard-font-data-url="/element/standard_fonts/"
      wasm-url="/element/wasm/"
      sandbox-bundle-src="/element/pdf.sandbox.mjs"
      :ui-style="oldUi ? 'old' : 'new'"
      height="600px"
      @pdfjs-pagechanging="onViewerEvent('pagechanging', $event)"
      @pdfjs-pagerendered="onViewerEvent('pagerendered', $event)"
      @pdfjs-documentloaded="onViewerEvent('documentloaded', $event)"
      @pdfjs-documentloadfailed="onViewerEvent('documentloadfailed', $event)"
    />
    <pre class="log">{{ log.join("\n") }}</pre>
  </div>
</template>

<style>
body {
  margin: 0;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: system-ui, sans-serif;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
}

.hint {
  font-size: 13px;
  opacity: 0.8;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.controls button {
  padding: 4px 10px;
}

.log {
  font-size: 12px;
  background: #252526;
  border: 1px solid #454545;
  border-radius: 6px;
  padding: 8px;
  min-height: 40px;
}
</style>
