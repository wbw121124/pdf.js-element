# 定制与裁剪说明

本文档记录本分支相对 Mozilla PDF.js 做的所有改动，帮助后续维护者理解差异。

## 目标

打造一个**纯只读**的 PDF 查看器：保留浏览、选择、搜索、导航等基础能力，移除一切
编辑与文档结构修改能力，并应用 VSCode Dark Plus 深色主题。

## 功能裁剪总览

| 类别 | 被移除的内容 | 涉及文件 |
| --- | --- | --- |
| 注释编辑 | 注释（评论/便签）、签字、高亮、自由文本、手绘、图章编辑器 | `media/`、`web/`、`src/display/editor/` |
| 打印 | 打印按钮、打印流程、打印容器 | `web/viewer.html`、`web/app.js`、`web/pdf_print_service.js`、`web/print_utils.js` |
| 保存/下载 | 下载按钮、DownloadManager 集成 | `web/app.js`、`web/download_manager.js` |
| 缩略图选择 | 页面勾选（复选框）、批量选中状态 | `web/pdf_thumbnail_view.js`、`web/pdf_thumbnail_viewer.js` |
| 页面管理 | 复制/剪切/删除/导出页面、合并/拆分、拖拽排序、粘贴模式、撤销栏、状态栏 | `web/pdf_thumbnail_viewer.js`、`web/views_manager.js`、`web/views_manager.css` |
| 结构调整 | `hasStructuralChanges`、`onPagesEdited` 事件链路 | `web/pdf_viewer.js`、`web/pdf_find_controller.js`、`web/toolbar.js` |

### 移除后的保留项

- PDF 解析与渲染（`src/core/`、`src/display/`）
- 文本层（选择、复制）
- 查找（Find，含匹配高亮与跳转）
- 缩放、旋转、页面导航、演示模式、定位到页
- 侧边栏：缩略图（只读）、书签大纲、附件
- 打开文件

## 应用层改动详解（web/）

### viewer.html

- 移除顶部工具栏中的打印、保存/下载按钮及分隔符
- 移除侧边栏缩略图区底部的「添加文件 / 合并文档」入口
- 移除缩略图管理状态栏整个区块：
  `viewsManagerStatusLabel`、取消全选按钮、操作菜单（复制/剪切/删除/导出）、
  撤销栏、警告栏、等待栏
- 移除 `#printContainer` 打印容器

### viewer.js

- 移除 `viewsManagerAddFile`、`viewsManagerStatus`、`viewsManagerStatusBar`、
  `viewsManagerUndoBar`、`viewsManagerWaitingBar`、`manageMenu` 等 DOM 引用

### pdf_page_view.js

- 移除全部 `#commentManager` / `annotationEditorUIManager` 私有字段与相关代码
- 在 `#renderAnnotationEditorLayer()` 与 `#renderDrawLayer()` 中增加空值保护，
  防止编辑器层缺失时崩溃
- 保留 `downloadManager` 参数（传递 `null`，经可选链安全处理）

### pdf_thumbnail_viewer.js

**完全重写为只读版本**。删除：

- 管理状态字段（`#selectedPages`、`#pagesMapper`、`#managePageButton` 等十余项）
- 全部管理方法：`#mergeFiles`、`#saveExtractedPages`、`#copyPages`、`#cutPages`、
  `#pastePages`、`#deletePages`、`#undo`、`#updateStatus`、`#toggleMenuEntries`、
  `#updateMenuEntries`、`#togglePasteMode`、`#toggleBar`、`#selectPage` 等
- 拖拽排序（`#addDragListeners`、`#moveDraggedContainer`、`#positionDragMarker`、
  `#findClosestThumbnail` 等）与外置文件拖放合并
- 复制/剪切/粘贴/删除的键盘快捷键

保留：

- 缩略图渲染、`scrollThumbnailIntoView`、`forceRendering`、`cleanup`
- 键盘导航（PageUp/PageDown/Home/End）与点击跳页

### pdf_thumbnail_view.js

- 移除复选框创建与 `toggleSelected()`
- 移除粘贴模式占位按钮（`addPasteButton` / `removePasteButton`）
- 移除 `enableSplitMerge` 构造参数
- 在 `toggleCurrent()`、`setPageLabel()`、`clone()` 中移除复选框相关逻辑

### views_manager.js

- 移除 `enableMerge` / `enableSplitMerge` 构造参数
- 移除 `viewsManagerStatus`、`viewsManagerAddFile` 相关逻辑与隐藏逻辑

### app.js

- 移除打印/下载：`_initializeAutoPrint` 及其调用、`DownloadManager` 导入与实例化、
  `supportsDownloading` 逻辑
- 移除 `enableMerge` / `enableSplitMerge` / `enableNewBadge` 初始化参数
- 移除 `onPagesEdited` 方法及 `pagesedited` 事件绑定
- 移除 MOZCENTRAL 专属的 `editingstateschanged` 监听
- `_hasChanges()` 简化为仅检查 `annotationStorage`
- 从 `PDFOutlineViewer` / `PDFAttachmentViewer` 构造参数中移除 `downloadManager`

### app_options.js

- 移除 `enableMerge`、`enableSplitMerge`、`enableNewBadge` 选项
- 移除打印相关选项（依据构建裁减）
- `viewerCssTheme` 默认值改为 `2`（深色），见主题章节

### 其他

- `pdf_viewer.js`：移除 `onPagesEdited` 及 `#copiedPageViews` / `#savedPageViews` /
  `#deletedPageNumbers` 字段
- `pdf_find_controller.js`：移除 `#onPagesEdited` 及 `#copiedPageData` /
  `#savedPageData`
- `toolbar.js`：移除 `pagesedited` 监听
- `firefoxcom.js`：移除 `editingaction` 监听与 `updateEditorStates`
- `external_services.js`：移除 `updateEditorStates`

## 模块移除 / 桩（Stub）

以下原始模块被删除，为防止残余引用崩溃以空实现顶替：

| 文件 | 当前状态 |
| --- | --- |
| `web/download_manager.js` | 空实现 stub |
| `web/base_download_manager.js` | 空实现 stub |
| `web/annotation_editor_layer_builder.js` | 保留 `render/cancel/div` 空实现 |
| `web/draw_layer_builder.js` | 保留 `render/cancel/getDrawLayer` 空实现 |
| `web/generic_signature_storage.js` | 空实现 stub |
| `src/display/editor/editor.js` | 空实现 stub |
| `web/comment_manager.css` | 删除 |
| `web/signature_manager.css` | 删除 |

## 主题：VSCode Dark Plus

将查看器全部 CSS 的**深色分支**（`light-dark()` 第二参数）替换为
VSCode Dark Plus 配色，并默认启用深色。

### 关键颜色

| 用途 | 色值 | CSS 变量 |
| --- | --- | --- |
| 编辑器背景（主内容区） | `#1e1e1e` | `--body-bg-color` |
| 工具条背景 | `#3c3c3c` | `--toolbar-bg-color` |
| 侧边栏背景 | `#252526` | `--views-manager` 域 |
| 输入框背景 | `#3c3c3c` | `--field-bg-color` |
| 菜单 / 气泡背景 | `#252526` | `--doorhanger-bg-color` |
| 前景文字 | `#d4d4d4` | `--main-color` 等 |
| 次级文字 | `#989898` | `--text-secondary-color` |
| 边框 / 分隔线 | `#454545` | `--toolbar-border-color` 等 |
| 焦点链接 / 强调 | `#3794ff` | `--focus-ring-color` |
| 选中态（按钮/激活项） | `#264f78` | `--toggled-btn-bg-color` |
| 激活列表选中（树/大纲） | `#04395e` | `--treeitem-selected-bg-color` |
| 文本选中背景 | `#264f78` | `::selection` |

### 改动方式

- 脚本批量替换了 `buttons.css`、`menu.css`、`dialog.css`、`sidebar.css`、
  `tree.css`、`toggle_button.css`、`message_bar.css`、`viewer.css`、
  `pdf_viewer.css`、`views_manager.css`、`digital_signature_properties.css` 中
  `light-dark()` 的深色值。
- 保留 `light-dark()` 机制，因此浅色分支不受影响；工具条/侧栏开关仍可用于切换。
- 因默认启用深色，将 `app_options.js` 中 `viewerCssTheme` 默认值由
  `0`(auto) 改为 `2`(dark)。
- 文本选中背景在 `text_layer_builder.css` 中显式声明为
  `light-dark(rgba(0 0 255 / 0.25), #264f78)` 并加 `!important`。

> 说明：`viewer-geckoview.css`、`debugger.css` 不在批量替换范围内（分别用于
> GECKOVIEW 目标与调试），如需要请人工同步。

## 新增功能：`<pdf-viewer-element>` 自定义元素

在原有查看器之外，本分支新增了一个可嵌入的自定义元素 `<pdf-viewer-element>`，
用于在任意页面中嵌入一个或多个独立、自包含的 PDF 查看器实例。

### 源码与构建

- 源码位于 `element/`：`pdf-viewer-element.js`（元素实现）、
  `viewer_template.js`（查看器 DOM 模板，**由 `gulp element` 从
  `web/viewer.html` 自动生成**）、`demo.html`（双实例演示页）。
- 构建命令：`npx gulp element`，产物输出到 `build/generic/element/`：
  - `pdf-viewer-element.mjs` — 元素 bundle（自包含 PDF.js 库，无需
    `globalThis.pdfjsLib` 垫片，通过 webpack alias 直接引用 `src/pdf.js`）
  - `pdf-viewer-element.css` — 作用域化查看器 CSS（见下文）
  - `pdf.worker.mjs` / `pdf.sandbox.mjs` 及 `cmaps/`、`iccs/`、
    `standard_fonts/`、`wasm/`、`images/` 等运行资源
  - `demo.html` — 演示页
- 演示：把 `build/generic/element/` 部署到静态服务器后访问 `demo.html`；
  开发时启动 `gulp server` 后直接访问
  `http://localhost:8888/element/demo.html`（服务器将该路径映射到
  `build/generic/element/`，见 `gulpfile.mjs` 的 `server` 任务与
  `test/webserver.mjs` 的 `aliases` 选项）；修改 `element/`、
  `web/viewer.html`、`web/viewer.css` 会自动触发重建。

### 实现要点

- 多实例：每个实例创建独立的 viewer 应用（`createPDFViewerApplication`），
  DOM 使用实例前缀 id（如 `pdfjs-element-0-mainContainer`），并给每个带
  id 的元素补上同名 class，供作用域化 CSS 使用。
- CSS 作用域：`gulpfile.mjs` 中的 `scopeCSSForElement()` PostCSS 插件将
  `:root`/`html`/`body` 选择器替换为 `.pdfjs-element`，所有 `#id` 选择器
  替换为 `.class` 选择器（顶层规则加 `.pdfjs-element` 前缀以保持原 ID
  选择器的特异性，避免与同元素上的普通类选择器冲突）。
- 响应式：视口宽度的 `@media (max-width: Npx)` 查询改为按 *元素* 宽度
  切换的 `pdfjs-element-narrow-N` 类（由元素内的 ResizeObserver 维护）。
- 侧栏：`viewsManager` 打开时覆盖在页面上（页面不让出宽度，`#viewerContainer`
  的 `inset-inline-start` 恒为 0）；`--viewer-container-height` 与
  `--viewsManager-width` 等变量按实例写入各自 `.pdfjs-element` 根元素。
- 嵌入行为：`app.js` 中新增 `isViewerElement` 分支，避免修改宿主页面的
  `html` 样式/`dir` 属性；视图历史通过 `viewHistoryPrefix` 按实例隔离。
- 属性：`src`、`page`、`zoom`，以及资源覆盖属性（`worker-src`、
  `c-map-url`、`standard-font-data-url`、`wasm-url`、`sandbox-bundle-src`）。
- 语言：`lang` 指定界面语言（如 `zh-CN`），`l10n-url` 指定语言文件目录
  （需含 `locale.json` 与 `*.ftl`）；构建产物 `build/generic/element/locale/`
  已内置 `en-US` 与 `zh-CN`，演示页将 `l10n-url` 指向 `locale/` 即可使用。
  注意：同一页面只能使用一个语言目录（以第一个设置 `l10n-url` 的元素为准）。
- 方法：`open` / `close` / `nextPage` / `previousPage` / `firstPage` /
  `lastPage` / `gotoPage` / `zoomIn` / `zoomOut` / `zoomReset` / `setZoom` /
  `rotateCW` / `rotateCCW`。
- 事件：viewer 事件以 `pdfjs-*` 前缀 CustomEvent 重新派发（如
  `pdfjs-pagechanging`、`pdfjs-pagerendered`），原始数据在 `detail` 中。

### 模板自动生成

`element/viewer_template.js` 由 `gulp element` 任务自动生成：对
`web/viewer.html` 做 GENERIC 预处理后提取 `<body>` 内容，写入模板字符串。
若 `web/viewer.html` 的标记发生变化，重新执行 `npx gulp element` 即可同步。

### 新/旧 UI 样式（`ui-style` 属性）

`<pdf-viewer-element>` 支持 `ui-style="new"`（默认，现代化 UI）与
`ui-style="old"`（旧版扁平 UI）两种样式，运行中修改属性会立即生效。

现代化改造（`web/viewer.css`）全部由 CSS 变量驱动，如
`--toolbar-height`、`--toolbarButton-border-radius`、`--field-border-radius`、
`--menu-border-radius`、`--button-transition`、`--button-focus-outline`、
`--field-focus-box-shadow`、`--button-hover-icon-opacity`、
`--toolbar-separator-height`、`--toolbar-separator-margin`、
`--split-separator-height`、`--doorhanger-box-shadow`、`--page-number-width`
等；"旧"模式仅通过 `element/pdf-viewer-element-old-ui.css` 覆盖
`.pdfjs-element[data-ui-style="old"]` 上的变量值（构建时由 gulpfile 的
`appendElementOldUiCSS()` 追加到 `pdf-viewer-element.css` 末尾）。
独立查看器（generic）恒为新样式。
## 构建命令备忘

| 场景 | 命令 |
| --- | --- |
| 日常验证（推荐） | `npx gulp dist` |
| 现代浏览器版本 | `npx gulp generic` |
| 启动开发服务器 | `npx gulp server` |
| 代码检查 | `npx gulp lint` |

## 回归测试建议

- 打开多页 PDF：缩略图正常渲染、可点击跳页、无复选框与底部管理栏
- 工具栏：无打印/保存/下载按钮；顶部无编辑类工具按钮
- 文本选择与搜索：`::selection` 在深色下显示 `#264f78` 高亮
- 侧边栏：大纲/附件正常，附件不再提供下载入口
- 刷新 / 关闭标签页时不弹出「有更改未保存」提示（结构修改功能已移除）