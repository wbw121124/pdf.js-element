# PDF.js Viewer（定制版）

基于 [PDF.js](https://mozilla.github.io/pdf.js/) 定制的浏览器 PDF 查看器，只读浏览、无编辑功能。

> 本项目在 Mozilla PDF.js 基础上做了大量裁剪与定制，详见 [docs/CUSTOMIZATIONS.md](docs/CUSTOMIZATIONS.md)。

## 功能特性

- 只读 PDF 浏览与渲染（核心、显示基于 PDF.js 原生实现）
- 文本选择、文本搜索（Find）
- 缩放、旋转、页面导航、演示模式
- 侧边栏：缩略图（只读，无勾选/管理）、书签大纲、附件
- 打开文件、定位到页（Bookmark）
- 主题：VSCode Dark Plus 配色（默认深色）

## 已移除的功能（不可用）

- 所有编辑类功能：注释编辑器、签名、高亮、文本框、手绘、图章
- 打印、保存/下载
- 缩略图页面勾选（选择页面）
- 页面管理：复制 / 剪切 / 删除 / 导出 / 合并 / 拖拽排序 / 粘贴模式
- 结构修改（拆分、合并文档）相关的一切 UI 与代码

详细说明见 [docs/CUSTOMIZATIONS.md](docs/CUSTOMIZATIONS.md)。

## 环境要求

- Node.js（建议 LTS 版本，>= 18）
- npm
- 平台无关（本仓库在 Windows / Linux / macOS 均可构建）

## 安装

```bash
npm install
```

## 本地开发

```bash
npx gulp server
```

打开 http://localhost:8888/web/viewer.html 即可访问查看器。
测试 PDF 列表位于 http://localhost:8888/test/pdfs/?frame
嵌入组件演示位于 http://localhost:8888/element/demo.html

## 构建

### 构建现代浏览器版本（GENERIC）

```bash
npx gulp generic
```

输出位于 `build/generic/`，产物为：

- `build/generic/build/pdf.mjs` — PDF.js 主库
- `build/generic/build/pdf.worker.mjs` — Worker 线程脚本
- `build/generic/web/` — 完整查看器应用

### 构建发行包（pdfjs-dist）

```bash
npx gulp dist
```

生成 `build/dist/`（包含通用、legacy、压缩、组件等全部产物）。
最常用验证命令即为此。

### 构建嵌入组件 `<pdf-viewer-element>`

```bash
npx gulp element
```

输出位于 `build/generic/element/`，演示页为
`build/generic/element/demo.html`（同一页面可嵌入多个独立实例）。
源码见 `element/`，使用说明见 [docs/CUSTOMIZATIONS.md](docs/CUSTOMIZATIONS.md)。

### 其他构建目标

| 命令 | 说明 |
| --- | --- |
| `npx gulp lint` | 运行 ESLint 检查 |
| `npx gulp typestest` | 运行 TypeScript 类型检查 |
| `npx gulp unittest` | 运行单元测试（Jasmine） |
| `npx gulp test` | 运行全部测试 |

## 部署

把 `build/generic/` 目录完整部署到任意静态服务器即可，例如：

```bash
# 示例：将构建产物复制到静态站点目录
npx gulp generic
cp -r build/generic/web /var/www/pdf-viewer
```

访问 `http://<your-host>/pdf-viewer/viewer.html?file=...`

## 通过 URL 参数加载文档

查看器支持通过 `?file=` 参数指定 PDF 地址，例如：

```
http://localhost:8888/web/viewer.html?file=/path/to/doc.pdf
http://localhost:8888/web/viewer.html?file=https%3A%2F%2Fexample.com%2Fdoc.pdf
```

更多参数（如 `#page=5`、`#zoom=page-width`、`#search=关键词`）与官方 PDF.js 保持一致。

## 文档

- [docs/CUSTOMIZATIONS.md](docs/CUSTOMIZATIONS.md) — 详细的定制与裁剪说明
- 原版 [告示](../../../docs/contents/index.md) 或其他 PDF.js 文档参见官方仓库

## 许可

本定制版基于 Mozilla PDF.js，遵循 Apache License 2.0，详见 [LICENSE](https://github.com/mozilla/pdf.js/blob/master/LICENSE)。