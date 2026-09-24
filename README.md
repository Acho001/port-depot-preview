# Port Depot

### 完全本地化的无限画布文件管理与创意采集工作台

**公开测试版 · v0.5 · macOS 13+ · Apple 芯片**

Port Depot 是在传统的文件资源整理库的基础上增加创意构思与关联放在同一张无限画布上。你可以用文件节点汇集素材，用文件夹画板组织项目层级，再通过批注和关系连线展示想法、过程与关联。
结合配套的skill可以借助ai工具进行快速直观的资源整理。

#### 核心卖点

- **从“找文件”变成“看关系”**：文件不再只是列表里的条目，而是可以摆放、分组、连线的画布节点；项目脉络一眼可见。
- **素材与思路在同一处**：把图片、视频、音频、文本等素材和说明、批注放在一起，减少在文件夹与笔记之间来回切换。
- **采集后还能继续组织**：通过采集港收集素材，再将其放入画布，形成从灵感收集到项目编排的连续工作流。
- **项目可带走，也便于 Agent 处理**：导出保留文件夹层级、画板 JSON 和素材；随附 Skill 为 AI Agent 提供按规范创建、修改项目的工作方式。

技术实现和架构概览见[《Port Depot 技术报告》](TECHNICAL_OVERVIEW.md)。

#### 你可以用它

- 实时快速的创意采集-支持截图直接保存进待分配区的“采集港”随时随地保存创意。
- 在无限画布上整理图片、视频、音频、文本和其他项目文件。
- 用文件夹节点进入子无限画板，并以编组、批注和关系连线组织信息。
- 将文件收集到采集港，再从素材库管理和回看。
- 导出项目文件夹及画板 JSON，供备份、传递或 AI Agent 编排。
- 使用随附的 Port Depot Canvas Agent Skill，根据结构化 JSON 自动创建和检查画板项目。

#### 下载

前往 [GitHub Releases](https://github.com/Acho001/port-depot-preview/releases) 下载：

- `Port-Depot-0.5.dmg` — macOS 安装镜像。
- `PortDepot-Canvas-Agent-Skill-v0.5.zip` — 可安装的画布自动化 Skill。

#### 安装

1. 下载并双击打开 DMG。
2. 将 **Port Depot** 拖入 **Applications（应用程序）** 文件夹。
3. 从应用程序文件夹启动 Port Depot。

这是测试阶段的临时签名版本，尚未使用 Developer ID 签名或 Apple 公证。macOS 首次打开时可能显示安全提示；请先确认安装包来自本仓库的 Releases 页面，再按系统提示操作。

#### 测试阶段说明

当前发布阶段标记为 **v0.5**。Port Depot 仍在持续优化，后续将继续改进画布交互、文件采集、导入导出、稳定性和整体使用体验。欢迎通过 [GitHub Issues](https://github.com/Acho001/port-depot-preview/issues) 提交问题与建议。

本次 GitHub 测试发布标签为 v0.5；安装包内 macOS 应用的内部版本字段目前仍显示为 1.0。

#### 开源范围与许可

本仓库公开提供 macOS 测试安装包和 Port Depot Canvas Agent Skill。应用安装包是二进制测试发行物，不包含 Port Depot 应用源代码；Skill 的 MIT 许可仅适用于 `portdepot-canvas-agent/` 目录中的 Skill 文件。

---

### Infinite-canvas file management and creative workspace

**Public test release · v0.5 · macOS 13+ · Apple silicon**

Port Depot brings file organization and creative thinking onto one infinite canvas. Gather assets as file nodes, arrange project hierarchy with folder canvases, and communicate ideas and relationships through annotations and labeled connections.

#### Why Port Depot

- **See relationships, not just filenames**: place, group, and connect files as canvas nodes so the shape of a project is visible at a glance.
- **Keep assets and thinking together**: combine images, video, audio, text, notes, and annotations in one workspace instead of switching between folders and notes.
- **A continuous capture-to-work flow**: collect material in the Collection Harbor, then bring it onto the canvas to develop an idea into an organized project.
- **Portable and agent-ready projects**: exports preserve folder hierarchy, canvas JSON, and assets; the included Skill gives AI agents a documented way to create and edit projects.

See [Technical Overview](TECHNICAL_OVERVIEW.md) for a plain-language description of the product architecture.

#### What you can do

- Organize images, video, audio, text, and other project files on an infinite canvas.
- Navigate child canvases with folder nodes, and structure information with groups, annotations, and relationship lines.
- Collect files in the Collection Harbor, then manage and revisit them in the asset library.
- Export project folders and canvas JSON for backup, handoff, or AI-agent editing.
- Use the included Port Depot Canvas Agent Skill to create and audit canvas projects from structured JSON.

#### Downloads

Visit [GitHub Releases](https://github.com/Acho001/port-depot-preview/releases) for:

- `Port-Depot-0.5.dmg` — the macOS installer image.
- `PortDepot-Canvas-Agent-Skill-v0.5.zip` — the installable canvas automation skill.

#### Install

1. Download and open the DMG.
2. Drag **Port Depot** to **Applications**.
3. Launch Port Depot from Applications.

This is a test build with an ad-hoc signature. It has not been signed with a Developer ID or notarized by Apple. macOS may show a security prompt on first launch. Confirm that the installer came from this repository's Releases page before following the system prompt.

#### Test release

The current public test release is labeled **v0.5**. Port Depot is still evolving; upcoming work will continue to improve canvas interactions, file collection, import and export, stability, and the overall experience. Please report issues and suggestions through [GitHub Issues](https://github.com/Acho001/port-depot-preview/issues).

The GitHub test-release label is v0.5. The macOS application bundle inside this installer currently reports an internal version of 1.0.

#### Open-source scope and license

This public repository provides the macOS test installer and the Port Depot Canvas Agent Skill. The application installer is a binary test distribution and does not include Port Depot application source code. The MIT license applies only to the Skill files in `portdepot-canvas-agent/`.
