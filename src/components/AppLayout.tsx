import {
  LockOutlined,
  LogoutOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { Button, Form, Input, Layout, Menu, Modal, Typography, message } from 'antd'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { changePassword, logout } from '../features/auth/authSlice'
import type { ChangePasswordRequest } from '../types'

const { Header, Content } = Layout

export const AppLayout = () => {
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [form] = Form.useForm<ChangePasswordRequest>()
  const [messageApi, contextHolder] = message.useMessage()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const passwordLoading = useAppSelector((state) => state.auth.passwordLoading)

  const menuItems = [
    { 
      key: '/tasks',
      label: 'Задачи',
      icon: <UnorderedListOutlined />
    },

    ...(user?.role === 'ADMIN'
      ? [{
          key: '/admin/users',
          label: 'Пользователи',
          icon: <TeamOutlined /> 
        }]
      : []),
  ]

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const handlePasswordChange = async (values: ChangePasswordRequest) => {
    try {
      await dispatch(changePassword(values)).unwrap()
      messageApi.success('Пароль изменен')
      form.resetFields()
      setPasswordOpen(false)
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось сменить пароль')
    }
  }

  return (
    <Layout className="app-shell">
      {contextHolder}
      <Header className="app-header">
        <div className="brand">
          <UnorderedListOutlined />
          <span>Task Board</span>
        </div>
        <Menu
          className="app-menu"
          mode="horizontal"
          selectedKeys={[
            location.pathname.startsWith('/admin/users') ? '/admin/users' : '/tasks',
          ]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div className="header-actions">
          <Typography.Text className="user-label">
            {user?.nickname} {user?.role === 'ADMIN' ? '(admin)' : ''}
          </Typography.Text>
          <Button icon={<LockOutlined />} onClick={() => setPasswordOpen(true)}>
            Пароль
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Выйти
          </Button>
        </div>
      </Header>
      <Content className="app-content">
        <Outlet />
      </Content>

      <Modal
        title="Смена пароля"
        open={passwordOpen}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={passwordLoading}
        onCancel={() => setPasswordOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            label="Текущий пароль"
            name="currentPassword"
            rules={[{ required: true, message: 'Введите текущий пароль' }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            label="Новый пароль"
            name="newPassword"
            rules={[
              { required: true, message: 'Введите новый пароль' },
              { min: 8, message: 'Минимум 8 символов' },
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
