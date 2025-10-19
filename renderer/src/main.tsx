import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import { useTheme } from './hooks/useTheme'
import './index.css'

// 设置dayjs语言为中文
dayjs.locale('zh-cn')

const AppWithTheme: React.FC = () => {
  const { themeConfig } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: themeConfig.isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
        components: {
          Layout: {
            bodyBg: themeConfig.isDark ? '#141414' : '#f5f5f5',
            headerBg: themeConfig.isDark ? '#1f1f1f' : '#ffffff',
          }
        }
      }}
    >
      <App />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWithTheme />
  </React.StrictMode>,
)
