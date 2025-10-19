# Memos - Electron桌面应用

一个基于Electron的桌面应用，支持地址管理和智能导航功能。应用会记住你最后使用的网址，下次启动时自动打开。

## ✨ 功能特性

- 🔗 **智能地址管理**: 自动记住最后使用的网址
- 📚 **历史记录**: 保存所有访问过的地址，支持快速切换
- 🔍 **搜索功能**: 在地址管理页面快速搜索历史地址
- ⌨️ **快捷键支持**:
  - `Cmd+T` (macOS) / `Ctrl+T` (Windows/Linux): 切换地址
  - `Cmd+M` (macOS) / `Ctrl+M` (Windows/Linux): 地址管理
  - `Cmd+W` (macOS): 隐藏窗口而不退出应用
- 🎨 **现代化UI**: 基于React的美观界面
- 💾 **数据持久化**: 使用electron-store安全存储用户数据

## 🏗️ 项目结构

```
ele-memos/
├── src/                          # 主进程代码
│   ├── index.ts                  # Electron主进程入口
│   ├── addressStore.ts           # 地址数据存储管理
│   └── preload.ts                # 预加载脚本，暴露安全的API
├── renderer/                     # 渲染进程代码 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddressInput.tsx      # 地址输入组件
│   │   │   └── AddressManager.tsx    # 地址管理组件
│   │   ├── types/
│   │   │   └── electron.d.ts         # Electron API类型定义
│   │   ├── App.tsx                   # React主应用组件
│   │   ├── main.tsx                  # React应用入口
│   │   └── index.css                 # 全局样式
│   ├── index.html                # HTML模板
│   ├── vite.config.ts            # Vite构建配置
│   ├── package.json              # React项目依赖
│   └── tsconfig.json             # TypeScript配置
├── package.json                  # 主项目依赖和脚本
├── forge.config.ts              # Electron Forge配置
├── webpack.*.config.ts          # Webpack配置文件
└── tsconfig.json                # 主项目TypeScript配置
```

## 🛠️ 技术栈

### 主进程 (Electron)
- **Electron**: 跨平台桌面应用框架
- **TypeScript**: 类型安全的JavaScript
- **electron-store**: 数据持久化存储
- **Webpack**: 模块打包工具

### 渲染进程 (React)
- **React 19**: 现代化前端框架
- **TypeScript**: 类型安全开发
- **Vite**: 快速构建工具
- **CSS3**: 现代化样式设计

## 📋 开发环境要求

- **Node.js**: >= 16.0.0
- **Yarn**: >= 1.22.0 (推荐) 或 npm
- **操作系统**: macOS, Windows, 或 Linux

## 🚀 安装和设置

### 1. 克隆项目
```bash
git clone <repository-url>
cd ele-memos
```

### 2. 安装主项目依赖
```bash
yarn install
# 或
npm install
```

### 3. 安装渲染进程依赖
```bash
cd renderer
yarn install
# 或
npm install
cd ..
```

## 💻 开发命令

### 启动开发环境
```bash
# 启动Electron开发环境 (包含热重载)
yarn start

# 或使用npm
npm start
```

### 渲染进程单独开发 (可选)
```bash
# 在renderer目录下启动Vite开发服务器
cd renderer
yarn dev
```

### 代码检查
```bash
# 运行ESLint检查
yarn lint

# 或使用npm
npm run lint
```

## 📦 构建和打包

### 构建应用 (不打包)
```bash
# 构建所有代码但不创建安装包
yarn package

# 或使用npm
npm run package
```

### 创建安装包
```bash
# 为当前平台创建安装包
yarn make

# 为特定架构创建安装包
yarn make:x64    # Intel架构
yarn make:arm64  # Apple Silicon架构

# 或使用npm
npm run make
npm run make:x64
npm run make:arm64
```

### 发布

项目配备了完整的自动化发布系统，支持版本管理、CHANGELOG生成和跨平台构建。

```bash
# 🚀 快速发布（推荐）
npm run version:patch    # 升级补丁版本 (1.0.4 -> 1.0.5)
npm run version:minor    # 升级小版本 (1.0.4 -> 1.1.0)
npm run version:major    # 升级大版本 (1.0.4 -> 2.0.0)

# 🎯 交互式发布
npm run bump             # 友好的交互界面

# 👀 预览模式
npm run release:dry      # 预览发布操作
npm run changelog:preview # 预览CHANGELOG
```

详细使用说明请查看：
- [📖 发布脚本使用指南](scripts/README.md)
- [🚀 自动化发布系统概览](docs/RELEASE_SYSTEM.md)

## 📖 使用说明

### 首次启动
1. 启动应用后会显示地址输入页面
2. 输入你想要访问的网址 (支持自动添加https://)
3. 可选择为地址添加一个便于记忆的名称
4. 点击"确定"后应用会导航到该地址

### 再次启动
- 应用会自动记住上次使用的地址
- 启动后直接加载上次的网址，无需重新输入

### 地址管理
- 通过菜单 `Memo → 地址管理` 或快捷键打开
- 查看所有历史地址，按使用时间排序
- 支持搜索功能快速查找地址
- 可以删除不需要的历史记录
- 一键切换到任何历史地址

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Cmd+T` (macOS) / `Ctrl+T` (Win/Linux) | 打开地址输入页面 |
| `Cmd+M` (macOS) / `Ctrl+M` (Win/Linux) | 打开地址管理页面 |
| `Cmd+W` (macOS) | 隐藏窗口 (不退出应用) |
| `Cmd+Q` (macOS) / `Ctrl+Q` (Win/Linux) | 退出应用 |
| `Cmd+R` (macOS) / `Ctrl+R` (Win/Linux) | 重新加载当前页面 |
| `F12` | 打开开发者工具 |

## 🔧 开发注意事项

### 热重载
- 主进程代码修改后需要重启应用
- 渲染进程 (React) 代码支持热重载
- preload脚本修改后需要重启应用

### 调试
- 使用 `F12` 打开开发者工具调试渲染进程
- 主进程调试可以使用VSCode的调试功能
- 日志会显示在终端和开发者工具控制台

### 数据存储
- 用户数据存储在系统默认位置:
  - macOS: `~/Library/Application Support/memos/`
  - Windows: `%APPDATA%/memos/`
  - Linux: `~/.config/memos/`

## 🐛 故障排除

### 构建失败
```bash
# 清理node_modules并重新安装
rm -rf node_modules renderer/node_modules
yarn install
cd renderer && yarn install
```

### 应用无法启动
1. 检查Node.js版本是否符合要求
2. 确保所有依赖都已正确安装
3. 查看终端错误信息

### 渲染进程白屏
1. 打开开发者工具查看控制台错误
2. 检查React组件是否有语法错误
3. 确认IPC通信是否正常

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**作者**: ximing
**邮箱**: ximing@meituan.com
