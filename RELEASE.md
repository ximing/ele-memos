# GitHub Release 自动化构建说明

本项目已配置 GitHub Actions 自动化构建和发布流程，支持 Windows、macOS、Linux 三个平台的安装包构建。

## 🎯 构建类型

### 1. 正式发布构建 (`release.yml`)
- **触发条件**: 推送 `v*` 格式的 git tag
- **构建范围**: 所有平台 (Windows, macOS, Linux)
- **输出**: GitHub Release + 安装包
- **适用场景**: 正式版本发布

### 2. 测试构建 (`test-build.yml`)
- **触发条件**: 推送到 `master`/`main` 分支
- **构建范围**: 默认快速构建(Linux)，可选全平台构建
- **输出**: Artifacts 或预发布版本
- **适用场景**: 开发测试、功能验证

## 🚀 触发方式

### 正式发布

### 1. 自动触发（推荐）
创建并推送 git tag 到仓库：

```bash
# 更新 package.json 中的版本号
# 提交代码变更
git add .
git commit -m "chore: bump version to 1.0.5"

# 创建并推送 tag
git tag v1.0.5
git push origin main
git push origin v1.0.5
```

### 2. 手动触发
1. 进入 GitHub 仓库页面
2. 点击 `Actions` 标签页
3. 选择 `Release` workflow
4. 点击 `Run workflow` 按钮
5. 输入版本号（如：v1.0.5）
6. 点击 `Run workflow`

### 测试构建

#### 1. 自动快速构建
推送代码到 `master` 或 `main` 分支时自动触发：

```bash
# 提交代码变更
git add .
git commit -m "feat: add new feature"
git push origin main
```

- **构建范围**: 仅 Linux 平台 (快速验证)
- **输出**: GitHub Artifacts (保留 3 天)
- **用途**: 快速验证代码改动不会破坏构建

#### 2. 完整测试构建
手动触发全平台构建并创建预发布版本：

1. 进入 GitHub 仓库页面
2. 点击 `Actions` 标签页
3. 选择 `Test Build` workflow
4. 点击 `Run workflow` 按钮
5. 勾选 "Build for all platforms"
6. 点击 `Run workflow`

- **构建范围**: 所有平台 (Windows, macOS, Linux)
- **输出**: 预发布版本 (标记为 pre-release)
- **版本号格式**: `test-YYYYMMDD-HHMM-commit`
- **自动清理**: 只保留最新 5 个测试版本

## 📦 构建平台和架构

| 平台 | 架构 | 输出文件格式 |
|------|------|-------------|
| Windows | x64 | `.exe` (安装程序) |
| macOS | x64, arm64 | `.dmg` (磁盘映像), `.zip` |
| Linux | x64 | `.deb`, `.rpm` |

## 🔐 必需的 GitHub Secrets

为了正常工作，需要在 GitHub 仓库设置中配置以下 secrets：

### macOS 代码签名 (可选，用于分发)
```
APPLE_ID=your-apple-id@example.com
APPLE_ID_PASS=app-specific-password
CSC_LINK=base64-encoded-certificate
CSC_KEY_PASSWORD=certificate-password
```

> **注意**: 如果不配置 macOS 代码签名，应用仍会构建成功，但用户可能需要在系统偏好设置中手动允许运行。

### 配置步骤：
1. 进入 GitHub 仓库页面
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret`
4. 添加上述 secrets

## 📋 构建流程

1. **代码检出**: 获取最新代码
2. **环境设置**: 安装 Node.js 18 + Yarn
3. **依赖安装**: 安装主项目和渲染进程依赖
4. **多平台构建**: 并行构建所有平台的安装包
5. **文件上传**: 将构建产物上传为 artifacts
6. **发布创建**: 创建 GitHub Release 并上传安装包

## 🛠️ 本地测试构建

在推送 tag 之前，可以本地测试构建：

```bash
# 安装依赖
yarn install
cd renderer && yarn install && cd ..

# 测试构建当前平台
yarn make

# 测试构建特定架构 (仅 macOS)
yarn make:x64
yarn make:arm64
```

## 📝 版本管理建议

1. **语义化版本**: 使用 `v主版本.次版本.修订版本` 格式
   - `v1.0.0` - 主要版本发布
   - `v1.1.0` - 新功能发布
   - `v1.0.1` - 问题修复发布

2. **更新流程**:
   ```bash
   # 1. 更新 package.json 版本号
   npm version patch  # 或 minor, major

   # 2. 更新 forge.config.ts 中的 appVersion (如需要)

   # 3. 提交并创建 tag
   git add .
   git commit -m "chore: release v1.0.5"
   git tag v1.0.5
   git push origin main --follow-tags
   ```

## 🔍 故障排除

### 构建失败
1. 查看 Actions 页面的构建日志
2. 检查依赖是否正确安装
3. 确认 package.json 版本号格式正确

### 发布失败
1. 确认 tag 格式以 `v` 开头
2. 检查 GITHUB_TOKEN 权限
3. 确认仓库有 releases 权限

### macOS 构建失败
1. 检查代码签名 secrets 配置
2. 可以暂时移除代码签名环境变量进行测试

### 测试构建相关问题
1. **快速构建失败**: 检查 Linux 构建环境和依赖
2. **测试版本过多**: 旧版本会自动清理，保留最新 5 个
3. **预发布版本不显示**: 在 Releases 页面勾选 "Include prereleases"

## 📋 发布后操作

1. **验证安装包**: 下载并测试各平台安装包
2. **更新文档**: 更新 README.md 中的版本信息
3. **发布公告**: 在相关渠道宣布新版本发布

## 🎯 自定义配置

如需修改构建配置，可以编辑以下文件：
- `.github/workflows/release.yml` - 正式发布构建流程配置
- `.github/workflows/test-build.yml` - 测试构建流程配置
- `forge.config.ts` - Electron Forge 构建配置
- `package.json` - 项目元数据和脚本

### 常见自定义需求

#### 修改构建触发条件
```yaml
# 在 test-build.yml 中修改忽略的文件类型
paths-ignore:
  - '**.md'
  - '.gitignore'
  - 'LICENSE'
  - 'docs/**'
  - 'assets/**'  # 添加更多忽略路径
```

#### 调整构建保留期限
```yaml
# 修改 artifacts 保留天数
retention-days: 7  # 改为更长时间
```

#### 修改测试版本清理策略
```yaml
# 在 test-build.yml 中修改保留的测试版本数量
tail -n +6  # 改为 +11 保留更多版本
```

---

有任何问题，请查看 [GitHub Actions 文档](https://docs.github.com/en/actions) 或创建 Issue。
