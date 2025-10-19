# 🚀 Memos 发布脚本使用指南

这个目录包含了用于自动化版本管理和发布流程的脚本。

## 📋 脚本概览

| 脚本 | 功能 | 推荐使用方式 |
|------|------|-------------|
| `release.sh` | 主发布脚本 | 通过npm scripts使用 |
| `bump.sh` | 交互式版本升级 | 直接运行 |
| `changelog.sh` | CHANGELOG生成器 | 通过npm scripts使用 |

## 🎯 快速开始

### 方式一：使用交互式界面（推荐新手）

```bash
# 运行交互式版本升级工具
npm run bump
# 或者
./scripts/bump.sh
```

这将显示一个友好的菜单，让你选择版本类型。

### 方式二：使用npm scripts（推荐）

```bash
# 升级补丁版本 (1.0.4 -> 1.0.5)
npm run version:patch

# 升级小版本 (1.0.4 -> 1.1.0)
npm run version:minor

# 升级大版本 (1.0.4 -> 2.0.0)
npm run version:major
```

这些命令会自动：
1. 生成/更新CHANGELOG
2. 升级版本号
3. 提交更改
4. 创建tag
5. 推送到远程仓库
6. 触发GitHub Actions构建

### 方式三：直接使用脚本

```bash
# 升级指定类型版本
./scripts/release.sh patch
./scripts/release.sh minor
./scripts/release.sh major

# 升级到指定版本
./scripts/release.sh 1.2.3
```

## 📖 详细使用说明

### release.sh - 主发布脚本

主要的版本发布脚本，负责完整的发布流程。

#### 基本用法

```bash
./scripts/release.sh <version_type_or_version> [options]
```

#### 参数说明

**版本类型或版本号：**
- `patch` - 补丁版本 (1.0.4 → 1.0.5)
- `minor` - 小版本 (1.0.4 → 1.1.0)
- `major` - 大版本 (1.0.4 → 2.0.0)
- `x.y.z` - 具体版本号 (如：1.2.3)

**选项：**
- `--dry-run` - 预览操作，不实际执行
- `--no-push` - 不推送到远程仓库
- `--help` - 显示帮助信息

#### 使用示例

```bash
# 升级补丁版本
./scripts/release.sh patch

# 升级到指定版本
./scripts/release.sh 1.2.3

# 预览patch升级（不实际执行）
./scripts/release.sh patch --dry-run

# 升级但不推送到远程
./scripts/release.sh patch --no-push
```

#### 执行流程

1. ✅ **依赖检查** - 检查Node.js、Git等工具
2. ✅ **Git状态检查** - 确保工作区干净
3. ✅ **版本计算** - 根据输入计算新版本号
4. ✅ **确认操作** - 显示将要执行的操作并等待确认
5. ✅ **更新版本** - 更新package.json和renderer/package.json
6. ✅ **Git提交** - 提交版本更改
7. ✅ **创建Tag** - 创建版本标签
8. ✅ **推送远程** - 推送代码和标签，触发CI/CD

### bump.sh - 交互式版本升级

提供友好的交互界面，适合不熟悉命令行的用户。

#### 使用方法

```bash
./scripts/bump.sh
```

#### 功能特性

- 🎨 **友好界面** - 彩色输出和清晰的选项
- 📋 **菜单选择** - 数字选择版本类型
- 👀 **预览功能** - 支持预览模式
- ⚡ **自动调用** - 内部调用release.sh执行实际操作

### changelog.sh - CHANGELOG生成器

根据git提交历史自动生成或更新CHANGELOG.md文件。

#### 基本用法

```bash
./scripts/changelog.sh [version] [options]
```

#### 参数说明

- `version` - 版本号（可选，默认使用package.json中的版本）

#### 选项

- `--new` - 创建新的CHANGELOG文件
- `--preview` - 仅预览，不写入文件
- `--help` - 显示帮助信息

#### 使用示例

```bash
# 为当前版本生成CHANGELOG
./scripts/changelog.sh

# 为指定版本生成CHANGELOG
./scripts/changelog.sh 1.2.3

# 预览CHANGELOG内容
./scripts/changelog.sh --preview

# 创建新的CHANGELOG文件
./scripts/changelog.sh --new
```

#### 提交分类

脚本会自动分析git提交信息并分类：

- 🚀 **新功能** - `feat:` 开头的提交
- 🐛 **修复** - `fix:` 开头的提交
- 📝 **文档** - `docs:` 开头的提交
- 🎨 **样式** - `style:` 开头的提交
- ♻️ **重构** - `refactor:` 开头的提交
- ⚡ **性能优化** - `perf:` 开头的提交
- 🔧 **其他更改** - 不符合上述模式的提交

## 🔧 npm Scripts

项目中已添加了便捷的npm scripts：

| Script | 功能 | 说明 |
|--------|------|------|
| `npm run bump` | 交互式升级 | 运行bump.sh |
| `npm run release` | 基础发布 | 需要指定参数 |
| `npm run release:patch` | 补丁版本发布 | 升级patch版本 |
| `npm run release:minor` | 小版本发布 | 升级minor版本 |
| `npm run release:major` | 大版本发布 | 升级major版本 |
| `npm run release:dry` | 预览发布 | 预览patch升级 |
| `npm run changelog` | 生成CHANGELOG | 为当前版本生成 |
| `npm run changelog:preview` | 预览CHANGELOG | 不写入文件 |
| `npm run version:patch` | 完整patch流程 | CHANGELOG + 发布 |
| `npm run version:minor` | 完整minor流程 | CHANGELOG + 发布 |
| `npm run version:major` | 完整major流程 | CHANGELOG + 发布 |

## 🌊 推荐工作流

### 日常开发流程

1. **开发功能** - 在feature分支开发
2. **提交代码** - 使用规范的commit message
3. **合并主分支** - 通过PR合并到main
4. **发布版本** - 运行发布脚本

### 版本发布流程

#### 方案一：完整自动化（推荐）

```bash
# 一键发布patch版本（包含CHANGELOG）
npm run version:patch

# 一键发布minor版本（包含CHANGELOG）
npm run version:minor

# 一键发布major版本（包含CHANGELOG）
npm run version:major
```

#### 方案二：分步操作

```bash
# 1. 生成CHANGELOG
npm run changelog

# 2. 编辑CHANGELOG（可选）
# 编辑 CHANGELOG.md 完善描述

# 3. 发布版本
npm run release:patch
```

#### 方案三：交互式操作

```bash
# 运行交互式工具
npm run bump

# 根据菜单选择操作
```

## ⚠️ 注意事项

### 发布前检查

- ✅ 确保工作区没有未提交的更改
- ✅ 确保当前分支是main/master
- ✅ 确保本地代码已同步远程最新代码
- ✅ 确保所有测试通过

### Git提交规范

为了更好地生成CHANGELOG，建议使用以下提交格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**示例：**
```bash
feat(ui): 添加地址管理页面
fix(store): 修复数据存储问题
docs(readme): 更新安装说明
style(ui): 调整按钮样式
refactor(core): 重构地址存储逻辑
perf(ui): 优化页面渲染性能
```

### 版本号选择指南

- **patch (x.y.Z)** - Bug修复、小的改进
- **minor (x.Y.0)** - 新功能、向后兼容的更改
- **major (X.0.0)** - 重大更改、破坏性更新

### 常见问题

**Q: 发布过程中出现错误怎么办？**

A: 脚本会在遇到错误时自动停止。检查错误信息，修复问题后重新运行。

**Q: 如何撤销一个已经创建的tag？**

```bash
# 删除本地tag
git tag -d v1.0.5

# 删除远程tag
git push origin :refs/tags/v1.0.5
```

**Q: 如何修改已发布的CHANGELOG？**

A: 直接编辑CHANGELOG.md文件，然后提交更改即可。

**Q: GitHub Actions构建失败怎么办？**

A: 检查Actions页面的错误日志，修复问题后可以重新推送tag触发构建。

## 🔗 相关链接

- [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)

---

如有问题，请查看脚本的 `--help` 选项或联系项目维护者。
