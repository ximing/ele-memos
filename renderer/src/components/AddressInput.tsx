import React, { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  List,
  Avatar,
  message
} from 'antd'
import {
  LinkOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CheckOutlined
} from '@ant-design/icons'
import { SavedAddress } from '../App'

const { Title, Text } = Typography

interface AddressInputProps {
  onSubmit: (url: string, name?: string) => void
  onManageAddresses: () => void
  savedAddresses: SavedAddress[]
  onSelectAddress: (address: SavedAddress) => void
}

const AddressInput: React.FC<AddressInputProps> = ({
  onSubmit,
  onManageAddresses,
  savedAddresses,
  onSelectAddress
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const validateUrl = (input: string): boolean => {
    try {
      // 如果没有协议，自动添加 https://
      let urlToCheck = input
      if (!input.startsWith('http://') && !input.startsWith('https://')) {
        urlToCheck = 'https://' + input
      }
      new URL(urlToCheck)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (values: { url: string; name?: string }) => {
    setLoading(true)

    try {
      const { url, name } = values

      if (!validateUrl(url)) {
        message.error('请输入有效的网址')
        return
      }

      // 自动添加协议
      let finalUrl = url.trim()
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl
      }

      await onSubmit(finalUrl, name?.trim() || undefined)
      form.resetFields()
      message.success('地址已保存')
    } catch (error) {
      message.error('无法导航到该地址，请检查URL是否正确')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAddress = async (address: SavedAddress) => {
    setLoading(true)
    try {
      await onSelectAddress(address)
      message.success(`正在前往 ${address.name}`)
    } catch (error) {
      message.error('无法访问该地址')
    } finally {
      setLoading(false)
    }
  }

  const recentAddresses = savedAddresses
    .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
    .slice(0, 5)

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <LinkOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2} style={{ margin: 0 }}>输入网址</Title>
            <Text type="secondary">请输入你想要访问的网址</Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
          >
            <Form.Item
              name="url"
              label="网址"
              rules={[
                { required: true, message: '请输入网址' },
                {
                  validator: (_, value) => {
                    if (!value || validateUrl(value)) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('请输入有效的网址'))
                  }
                }
              ]}
            >
              <Input
                prefix={<LinkOutlined />}
                placeholder="例如: memo.ximing.ren 或 https://example.com"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="名称 (可选)"
            >
              <Input
                placeholder="为这个网址起个名字"
              />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckOutlined />}
                  size="large"
                >
                  确定
                </Button>
                <Button
                  icon={<SettingOutlined />}
                  onClick={onManageAddresses}
                  size="large"
                >
                  管理地址
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Space>
      </Card>

      {recentAddresses.length > 0 && (
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Title level={4} style={{ margin: 0 }}>最近使用</Title>
            </div>

            <List
              dataSource={recentAddresses}
              renderItem={(address) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleSelectAddress(address)}
                      loading={loading}
                    >
                      使用
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<LinkOutlined />}
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    }
                    title={address.name}
                    description={
                      <Space direction="vertical" size="small">
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {address.url}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {address.lastUsed ?
                            `最后使用: ${new Date(address.lastUsed).toLocaleString()}` :
                            '未使用过'
                          }
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>
      )}
    </Space>
  )
}

export default AddressInput
