import React from 'react'
import { Select, Space, Typography } from 'antd'
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons'
import { ThemeMode } from '../types/theme'
import { useTheme } from '../hooks/useTheme'

const { Text } = Typography

interface ThemeToggleProps {
  size?: 'small' | 'middle' | 'large'
  showLabel?: boolean
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'middle',
  showLabel = true
}) => {
  const { themeConfig, setTheme } = useTheme()

  const themeOptions = [
    {
      value: 'light' as ThemeMode,
      label: (
        <Space>
          <SunOutlined />
          亮色
        </Space>
      )
    },
    {
      value: 'dark' as ThemeMode,
      label: (
        <Space>
          <MoonOutlined />
          暗色
        </Space>
      )
    },
    {
      value: 'system' as ThemeMode,
      label: (
        <Space>
          <DesktopOutlined />
          跟随系统
        </Space>
      )
    }
  ]

  return (
    <Space>
      {showLabel && <Text>主题：</Text>}
      <Select
        value={themeConfig.mode}
        onChange={setTheme}
        options={themeOptions}
        size={size}
        style={{ minWidth: 120 }}
      />
    </Space>
  )
}

export default ThemeToggle
