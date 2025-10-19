#!/bin/bash

# 简化的版本升级脚本
# 提供更友好的交互式界面

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_SCRIPT="$SCRIPT_DIR/release.sh"

echo -e "${BLUE}🚀 Memos 版本升级工具${NC}"
echo

# 获取当前版本
current_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "未知")
echo -e "当前版本: ${GREEN}$current_version${NC}"
echo

# 显示选项
echo "请选择版本升级类型:"
echo "1) patch - 补丁版本 (修复bug)"
echo "2) minor - 小版本 (新功能)"
echo "3) major - 大版本 (重大更改)"
echo "4) 自定义版本号"
echo "5) 预览模式 (--dry-run)"
echo

read -p "请输入选择 (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}升级补丁版本...${NC}"
        "$RELEASE_SCRIPT" patch
        ;;
    2)
        echo -e "${YELLOW}升级小版本...${NC}"
        "$RELEASE_SCRIPT" minor
        ;;
    3)
        echo -e "${YELLOW}升级大版本...${NC}"
        "$RELEASE_SCRIPT" major
        ;;
    4)
        read -p "请输入版本号 (如: 1.2.3): " custom_version
        if [[ "$custom_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo -e "${YELLOW}升级到自定义版本 $custom_version...${NC}"
            "$RELEASE_SCRIPT" "$custom_version"
        else
            echo "❌ 无效的版本号格式"
            exit 1
        fi
        ;;
    5)
        echo "请选择预览类型:"
        echo "1) patch预览"
        echo "2) minor预览"
        echo "3) major预览"
        read -p "请输入选择 (1-3): " preview_choice
        case $preview_choice in
            1) "$RELEASE_SCRIPT" patch --dry-run ;;
            2) "$RELEASE_SCRIPT" minor --dry-run ;;
            3) "$RELEASE_SCRIPT" major --dry-run ;;
            *) echo "❌ 无效选择" && exit 1 ;;
        esac
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac
