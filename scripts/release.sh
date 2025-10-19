#!/bin/bash

# Memos Release Script
# 用于自动化版本升级、提交代码和触发构建的脚本

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    cat << EOF
Memos Release Script

用法:
  $0 <version_type_or_version> [options]

参数:
  version_type_or_version  版本类型或具体版本号
    - patch                补丁版本 (1.0.4 -> 1.0.5)
    - minor                小版本 (1.0.4 -> 1.1.0)
    - major                大版本 (1.0.4 -> 2.0.0)
    - x.y.z                具体版本号 (如: 1.2.3)

选项:
  --dry-run              仅显示将要执行的操作，不实际执行
  --no-push              不推送到远程仓库
  --help, -h             显示此帮助信息

示例:
  $0 patch               # 升级补丁版本
  $0 minor               # 升级小版本
  $0 major               # 升级大版本
  $0 1.2.3               # 升级到指定版本
  $0 patch --dry-run     # 预览操作而不执行
  $0 1.2.3 --no-push     # 升级版本但不推送到远程

EOF
}

# 检查必要的工具
check_dependencies() {
    log_info "检查依赖工具..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装或不在PATH中"
        exit 1
    fi

    if ! command -v git &> /dev/null; then
        log_error "Git 未安装或不在PATH中"
        exit 1
    fi

    if ! command -v jq &> /dev/null; then
        log_warning "jq 未安装，将使用node来处理JSON"
    fi

    log_success "依赖检查完成"
}

# 检查Git状态
check_git_status() {
    log_info "检查Git状态..."

    # 检查是否在Git仓库中
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "当前目录不是Git仓库"
        exit 1
    fi

    # 检查是否有未提交的更改
    if ! git diff-index --quiet HEAD --; then
        log_error "存在未提交的更改，请先提交或暂存"
        git status --short
        exit 1
    fi

    # 检查是否有未跟踪的文件（警告但不阻止）
    if [ -n "$(git ls-files --others --exclude-standard)" ]; then
        log_warning "存在未跟踪的文件："
        git ls-files --others --exclude-standard
        read -p "是否继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi

    log_success "Git状态检查完成"
}

# 获取当前版本
get_current_version() {
    if command -v jq &> /dev/null; then
        jq -r '.version' package.json
    else
        node -p "require('./package.json').version"
    fi
}

# 计算新版本号
calculate_new_version() {
    local current_version="$1"
    local version_type="$2"

    # 如果是具体版本号（包含点），直接返回
    if [[ "$version_type" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "$version_type"
        return
    fi

    # 解析当前版本号
    local major minor patch
    IFS='.' read -r major minor patch <<< "$current_version"

    case "$version_type" in
        "patch")
            echo "$major.$minor.$((patch + 1))"
            ;;
        "minor")
            echo "$major.$((minor + 1)).0"
            ;;
        "major")
            echo "$((major + 1)).0.0"
            ;;
        *)
            log_error "无效的版本类型: $version_type"
            log_error "支持的类型: patch, minor, major 或具体版本号 (如: 1.2.3)"
            exit 1
            ;;
    esac
}

# 更新package.json版本
update_package_version() {
    local file="$1"
    local new_version="$2"

    log_info "更新 $file 版本为 $new_version"

    if command -v jq &> /dev/null; then
        # 使用jq更新版本
        local tmp_file=$(mktemp)
        jq ".version = \"$new_version\"" "$file" > "$tmp_file"
        mv "$tmp_file" "$file"
    else
        # 使用node更新版本
        node -e "
            const fs = require('fs');
            const pkg = require('./$file');
            pkg.version = '$new_version';
            fs.writeFileSync('$file', JSON.stringify(pkg, null, 2) + '\n');
        "
    fi
}

# 主发布流程
main() {
    local version_input="$1"
    local dry_run=false
    local no_push=false

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run=true
                shift
                ;;
            --no-push)
                no_push=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                log_error "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                if [ -z "$version_input" ]; then
                    version_input="$1"
                fi
                shift
                ;;
        esac
    done

    # 检查版本参数
    if [ -z "$version_input" ]; then
        log_error "请指定版本类型或版本号"
        show_help
        exit 1
    fi

    log_info "开始发布流程..."
    log_info "项目: $(basename $(pwd))"

    # 检查依赖和状态
    check_dependencies
    check_git_status

    # 获取当前版本和计算新版本
    local current_version
    current_version=$(get_current_version)
    local new_version
    new_version=$(calculate_new_version "$current_version" "$version_input")

    log_info "当前版本: $current_version"
    log_info "目标版本: $new_version"

    # 验证新版本号
    if [[ ! "$new_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        log_error "无效的版本号格式: $new_version"
        exit 1
    fi

    # 检查版本是否向前
    if [[ "$new_version" == "$current_version" ]]; then
        log_error "新版本号与当前版本相同: $new_version"
        exit 1
    fi

    # 确认操作
    if [ "$dry_run" = false ]; then
        echo
        log_warning "即将执行以下操作:"
        echo "  1. 更新主项目版本: $current_version -> $new_version"
        echo "  2. 更新renderer版本: $current_version -> $new_version"
        echo "  3. 提交更改到Git"
        echo "  4. 创建tag: v$new_version"
        if [ "$no_push" = false ]; then
            echo "  5. 推送到远程仓库并触发构建"
        else
            echo "  5. 跳过推送 (--no-push)"
        fi
        echo
        read -p "确认继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "操作已取消"
            exit 0
        fi
    fi

    if [ "$dry_run" = true ]; then
        log_info "[DRY RUN] 将执行以下操作:"
        echo "  - 更新 package.json: $current_version -> $new_version"
        echo "  - 更新 renderer/package.json: $current_version -> $new_version"
        echo "  - Git提交: feat: bump version to $new_version"
        echo "  - 创建tag: v$new_version"
        if [ "$no_push" = false ]; then
            echo "  - 推送到远程仓库"
        fi
        log_info "[DRY RUN] 实际不会执行任何更改"
        exit 0
    fi

    # 执行更新
    log_info "更新版本号..."

    # 更新主项目package.json
    update_package_version "package.json" "$new_version"

    # 更新renderer package.json
    if [ -f "renderer/package.json" ]; then
        update_package_version "renderer/package.json" "$new_version"
    fi

    log_success "版本号更新完成"

    # Git操作
    log_info "提交更改到Git..."
    git add package.json
    if [ -f "renderer/package.json" ]; then
        git add renderer/package.json
    fi
    git commit -m "feat: bump version to $new_version"

    log_info "创建tag..."
    git tag -a "v$new_version" -m "Release version $new_version"

    log_success "Git操作完成"

    # 推送到远程
    if [ "$no_push" = false ]; then
        log_info "推送到远程仓库..."

        # 获取当前分支名
        local current_branch
        current_branch=$(git branch --show-current)

        # 推送代码和tag
        git push origin "$current_branch"
        git push origin "v$new_version"

        log_success "推送完成"
        log_success "GitHub Actions构建已触发: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
    else
        log_warning "跳过推送 (--no-push 选项)"
        log_info "手动推送命令:"
        echo "  git push origin $(git branch --show-current)"
        echo "  git push origin v$new_version"
    fi

    echo
    log_success "🎉 发布流程完成!"
    log_success "版本 $new_version 已准备就绪"

    if [ "$no_push" = false ]; then
        log_info "构建完成后，Release将自动发布到: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases"
    fi
}

# 脚本入口
main "$@"
