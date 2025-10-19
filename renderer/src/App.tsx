import React, { useState, useEffect } from 'react'
import { Layout, Spin, Typography } from 'antd'
import AddressInput from './components/AddressInput'
import AddressManager from './components/AddressManager'
import ThemeToggle from './components/ThemeToggle'

const { Header, Content } = Layout
const { Title } = Typography

export type AppMode = 'input' | 'manage' | 'loading'

export interface SavedAddress {
  id: string
  url: string
  name: string
  lastUsed?: number
}

function App() {
  const [mode, setMode] = useState<AppMode>('loading')
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [currentAddress, setCurrentAddress] = useState<string>('')

  useEffect(() => {
    // 初始化时检查是否有保存的地址
    loadAddresses()

    // 监听来自主进程的事件
    const handleShowAddressManager = () => {
      setMode('manage')
    }

    window.addEventListener('show-address-manager', handleShowAddressManager)

    return () => {
      window.removeEventListener('show-address-manager', handleShowAddressManager)
    }
  }, [])

  const loadAddresses = async () => {
    try {
      // 通过IPC从主进程获取保存的地址
      const savedAddresses = await window.electronAPI?.getAddresses() || []
      const lastUsedAddress = await window.electronAPI?.getLastUsedAddress() || ''

      setAddresses(savedAddresses)
      setCurrentAddress(lastUsedAddress)

      // 如果有最近使用的地址，直接导航到那个地址
      if (lastUsedAddress && savedAddresses.some(addr => addr.url === lastUsedAddress)) {
        await window.electronAPI?.navigateToAddress(lastUsedAddress)
      } else {
        // 否则显示地址输入页面
        setMode('input')
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
      setMode('input')
    }
  }

  const handleAddressSubmit = async (url: string, name?: string) => {
    try {
      await window.electronAPI?.navigateToAddress(url)

      // 保存地址到历史记录
      const newAddress: SavedAddress = {
        id: Date.now().toString(),
        url,
        name: name || new URL(url).hostname,
        lastUsed: Date.now()
      }

      const updatedAddresses = [...addresses.filter(addr => addr.url !== url), newAddress]
      setAddresses(updatedAddresses)
      await window.electronAPI?.saveAddresses(updatedAddresses)
      await window.electronAPI?.setLastUsedAddress(url)
      setCurrentAddress(url)
    } catch (error) {
      console.error('Failed to navigate to address:', error)
    }
  }

  const handleManageAddresses = () => {
    setMode('manage')
  }

  const handleBackToInput = () => {
    setMode('input')
  }

  const handleDeleteAddress = async (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id)
    setAddresses(updatedAddresses)
    await window.electronAPI?.saveAddresses(updatedAddresses)
  }

  const handleSelectAddress = async (address: SavedAddress) => {
    await handleAddressSubmit(address.url, address.name)
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}
      >
        <Title level={3} style={{ margin: 0, color: 'inherit' }}>
          Memos
        </Title>
        <ThemeToggle size="small" showLabel={false} />
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          {mode === 'loading' && (
            <div style={{
              textAlign: 'center',
              padding: '80px 0',
              background: 'var(--ant-color-bg-container)',
              borderRadius: '8px'
            }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>
                <Typography.Text type="secondary">加载中...</Typography.Text>
              </div>
            </div>
          )}

          {mode === 'input' && (
            <AddressInput
              onSubmit={handleAddressSubmit}
              onManageAddresses={handleManageAddresses}
              savedAddresses={addresses}
              onSelectAddress={handleSelectAddress}
            />
          )}

          {mode === 'manage' && (
            <AddressManager
              addresses={addresses}
              currentAddress={currentAddress}
              onBack={handleBackToInput}
              onDelete={handleDeleteAddress}
              onSelect={handleSelectAddress}
            />
          )}
        </div>
      </Content>
    </Layout>
  )
}

export default App
