# GitHub Actions 权限配置说明

如果您遇到 GitHub Actions 创建 Release 时出现 403 错误，请按照以下步骤配置权限。

## 🚨 常见错误

```
⚠️ GitHub release failed with status: 403
❌ Too many retries. Aborting...
Error: Too many retries.
```

## 🔧 解决方案

### 1. 检查仓库 Actions 权限设置

1. 进入您的 GitHub 仓库页面
2. 点击 `Settings` (设置)
3. 在左侧菜单中找到 `Actions` → `General`
4. 向下滚动到 `Workflow permissions` 部分

### 2. 配置 Workflow 权限

选择以下其中一个选项：

#### 选项 A: 读写权限（推荐）
```
✅ Read and write permissions
   Allow GitHub Actions to create and approve pull requests
```

#### 选项 B: 受限权限（更安全，但需要手动配置）
```
⚪ Restricted permissions
   Contents: Read (default)
```

如果选择选项 B，需要在每个 workflow 文件中明确指定权限：

```yaml
permissions:
  contents: write      # 创建 releases 需要
  discussions: write   # 生成 release notes 需要
```

### 3. 确保启用了 Issues 和 Wiki

在仓库的 `Settings` → `General` 中确保：
- ✅ Issues
- ✅ Wiki（如果需要生成 release notes）

## 🎯 我们的配置

本项目已经在 workflow 文件中配置了必要的权限：

### `release.yml` 权限
```yaml
permissions:
  contents: write      # 创建 releases 和上传文件
  discussions: write   # 生成 release notes
```

### `test-build.yml` 权限
```yaml
permissions:
  contents: write      # 创建预发布版本
  discussions: write   # 生成 release notes
```

## 🔍 验证设置

配置完成后，可以通过以下方式验证：

1. **推送代码测试**:
   ```bash
   git push origin main
   # 查看 Actions 页面是否有权限错误
   ```

2. **手动触发测试**:
   - 在 Actions 页面手动运行 workflow
   - 检查是否还有 403 错误

3. **创建测试 tag**:
   ```bash
   git tag v1.0.0-test
   git push origin v1.0.0-test
   # 检查是否能成功创建 release
   ```

## 📋 故障排除

### 如果仍然出现 403 错误

1. **检查分支保护规则**:
   - Settings → Branches
   - 确认没有阻止 Actions 的规则

2. **检查组织策略**:
   - 如果是组织仓库，检查组织级别的 Actions 策略

3. **重新生成 GITHUB_TOKEN**:
   - 删除并重新创建 workflow run

4. **检查仓库可见性**:
   - 私有仓库可能有额外的限制

### 联系管理员

如果是组织仓库且您没有管理员权限，请联系仓库管理员：

1. 启用 Actions 权限
2. 配置 Workflow 权限为 "Read and write"
3. 确保启用 Releases 功能

## 🔗 参考链接

- [GitHub Actions 权限文档](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [Workflow 权限配置](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions)
- [故障排除指南](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

---

配置完成后，您的 GitHub Actions 应该能够正常创建 Releases 了！🎉
