import {
  LockOutlined,
  LoginOutlined,
  MailOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, Form, Input, Segmented, Typography } from 'antd'
import { useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { clearAuthError, login, register } from '../features/auth/authSlice'
import type { LoginRequest, RegisterRequest } from '../types'

type AuthMode = 'login' | 'register'

export const AuthPage = () => {
  const location = useLocation()
  const mode: AuthMode = location.pathname === '/register' ? 'register' : 'login'
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { token, loading, error } = useAppSelector((state) => state.auth)
  const [form] = Form.useForm<RegisterRequest>()

  const title = mode === 'login' ? 'Вход' : 'Регистрация'
  const submitText = mode === 'login' ? 'Войти' : 'Создать аккаунт'

  const modeOptions = useMemo(
    (): { label: string; value: AuthMode; icon: ReactNode }[] => [
      { label: 'Вход', value: 'login', icon: <LoginOutlined /> },
      { label: 'Регистрация', value: 'register', icon: <UserAddOutlined /> },
    ],
    [],
  )

  useEffect(() => {
    dispatch(clearAuthError())
    form.resetFields()
  }, [dispatch, form, mode])

  if (token) {
    return <Navigate to="/tasks" replace />
  }

  const handleModeChange = (value: AuthMode) => {
    navigate(value === 'login' ? '/login' : '/register')
  }

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      if (mode === 'login') {
        const payload: LoginRequest = {
          nickname: values.nickname,
          password: values.password,
        }
        await dispatch(login(payload)).unwrap()
        navigate('/tasks', { replace: true })
        return
      }

      await dispatch(register(values)).unwrap()
      navigate('/tasks', { replace: true })
    } catch {
      // Error text is stored in Redux and rendered above the form.
    }
  }

  return (
    <main className="auth-page">
      <Card className="auth-card">
        <div className="auth-heading">
          <Typography.Title level={1}>Task Board</Typography.Title>
          <Typography.Text type="secondary">
            Task Board
          </Typography.Text>
        </div>

        <Segmented<AuthMode>
          block
          value={mode}
          options={modeOptions}
          onChange={handleModeChange}
        />

        <Typography.Title className="form-title" level={2}>
          {title}
        </Typography.Title>

        {error && (
          <Alert
            showIcon
            className="form-alert"
            type="error"
            message={error}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Никнейм"
            name="nickname"
            normalize={(value: string) => value?.trim().toLowerCase()}
            rules={[
              { required: true, message: 'Введите никнейм' },
              { min: 3, message: 'Минимум 3 символа' },
              { max: 24, message: 'Максимум 24 символа' },
              {
                pattern: /^[a-z0-9_]+$/,
                message: 'Только латиница в нижнем регистре, цифры и _',
              },
            ]}
          >
            <Input prefix={<UserOutlined />} autoComplete="username" />
          </Form.Item>

          {mode === 'register' && (
            <Form.Item
              label="Email"
              name="email"
              normalize={(value: string) => value?.trim() || undefined}
              rules={[{ type: 'email', message: 'Введите корректный email' }]}
            >
              <Input prefix={<MailOutlined />} autoComplete="email" />
            </Form.Item>
          )}

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 8, message: 'Минимум 8 символов' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>

          <Button
            block
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={mode === 'login' ? <LoginOutlined /> : <UserAddOutlined />}
          >
            {submitText}
          </Button>
        </Form>

        <Typography.Paragraph className="seed-hint" type="secondary">
          Для проверки можно использовать seeded-аккаунты: admin / password123
          или user / password123.
        </Typography.Paragraph>
      </Card>
    </main>
  )
}
