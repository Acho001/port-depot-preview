# Port Depot

### 完全本地化的无限画布文件管理与创意采集工作台

**公开测试版 · v0.5.2 · Windows 10/11 x64 · macOS 13+ Apple 芯片**

**非商业用途免费使用；商业用途需另行取得授权。** [查看许可证](LICENSE)

安装包：Windows `Port-Depot-v0.5.2-Windows-x64-Setup.exe`、macOS `Port-Depot-macOS-2026.10.07.2-clipboard-hotfix.zip`；Skill：`PortDepot-Canvas-Agent-Skill-v0.5.2.zip`。本次仅附入门指南，不包含个人项目和上传素材。[更新记录](RELEASE_NOTES.md)

Port Depot 是在传统的文件资源整理库的基础上增加创意构思与关联放在同一张无限画布上。你可以用文件节点汇集素材，用文件夹画板组织项目层级，再通过批注和关系连线展示想法、过程与关联。
结合配套的skill可以借助ai工具进行快速直观的资源整理。

复制粘贴统一使用系统剪贴板：复制节点提供真实文件，复制选中文字提供文字。外部文件拖入画板会实际移动到画板目录；撤销可恢复原位置。macOS 已补齐原生编辑菜单及 ⌘A／⌘C／⌘V，Windows 使用 Ctrl 快捷键。

#### 核心卖点

- **从“找文件”变成“看关系”**：文件不再只是列表里的条目，而是可以摆放、分组、连线的画布节点；项目脉络一眼可见。
- **素材与思路在同一处**：把图片、视频、音频、文本等素材和说明、批注放在一起，减少在文件夹与笔记之间来回切换。
- **采集后还能继续组织**：通过采集港收集素材，再将其放入画布，形成从灵感收集到项目编排的连续工作流。
- **项目可带走，也便于 Agent 处理**：导出保留文件夹层级、画板 JSON 和素材；随附 Skill 为 AI Agent 提供按规范创建、修改项目的工作方式。

#### 你可以用它

- 实时快速的创意采集-支持截图直接保存进待分配区的“采集港”随时随地保存创意。
- 在无限画布上整理图片、视频、音频、文本和其他项目文件。
- 用文件夹节点进入子无限画板，并以编组、批注和关系连线组织信息。
- 将文件收集到采集港，再从素材库管理和回看。
- 导出项目文件夹及画板 JSON，供备份、传递或 AI Agent 编排。
- 使用随附的 Port Depot Canvas Agent Skill，根据结构化 JSON 自动创建和检查画板项目。

#### 下载

前往 [GitHub Releases](https://github.com/Acho001/port-depot-preview/releases) 下载：

- [Windows x64 安装包](https://github.com/Acho001/port-depot-preview/releases/tag/v0.5.2-windows) — `Port-Depot-v0.5.2-Windows-x64-Setup.exe`。
- [macOS Apple 芯片应用包](https://github.com/Acho001/port-depot-preview/releases/tag/v0.5.2-windows) — `Port-Depot-macOS-2026.10.07.2-clipboard-hotfix.zip`。
- `PortDepot-Canvas-Agent-Skill-v0.5.2.zip` — 可安装的画布自动化 Skill。

#### 安装

**Windows**：双击 Setup.exe，选择语言和安装目录，完成后从桌面或开始菜单打开。无需系统 Python、浏览器、压缩软件或管理员权限。数据保存在 `%LOCALAPPDATA%\Port Depot Data`；升级及标准卸载保留数据。Windows 版暂不提供宠物功能。

这是未使用 Authenticode 证书签名的测试包，首次运行可能有 Windows 安全提示，请核对来源及 SHA-256。详细说明和原生 Windows 验证报告附在 Windows Release。

**macOS**：

1. 下载 ZIP 并解压，得到 **Port Depot.app**。
2. 将 **Port Depot** 拖入 **Applications（应用程序）** 文件夹。
3. 从应用程序文件夹启动 Port Depot。

这是测试阶段的临时签名版本，尚未使用 Developer ID 签名或 Apple 公证。macOS 首次打开时可能显示安全提示；请先确认安装包来自本仓库的 Releases 页面，再按系统提示操作。

#### 测试阶段说明

当前公开测试版为 **v0.5.2**。Port Depot 仍在持续优化，后续将继续改进画布交互、文件采集、导入导出、稳定性和整体使用体验。欢迎通过 [GitHub Issues](https://github.com/Acho001/port-depot-preview/issues) 提交问题与建议。

最新测试发布为 v0.5.2。Windows 与 macOS 内部构建均为 2026.10.07.2，安装器／应用版本均为 1.1.3。

#### 公开发行范围与许可

Port Depot 采用 [PolyForm Noncommercial License 1.0.0](LICENSE)：**非商业用途免费使用；不在许可证允许范围内的商业用途，须事先取得权利人的单独授权。** 商业授权事宜请通过 [GitHub Issues](https://github.com/Acho001/port-depot-preview/issues) 联系维护者。具体允许用途、复制、修改、分发及免责声明以英文许可证原文为准。

本许可适用于本仓库的项目自有文件、当前主分支的 [Port Depot Canvas Agent Skill](portdepot-canvas-agent/LICENSE)，以及自本次许可声明起提供的 Port Depot 应用二进制发行物。本仓库提供 Windows 和 macOS 测试安装包，尚未公开应用源代码。第三方组件仍按各自的许可证授权；用户自己的项目、素材和导出内容不因使用本应用而适用本许可证。

许可变更日期：**2026-10-01**。本次变更不撤销此前已授予的许可；历史 Release ZIP 和安装包内已明确按 MIT 发布的 Skill 文件继续适用其随附的 MIT 许可证。

PolyForm Noncommercial 是限制商业用途的源码可见许可证，不属于 OSI 定义的开源许可证。

##### 可信时间戳存证信息

| 项目 | 信息 |
| --- | --- |
| 证书编号 | `TSA-01-20261001184483245` |
| 时间戳认证码 | `F940563D6514D6762259347A97451217904A33B0D3D1F9F401D106DAB97BA637` |
| 时间戳签发时间 | 2026-10-01 17:18:39 (UTC+8) |

以上登记信息由项目维护者提供；具体认证文件及范围以认证证书和对应原始文件为准。本记录作为软件材料的存证说明，使用授权仍按上述许可证执行。

---

### Infinite-canvas file management and creative workspace

**Public test release · v0.5.1 · Windows 10/11 x64 · macOS 13+ Apple silicon**

**Free for noncommercial use; commercial use requires separate authorization.** [View license](LICENSE)

Installer assets: `Port-Depot-v0.5.1-Windows-x64-Setup.exe`, `Port-Depot-v0.5.1-macOS-arm64.dmg` and `PortDepot-Canvas-Agent-Skill-v0.5.1.zip`. Only the onboarding guide is bundled; personal projects and uploads are excluded. [Changelog](RELEASE_NOTES.md)

Port Depot brings file organization and creative thinking onto one infinite canvas. Gather assets as file nodes, arrange project hierarchy with folder canvases, and communicate ideas and relationships through annotations and labeled connections.

#### Why Port Depot

- **See relationships, not just filenames**: place, group, and connect files as canvas nodes so the shape of a project is visible at a glance.
- **Keep assets and thinking together**: combine images, video, audio, text, notes, and annotations in one workspace instead of switching between folders and notes.
- **A continuous capture-to-work flow**: collect material in the Collection Harbor, then bring it onto the canvas to develop an idea into an organized project.
- **Portable and agent-ready projects**: exports preserve folder hierarchy, canvas JSON, and assets; the included Skill gives AI agents a documented way to create and edit projects.

#### What you can do

- Organize images, video, audio, text, and other project files on an infinite canvas.
- Navigate child canvases with folder nodes, and structure information with groups, annotations, and relationship lines.
- Collect files in the Collection Harbor, then manage and revisit them in the asset library.
- Export project folders and canvas JSON for backup, handoff, or AI-agent editing.
- Use the included Port Depot Canvas Agent Skill to create and audit canvas projects from structured JSON.

#### Downloads

Visit [GitHub Releases](https://github.com/Acho001/port-depot-preview/releases) for:

- [Windows x64 installer](https://github.com/Acho001/port-depot-preview/releases/tag/v0.5.1-windows) — `Port-Depot-v0.5.1-Windows-x64-Setup.exe`.
- [macOS Apple-silicon installer](https://github.com/Acho001/port-depot-preview/releases/tag/v0.5.1) — `Port-Depot-v0.5.1-macOS-arm64.dmg`.
- `PortDepot-Canvas-Agent-Skill-v0.5.1.zip` — the installable canvas automation skill.

#### Install

**Windows**: run Setup.exe and choose the language and installation folder. Launch from the desktop or Start menu. Python, an external browser, archive tools, and administrator rights are not required. User data lives in `%LOCALAPPDATA%\Port Depot Data` and is retained by upgrades and standard uninstallation. Pets are excluded from this Windows release.

This test installer is not Authenticode-signed. Verify its origin and SHA-256 if Windows displays a security prompt. Installation instructions and the native Windows validation report accompany the Windows Release.

**macOS**:

1. Download and open the DMG.
2. Drag **Port Depot** to **Applications**.
3. Launch Port Depot from Applications.

This is a test build with an ad-hoc signature. It has not been signed with a Developer ID or notarized by Apple. macOS may show a security prompt on first launch. Confirm that the installer came from this repository's Releases page before following the system prompt.

#### Test release

The current public test release is **v0.5.1**. Port Depot is still evolving; upcoming work will continue to improve canvas interactions, file collection, import and export, stability, and the overall experience. Please report issues and suggestions through [GitHub Issues](https://github.com/Acho001/port-depot-preview/issues).

Latest test release: v0.5.1. Windows build: 2026.10.01.1, installer version 1.1.1. macOS build: 2026.09.30.1, bundle version 1.1.0.

#### Public distribution scope and license

Port Depot uses the [PolyForm Noncommercial License 1.0.0](LICENSE): **noncommercial use is free; commercial purposes outside the license's permitted uses require prior, separate authorization from the rights holder.** Contact the maintainer through [GitHub Issues](https://github.com/Acho001/port-depot-preview/issues) about commercial licensing. The English license text governs permitted purposes, copying, modification, distribution, and disclaimers.

This license covers project-owned files in this repository, the [Port Depot Canvas Agent Skill](portdepot-canvas-agent/LICENSE) on the current main branch, and Port Depot application binaries offered from this licensing notice onward. This repository provides Windows and macOS test installers; application source code is not currently published. Third-party components retain their own licenses. Users' own projects, assets, and exports do not become subject to this license merely through use of the application.

License change date: **2026-10-01**. This change does not revoke previously granted licenses. Skill files explicitly released under MIT in historical Release ZIPs and installers remain under their bundled MIT license.

PolyForm Noncommercial is a source-available license restricting commercial use, rather than an open-source license under the OSI definition.

##### Trusted timestamp record

| Field | Value |
| --- | --- |
| Certificate number | `TSA-01-20261001184483245` |
| Timestamp authentication code | `F940563D6514D6762259347A97451217904A33B0D3D1F9F401D106DAB97BA637` |
| Timestamp issued at | 2026-10-01 17:18:39 (UTC+8) |

These registration details were supplied by the project maintainer. The certified files and scope are determined by the certificate and its corresponding original files. This record documents the timestamp evidence for the software materials; usage rights remain governed by the license above.
