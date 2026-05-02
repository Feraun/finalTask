import {
  DeleteOutlined,
  EditOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import {
  Button,
  Descriptions,
  Drawer,
  Empty,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import {
  assignmentLabels,
  formatDate,
  priorityLabels,
  statusLabels,
  statusOptions,
} from '../../labels'
import type { Task, User, TaskStatus } from '../../types'

type TaskDetailProps = {
  open: boolean
  task: Task | null
  currentUser: User
  loading: boolean
  mutationLoading: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onSelfAssign: (id: string) => void
  onChangeStatus: (id: string, status: TaskStatus) => void 
}

const statusColor: Record<Task['status'], string> = {
  TODO: 'default',
  IN_PROGRESS: 'processing',
  DONE: 'success',
}

const priorityColor: Record<Task['priority'], string> = {
  LOW: 'blue',
  MEDIUM: 'gold',
  HIGH: 'red',
}

export const TaskDetail = ({
  currentUser,
  loading,
  mutationLoading,
  onClose,
  onDelete,
  onEdit,
  onSelfAssign,
  open,
  task,
  onChangeStatus
}: TaskDetailProps) => {
  const canManage =
    task && (task.creator.id === currentUser.id || currentUser.role === 'ADMIN')

  return (
    <Drawer
      destroyOnHidden
      width={560}
      title="Детали задачи"
      open={open}
      onClose={onClose}
      extra={
        task ? (
          <Space>
            {!task.assignee && (
              <Button
                icon={<UserSwitchOutlined />}
                loading={mutationLoading}
                onClick={() => onSelfAssign(task.id)}
              >
                Взять себе
              </Button>
            )}
            {canManage && (
              <Button icon={<EditOutlined />} onClick={() => onEdit(task)}>
                Изменить
              </Button>
            )}
            {canManage && (
              <Popconfirm
                title="Удалить задачу?"
                okText="Удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true, loading: mutationLoading }}
                onConfirm={() => onDelete(task.id)}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Удалить
                </Button>
              </Popconfirm>
            )}
          </Space>
        ) : null
      }
    >
      {loading && <Spin className="drawer-spinner" />}

      {!loading && !task && <Empty description="Задача не выбрана" />}

      {!loading && task && (
        <Space className="detail-stack" direction="vertical" size="large">
          <div>
            <Typography.Title level={3}>{task.title}</Typography.Title>
            <Typography.Paragraph type="secondary">
              {task.description || 'Описание не указано'}
            </Typography.Paragraph>
          </div>

          <Space wrap>
            <Tag color={statusColor[task.status]}>{statusLabels[task.status]}</Tag>
            <Tag color={priorityColor[task.priority]}>
              {priorityLabels[task.priority]}
            </Tag>
            <Tag>{assignmentLabels[task.assignmentStatus]}</Tag>
          </Space>

          <Descriptions
            bordered
            column={1}
            size="small"
            items={[
              {
                key: 'creator',
                label: 'Автор',
                children: task.creator.nickname,
              },
              {
                key: 'assignee',
                label: 'Исполнитель',
                children: task.assignee?.nickname ?? 'Не назначен',
              },
              {
                key: 'createdAt',
                label: 'Создана',
                children: formatDate(task.createdAt),
              },
              {
                key: 'updatedAt',
                label: 'Обновлена',
                children: formatDate(task.updatedAt),
              },
            ]}
          />

          { task.assignee?.id === currentUser.id && (
            <Select
              value = {task.status}
              options = {statusOptions}
              loading={mutationLoading}
              onChange={(status) => onChangeStatus(task.id, status)}
            />
          )}
        </Space>
      )}
    </Drawer>
  )
}
