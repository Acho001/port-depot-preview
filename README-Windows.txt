Port Depot v0.5.1 — Windows x64 本地桌面测试版
内部构建：2026.10.01.1 / 安装器版本：1.1.1

适用：Windows 10 / Windows 11，64 位 x64。
不提供 Windows 7/8、32 位或原生 ARM64 版本。

安装与升级
1. 下载 Port-Depot-v0.5.1-Windows-x64-Setup.exe。
2. 双击安装器，选择中文或 English，按引导选择安装目录及快捷方式。
3. 从开始菜单或桌面启动 Port Depot。
4. 升级时关闭 Port Depot，再运行新版安装器即可。

安装包完整离线，使用标准 NSIS 安装器；无需系统 Python、Node.js、
外部压缩软件或管理员权限。首次打开是独立桌面窗口。
未采用 Authenticode 证书签名；首次启动如有 Windows 安全提示，请核对
本仓库下载来源与 SHA256SUMS-Windows.txt 中的校验值。

本地数据
%LOCALAPPDATA%\Port Depot Data
项目与素材使用此目录的 assets\library；旧版 storage\library 会自动
迁移兼容，不需要符号链接或开发者模式。旧文件保留，现有文件优先。
升级、标准卸载均保留用户数据；备份请完整复制 Port Depot Data 目录。
不要把项目存储在安装目录里。

Windows 操作
- Ctrl+C / Ctrl+V：画布复制粘贴；文件复制支持 Windows 文件剪贴板。
- 文件复制到资源管理器或其他应用时，粘贴支持取决于目标应用。
- 文件和项目 ZIP / 解压后的项目文件夹可以拖入画布。
- 默认全局 Ctrl+Alt+S：截图保存到采集港，设置中可重新绑定。
- 画布内截图工具可框选裁剪。
- 原生文件选择和项目 ZIP 导出对话框；在资源管理器中显示素材。
- 中文 / English / 跟随系统；明暗主题和窗口状态会保存。

宠物功能未包含在 Windows 版本中：无宠物窗口、设置入口或宠物资源。
软件仅附 10 张入门指南画板和空采集库，无个人项目、上传素材或账号。
新版 Canvas Agent Skill 位于入门指南第 05 章，也可单独从 Releases 下载。

诊断
后台日志：%LOCALAPPDATA%\Port Depot Data\backend.log
服务地址：%LOCALAPPDATA%\Port Depot Data\runtime.json（软件运行时生成）
正常优先使用 http://127.0.0.1:8765；端口被占用时选择空闲端口。
AI Agent 在端口变化后应读取 runtime.json，并把 url 传给 Skill 的 --base。
应用退出时会停止自己的后台，不会终止其他 Python 程序。

发行与验证
https://github.com/Acho001/port-depot-preview/releases
验证范围以随包 Windows-validation.json 为准；自动化 Windows 验证不能
替代每一台用户电脑、每一种显示器组合和外部聊天软件的实机验收。
许可（2026-10-01 更新）
Port Depot 采用 PolyForm Noncommercial License 1.0.0：非商业用途免费使用；
不在许可证允许范围内的商业用途须事先取得权利人的单独授权。
许可证：https://github.com/Acho001/port-depot-preview/blob/main/LICENSE
商业授权联系：https://github.com/Acho001/port-depot-preview/issues
本声明适用于自许可变更起提供的应用二进制发行物和当前主分支的 Skill。
历史 ZIP 和安装包内已按 MIT 发布的 Skill 文件继续适用其随附的 MIT 许可。
第三方组件保留各自许可；用户自己的项目、素材和导出内容不因此受本许可约束。
应用源代码尚未公开；具体允许用途及其他条件以英文许可证原文为准。

可信时间戳存证信息（项目维护者提供）
证书编号：TSA-01-20261001184483245
时间戳认证码：F940563D6514D6762259347A97451217904A33B0D3D1F9F401D106DAB97BA637
时间戳签发时间：2026-10-01 17:18:39 (UTC+8)
具体认证文件及范围以认证证书和对应原始文件为准；使用授权仍按上述许可证执行。
