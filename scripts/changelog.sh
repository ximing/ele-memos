#!/bin/bash

# CHANGELOG 生成器
# 根据git提交历史自动生成或更新CHANGELOG

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHANGELOG_FILE="CHANGELOG.md"

# 获取当前版本
get_current_version() {
    node -p "require('./package.json').version" 2>/dev/null || echo "0.0.0"
}

# 获取最新的tag
get_latest_tag() {
    git describe --tags --abbrev=0 2>/dev/null || echo ""
}

# 生成版本间的提交历史
generate_commits_since_tag() {
    local since_tag="$1"
    local format="$2"

    if [ -z "$since_tag" ]; then
        # 如果没有tag，获取所有提交
        git log --pretty=format:"$format" --reverse
    else
        # 获取自指定tag以来的提交
        git log --pretty=format:"$format" --reverse "${since_tag}..HEAD"
    fi
}

# 分类提交
categorize_commits() {
    local commits="$1"

    echo "### 🚀 新功能"
    echo "$commits" | grep -E "^feat[:(]" | sed 's/^feat[:(][^)]*): */- /' || echo "- 暂无"
    echo

    echo "### 🐛 修复"
    echo "$commits" | grep -E "^fix[:(]" | sed 's/^fix[:(][^)]*): */- /' || echo "- 暂无"
    echo

    echo "### 📝 文档"
    echo "$commits" | grep -E "^docs[:(]" | sed 's/^docs[:(][^)]*): */- /' || echo "- 暂无"
    echo

    echo "### 🎨 样式"
    echo "$commits" | grep -E "^style[:(]" | sed 's/^style[:(][^)]*): */- /' || echo "- 暂无"
    echo

    echo "### ♻️ 重构"
    echo "$commits" | grep -E "^refactor[:(]" | sed 's/^refactor[:(][^)]*): */- /' || echo "- 暂无"
    echo

    echo "### ⚡ 性能优化"
    echo "$commits" | grep -E "^perf[:(]" | sed 's/^perf[:(][^)]*): */- /' || echo "- 暂无"
    echo

    echo "### 🔧 其他更改"
    echo "$commits" | grep -vE "^(feat|fix|docs|style|refactor|perf)[:(]" | sed 's/^/- /' || echo "- 暂无"
}

# 创建新的CHANGELOG条目
create_changelog_entry() {
    local version="$1"
    local date="$2"
    local latest_tag="$3"

    echo "## [$version] - $date"
    echo

    # 获取提交历史
    local commits
    commits=$(generate_commits_since_tag "$latest_tag" "%s")

    if [ -z "$commits" ]; then
        echo "- 暂无更改"
        echo
    else
        categorize_commits "$commits"
    fi
}

# 更新CHANGELOG文件
update_changelog() {
    local version="$1"
    local create_new="$2"

    local current_date
    current_date=$(date +"%Y-%m-%d")

    local latest_tag
    latest_tag=$(get_latest_tag)

    echo -e "${BLUE}[INFO]${NC} 生成版本 $version 的CHANGELOG..."

    if [ "$create_new" = true ] || [ ! -f "$CHANGELOG_FILE" ]; then
        # 创建新的CHANGELOG文件
        echo -e "${YELLOW}[INFO]${NC} 创建新的CHANGELOG文件"
        cat > "$CHANGELOG_FILE" << EOF
# 更新日志

本文档记录了项目的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

EOF
        create_changelog_entry "$version" "$current_date" "$latest_tag" >> "$CHANGELOG_FILE"
    else
        # 更新现有的CHANGELOG文件
        echo -e "${YELLOW}[INFO]${NC} 更新现有的CHANGELOG文件"

        # 创建临时文件
        local temp_file
        temp_file=$(mktemp)

        # 写入文件头
        head -n 6 "$CHANGELOG_FILE" > "$temp_file"

        # 添加新版本条目
        create_changelog_entry "$version" "$current_date" "$latest_tag" >> "$temp_file"

        # 添加现有内容（跳过文件头）
        tail -n +7 "$CHANGELOG_FILE" >> "$temp_file"

        # 替换原文件
        mv "$temp_file" "$CHANGELOG_FILE"
    fi

    echo -e "${GREEN}[SUCCESS]${NC} CHANGELOG已更新: $CHANGELOG_FILE"
}

# 显示帮助信息
show_help() {
    cat << EOF
CHANGELOG 生成器

用法:
  $0 [version] [options]

参数:
  version                要生成CHANGELOG的版本号 (可选，默认使用package.json中的版本)

选项:
  --new                  创建新的CHANGELOG文件
  --preview              仅预览，不写入文件
  --help, -h             显示此帮助信息

示例:
  $0                     # 使用当前版本生成/更新CHANGELOG
  $0 1.2.3               # 为指定版本生成CHANGELOG
  $0 --new               # 创建新的CHANGELOG文件
  $0 --preview           # 预览CHANGELOG内容

EOF
}

# 主函数
main() {
    local version=""
    local create_new=false
    local preview_only=false

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --new)
                create_new=true
                shift
                ;;
            --preview)
                preview_only=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                echo "未知选项: $1"
                show_help
                exit 1
                ;;
            *)
                if [ -z "$version" ]; then
                    version="$1"
                fi
                shift
                ;;
        esac
    done

    # 如果没有指定版本，使用package.json中的版本
    if [ -z "$version" ]; then
        version=$(get_current_version)
    fi

    # 验证版本号格式
    if [[ ! "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "❌ 无效的版本号格式: $version"
        exit 1
    fi

    echo -e "${BLUE}📝 CHANGELOG 生成器${NC}"
    echo -e "版本: ${GREEN}$version${NC}"
    echo

    if [ "$preview_only" = true ]; then
        echo -e "${YELLOW}[PREVIEW]${NC} CHANGELOG内容预览："
        echo "----------------------------------------"

        local current_date
        current_date=$(date +"%Y-%m-%d")
        local latest_tag
        latest_tag=$(get_latest_tag)

        create_changelog_entry "$version" "$current_date" "$latest_tag"
    else
        update_changelog "$version" "$create_new"

        echo
        echo -e "${GREEN}✅ 完成！${NC}"
        echo "你可以编辑 $CHANGELOG_FILE 来完善更新说明。"
    fi
}

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 当前目录不是Git仓库"
    exit 1
fi

# 脚本入口
main "$@"
