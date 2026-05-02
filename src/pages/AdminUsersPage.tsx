import {
  ReloadOutlined,
  StopOutlined,
  UnlockOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Popconfirm,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { TableProps } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import {
  banUser,
  clearAdminError,
  fetchAdminUsers,
  unbanUser,
} from '../features/admin/adminSlice'
import { formatDate } from '../labels'
import type { AdminUserRow } from '../types'

export const AdminUsersPage = () => {
  const dispatch = useAppDispatch()
  const [messageApi, contextHolder] = message.useMessage()
  const currentUser = useAppSelector((state) => state.auth.user)
  const { error, banLoading, users, usersLoading } = useAppSelector(
    (state) => state.admin,
  )

  useEffect(() => {
    dispatch(fetchAdminUsers())
  }, [dispatch])

  const handleBan = useCallback(async (userId: string) => {
    try {
      await dispatch(banUser(userId)).unwrap()
      messageApi.success('Пользователь заблокирован')
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : 'Не удалось заблокировать пользователя',
      )
    }
  }, [dispatch, messageApi])

  const handleUnban = useCallback(async (userId: string) => {
    try {
      await dispatch(unbanUser(userId)).unwrap()
      messageApi.success('Пользователь разблокирован')
    } catch (error) {
      messageApi.error(
        error instanceof Error ? error.message : 'Не удалось разблокировать пользователя',
      )
    }
  }, [dispatch, messageApi])

  const columns = useMemo<TableProps<AdminUserRow>['columns']>(
    () => [
      {
        title: 'Пользователь',
        dataIndex: 'nickname',
        key: 'nickname',
        render: (nickname: string, user) => (
          <div>
            <Typography.Text strong>{nickname}</Typography.Text><br/>
            <Typography.Text type="secondary">{user.email}</Typography.Text>
          </div>
        ),
      },
      {
        title: 'Роль',
        dataIndex: 'role',
        key: 'role',
        width: 120,
        render: (role: AdminUserRow['role']) => (
          <Tag color={role === 'ADMIN' ? 'purple' : 'blue'}>{role}</Tag>
        ),
      },
      {
        title: 'Статус',
        dataIndex: 'bannedAt',
        key: 'bannedAt',
        width: 170,
        render: (bannedAt: string | null) =>
          bannedAt ? (
            <Tag color="red">Заблокирован</Tag>
          ) : (
            <Tag color="green">Активен</Tag>
          ),
      },
      {
        title: 'Создан',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        render: (createdAt: string) => formatDate(createdAt),
      },
      {
        title: 'Блокировка',
        dataIndex: 'bannedAt',
        key: 'blockedAt',
        width: 180,
        render: (bannedAt: string | null) =>
          bannedAt ? formatDate(bannedAt) : 'Нет',
      },
      {
        title: '',
        key: 'actions',
        fixed: 'right',
        width: 180,
        render: (_, user) => {
          const isCurrentUser = user.id === currentUser?.id

          if (user.bannedAt) {
            return (
              <Button
                icon={<UnlockOutlined />}
                loading={banLoading}
                onClick={() => handleUnban(user.id)}
              >
                Разблокировать
              </Button>
            )
          }

          return (
            <Popconfirm
              title="Заблокировать пользователя?"
              description="После блокировки пользователь не сможет работать с API."
              okText="Заблокировать"
              cancelText="Отмена"
              okButtonProps={{ danger: true, loading: banLoading }}
              disabled={isCurrentUser}
              onConfirm={() => handleBan(user.id)}
            >
              <Button danger disabled={isCurrentUser} icon={<StopOutlined />}>
                Заблокировать
              </Button>
            </Popconfirm>
          )
        },
      },
    ],
    [currentUser?.id, handleBan, handleUnban, banLoading],
  )

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/tasks" replace />
  }

  return (
    <main className="tasks-page">
      {contextHolder}
      <div className="page-heading">
        <div>
          <Typography.Title>Пользователи</Typography.Title>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => dispatch(fetchAdminUsers())}
        >
          Обновить
        </Button>
      </div>

      {error && (
        <Alert
          showIcon
          closable
          className="page-alert"
          type="error"
          message={error}
          onClose={() => dispatch(clearAdminError())}
        />
      )}

      <Card className="table-card">
        <Table<AdminUserRow>
          rowKey="id"
          loading={usersLoading}
          columns={columns}
          dataSource={users}
          scroll={{ x: 900 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Всего: ${total}`,
          }}
        />
      </Card>
    </main>
  )
}
