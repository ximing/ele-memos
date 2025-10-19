import React, { useState } from 'react'
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  List,
  Avatar,
  Tag,
  Empty,
  Modal,
  message,
  Tooltip
} from 'antd'
import {
  ArrowLeftOutlined,
  SearchOutlined,
  LinkOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { SavedAddress } from '../App'

const { Title, Text } = Typography
const { Search } = Input

interface AddressManagerProps {
  addresses: SavedAddress[]
  currentAddress: string
  onBack: () => void
  onDelete: (id: string) => void
  onSelect: (address: SavedAddress) => void
}

const AddressManager: React.FC<AddressManagerProps> = ({
  addresses,
  currentAddress,
  onBack,
  onDelete,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredAddresses = addresses.filter(address =>
    address.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    address.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedAddresses = filteredAddresses.sort((a, b) => {
    // 当前使用的地址排在最前面
    if (a.url === currentAddress) return -1
    if (b.url === currentAddress) return 1
    // 其余按最后使用时间排序
    return (b.lastUsed || 0) - (a.lastUsed || 0)
  })

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要删除 "${name}" 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        onDelete(id)
        message.success('地址已删除')
      }
    })
  }

  const handleSelect = async (address: SavedAddress) => {
    if (address.url === currentAddress) {
      message.info('当前已在使用此地址')
      return
    }

    setLoading(true)
    try {
      await onSelect(address)
      message.success(`正在前往 ${address.name}`)
    } catch (error) {
      message.error('无法访问该地址')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp?: number): string => {
    if (!timestamp) return '从未使用'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return '今天 ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                type="text"
                size="large"
              >
                返回
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                地址管理
              </Title>
            </Space>
            <Text type="secondary">
              共 {addresses.length} 个地址
            </Text>
          </div>

          <Search
            placeholder="搜索地址或名称..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
          />
        </Space>
      </Card>

      <Card>
        {sortedAddresses.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              addresses.length === 0 ? '还没有保存的地址' : '没有找到匹配的地址'
            }
          >
            {addresses.length === 0 && (
              <Button type="primary" onClick={onBack}>
                添加第一个地址
              </Button>
            )}
          </Empty>
        ) : (
          <List
            dataSource={sortedAddresses}
            renderItem={(address) => {
              const isCurrent = address.url === currentAddress
              return (
                <List.Item
                  actions={[
                    <Tooltip title={isCurrent ? '当前正在使用' : '切换到此地址'}>
                      <Button
                        type={isCurrent ? 'default' : 'primary'}
                        icon={isCurrent ? <CheckCircleOutlined /> : undefined}
                        onClick={() => handleSelect(address)}
                        disabled={isCurrent}
                        loading={loading}
                        size="small"
                      >
                        {isCurrent ? '使用中' : '使用'}
                      </Button>
                    </Tooltip>,
                    <Tooltip title="删除此地址">
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(address.id, address.name)}
                        size="small"
                      />
                    </Tooltip>
                  ]}
                  style={{
                    border: isCurrent ? '1px solid #1890ff' : '1px solid transparent',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: isCurrent ? '#f0f8ff' : 'transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<LinkOutlined />}
                        style={{
                          backgroundColor: isCurrent ? '#1890ff' : '#52c41a'
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                          {address.name}
                        </Text>
                        {isCurrent && (
                          <Tag color="blue" icon={<CheckCircleOutlined />}>
                            当前
                          </Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: '13px', wordBreak: 'break-all' }}
                        >
                          {address.url}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          最后使用: {formatDate(address.lastUsed)}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )
            }}
          />
        )}
      </Card>

      <Card>
        <Space align="start">
          <InfoCircleOutlined style={{ color: '#1890ff', marginTop: 2 }} />
          <div>
            <Text strong>使用提示</Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                • 删除地址不会影响当前浏览的页面，但会从历史记录中移除
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                • 使用搜索功能可以快速查找特定的地址
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '14px' }}>
                • 当前使用的地址会显示特殊标识并排在列表顶部
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    </Space>
  )
}

export default AddressManager
