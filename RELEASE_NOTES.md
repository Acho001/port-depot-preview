# Windows v0.5.1 · 2026.10.01.1 · 2026-10-01

## 中文

- 将最新画布交互、语言与主题设置、回收站体验带到 Windows 10/11 x64。
- 提供完整离线安装引导、桌面与开始菜单快捷方式、标准卸载；无需外部压缩软件、系统 Python 或浏览器。
- 修复旧封装依赖外部解压入口、使用旧前后端和向安装目录写数据的问题。
- 适配中文及带空格的安装/文件路径、Windows 文件剪贴板、Ctrl+C/Ctrl+V、资源管理器、原生导入和导出。
- 支持截图采集、裁剪及本地视频缩略图；全局截图快捷键可修改。
- 关闭软件时停止自己的后台；重复启动聚焦同一窗口。服务端口占用时自动避让，语言、主题与快捷键仍保留。
- 兼容旧 storage/library 数据目录，无需管理员权限或符号链接。覆盖升级、标准卸载保留用户项目和素材。
- Windows 版不提供宠物窗口、设置入口或资源。
- 只附 10 张入门指南画板、空采集库和最新版配套 Skill；没有个人项目、上传素材、账号配置或应用开发源码。

此发行物的 Windows 原生验证结果见 Release 附件 `Windows-validation.json`。验证运行在 Windows Server 2022 x64；不代表已测试每一台 Windows 10/11 用户电脑。安装器版本为 1.1.1，未使用 Authenticode 证书签名。请核对 SHA-256 和下载来源。

## English

- Brings the latest canvas interactions, language/theme preferences and trash experience to Windows 10/11 x64.
- Complete offline installer, desktop/Start menu shortcuts and standard uninstallation. No system Python, external browser or archive utility is needed.
- Fixes stale frontend/backend packaging, external extraction dependencies and writes to the installation directory.
- Supports Chinese paths, paths containing spaces, native file clipboard operations, Ctrl+C/Ctrl+V, Explorer and native import/export dialogs.
- Includes capture/cropping and local video thumbnails, configurable global capture shortcuts, single-instance activation and owned-backend shutdown.
- Handles occupied ports while retaining desktop preferences. Migrates older library layouts without symbolic links or administrator rights.
- Upgrades and standard uninstallation preserve user projects and media. Pets are excluded from the Windows package.
- Bundles ten onboarding canvases, an empty inbox and the latest companion Skill. Personal projects, uploads, credentials and application development sources are excluded.

Native validation results are attached as `Windows-validation.json`. Tests run on Windows Server 2022 x64; individual Windows 10/11 machines still need user acceptance. Installer version: 1.1.1. This test package is not Authenticode-signed; verify its source and SHA-256.

---

# v0.5.1 · 2026.09.30.1 · 公开测试更新 / Public test update

## 中文

- 设置重新分为通用、截图采集、桌宠三类；统一布局、开关和数值展示，改善小窗口适配及键盘焦点。
- 增加中文、English、跟随系统语言；首次安装读取系统首选语言列表中的首个支持语言，不修改用户内容。
- 回收站增加一键清空与二次确认，使用 ID 快照保护已恢复的画板。清理画板记录不意味着删除所有关联素材。
- 同步上一轮文件复制优化：复制文件及批量复制用于系统文件剪贴板；不同聊天软件是否接受文件粘贴取决于目标软件。
- 修复打包程序启动修改签名资源的问题；DMG 提供拖入 Applications 的安装引导，运行数据写入用户可写目录。
- 更新 Skill：运行时 API 发现、具体 ID 路由匹配、结构化编排、布局审计、可视化推理及安全备份规则；Python 适配器不依赖特定 AI 模型。
- 包内仅保留入门指南示例、空采集库和空默认项目；新版 Skill 放入指南的「05 导入导出与 Agent」。不含个人项目、上传素材、账号配置、备份或应用源代码。

验证：隔离启动、指南 10 张画板及空采集库、实际 ID API 调用、Skill 格式检查、签名完整性；设置/语言/回收站已做隔离交互回归测试。未声明 Intel 或 Windows 兼容。

## English

- Reorganized settings into General, Capture & collect, and Desktop pet, with consistent controls, responsive layout and keyboard focus handling.
- Added Chinese, English and system-language preferences. First launch selects the first supported system-preferred language; user content is preserved.
- Added confirmed bulk trash clearing using an ID snapshot, protecting restored canvases. Removing canvas records does not necessarily remove all media.
- Includes improved single and multi-file copying through the system file clipboard; destination apps determine paste support.
- Fixed startup modification of signed bundle resources. The DMG guides users to drag into Applications; runtime data uses writable user storage.
- Updated the Skill with live API discovery, concrete-ID route matching, structured composition, layout audits, visual reasoning and backup rules. Python adapters are model-independent.
- Bundles only the onboarding guide, empty collection library and empty default project. Updated Skill included in guide chapter 05. No personal projects, uploads, account configuration, backups or app source code.

Validated isolated startup, ten guide canvases plus empty inbox, concrete-ID API calls, Skill format and signature; settings/language/trash interaction regressions were tested in isolation. No Intel or Windows compatibility claim.

macOS 13+ / Apple silicon. Ad-hoc signed, not Apple-notarized. Skill MIT license only; app distributed as a test binary. Still being optimized: back up important projects and report problems through Issues.

---

## v0.5 archive

Port Depot v0.5 is a public test release. This package includes the macOS Apple-silicon installer and the Port Depot Canvas Agent Skill.

Port Depot is still being optimized. Future updates will continue to improve canvas interactions, file collection, import/export, stability, and the overall experience.

Port Depot's key idea is to turn file organization into a visual workspace: place assets on an infinite canvas, connect them with notes and relationships, collect material before organizing it, and export portable projects that can also be edited with the included Agent Skill.

Port Depot v0.5 是公开测试版，提供 Apple 芯片 Mac 安装包与 Port Depot Canvas Agent Skill。

软件仍处于持续优化阶段，后续会继续改进画布交互、文件采集、导入导出、稳定性与整体使用体验。

Port Depot 的核心卖点是把文件整理变成可视化工作空间：在无限画布上摆放素材，用批注和关系线呈现思路，先采集再编排，并导出可移交、可由随附 Agent Skill 辅助处理的项目。

The installer contains an ad-hoc signed, non-notarized app. The Skill is released under MIT; the application source code is not included in this release.

安装包内应用使用临时签名，尚未经过 Apple 公证。本次仅发布安装包和 Skill，不包含应用源代码；MIT 许可仅适用于 Skill。
