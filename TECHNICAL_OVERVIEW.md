# Port Depot 技术报告

## 用通俗的话说

Port Depot 是一款在本机运行的桌面软件。它把“桌面应用外壳”“画布界面”“本机服务”和“项目文件”组合在一起：你在画布上拖放、连接和整理内容，界面把操作交给本机服务处理，服务再把画板与素材保存到电脑上的项目目录。

## 主要技术

- **桌面外壳**：macOS 版使用 Swift 和 Apple 的 Cocoa 桌面框架；Windows 版使用 Electron。它们负责窗口、系统文件拖放、截图快捷操作、文件选择等桌面能力。
- **画布界面**：使用 HTML、CSS 和原生 JavaScript 编写，并通过 WebView 显示。界面由多个 JavaScript 模块协作处理画板、节点、文件和交互，不依赖 React 或 Vue。
- **本机服务**：使用 Python、FastAPI 和 Uvicorn 提供本机 HTTP 接口；需要实时状态更新时使用 WebSocket。桌面界面通过这些接口读取或修改项目。
- **项目存储**：以文件和 JSON 为主。每张画板的节点、位置、关系等结构化信息写入 `canvas.json`，素材以普通文件保存在项目目录中。
- **打包**：Python 后端及运行依赖随桌面应用一同打包；macOS 使用应用包与 DMG 分发，Windows 端使用 Electron 应用包。

## 架构是怎样配合的

```text
用户操作
   ↓
桌面应用外壳（macOS：Swift/Cocoa；Windows：Electron）
   ↓
画布界面（HTML + CSS + JavaScript）
   ↓ 本机 HTTP API / WebSocket
Python 服务（FastAPI + Uvicorn）
   ↓
项目文件夹（canvas.json + 图片、视频、音频等素材）
```

举例来说，用户把一个图片拖到画布上时，桌面外壳接收系统拖放事件，画布界面决定节点放置位置，本机服务接收保存请求，最后把图片文件和对应的节点数据写入项目。重新打开项目时，应用再从 JSON 和素材文件恢复画面。

## 为什么采用这种设计

1. **桌面软件保留系统操作能力**：原生外壳便于接入文件拖放、截图和文件选择等系统功能。
2. **界面与数据处理分工**：画布界面专注于呈现和交互，Python 服务负责项目读取、保存、素材管理以及导入导出。
3. **项目内容直观、便于搬运**：文件夹、JSON 和素材构成一个可检查的项目结构，导出时可以一起打包。Canvas Agent Skill 也依据这套 JSON 结构来指导自动化创建和修改。
4. **本机优先**：服务面向本机桌面应用运行，项目数据保存在本机目录；当前版本不是云端协作服务。

## 需要了解的边界

- 本报告描述的是当前产品实现，不代表所有平台的功能和打包状态完全相同。
- 当前公开 v0.5 安装包面向 Apple 芯片 Mac；仓库此次发布不包含 Windows 安装包，也不包含应用源代码。
- 公开测试版仍在迭代中，文件格式或交互细节未来可能继续改进。重要项目请自行保留备份。

---

# Port Depot Technical Overview

## In plain language

Port Depot is a desktop app that runs on your computer. It combines a desktop shell, a canvas interface, a local service, and project files. You arrange and connect content on the canvas; the interface sends those actions to the local service, which stores boards and assets in folders on your computer.

## Main technologies

- **Desktop shell**: the macOS app uses Swift and Apple's Cocoa framework; the Windows app uses Electron. The shell handles windows and desktop capabilities such as file drops, screenshot shortcuts, and file pickers.
- **Canvas interface**: HTML, CSS, and plain JavaScript, displayed in a WebView. JavaScript modules handle boards, nodes, files, and interaction. The interface is not built with React or Vue.
- **Local service**: Python with FastAPI and Uvicorn provides local HTTP endpoints, with WebSocket support for live status updates. The desktop interface uses these endpoints to read and update projects.
- **Project storage**: primarily files and JSON. Each board's nodes, positions, and relationships are stored in `canvas.json`; assets remain regular files in the project folders.
- **Packaging**: the Python backend and its runtime dependencies are bundled with the desktop app. macOS is distributed as an app bundle and DMG; the Windows implementation uses an Electron package.

## How the pieces fit together

```text
User action
   ↓
Desktop shell (macOS: Swift/Cocoa; Windows: Electron)
   ↓
Canvas UI (HTML + CSS + JavaScript)
   ↓ local HTTP API / WebSocket
Python service (FastAPI + Uvicorn)
   ↓
Project folders (canvas.json + image, video, audio, and other assets)
```

For example, when you drop an image onto the canvas, the desktop shell receives the OS drop event, the canvas UI determines where the node belongs, and the local service saves the request. The image and its node data are stored in the project. When you reopen it, the app reconstructs the view from the JSON and asset files.

## Why this design

1. **Keep desktop capabilities**: a native shell makes it practical to integrate system file drops, screenshots, and file pickers.
2. **Separate presentation from project handling**: the canvas UI focuses on display and interaction, while the Python service handles project loading, saving, asset management, and import/export.
3. **Make projects inspectable and portable**: folders, JSON, and assets form a project structure that can be inspected and packaged together. The Canvas Agent Skill documents how automation can work with that JSON structure.
4. **Local-first**: the service is intended for the local desktop app and project data is stored locally; this is not a cloud collaboration service.

## Current boundaries

- This describes the current implementation; feature and packaging parity may differ by platform.
- The public v0.5 installer targets Apple-silicon Macs. This release does not include a Windows installer or the application's source code.
- This is a test release and file formats or interactions may evolve. Keep backups of important projects.
