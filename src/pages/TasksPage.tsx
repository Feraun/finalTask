import {
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import type { TableProps } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { TaskDetail } from '../features/tasks/TaskDetail'
import { TaskFiltersBar } from '../features/tasks/TaskFiltersBar'
import { TaskForm } from '../features/tasks/TaskForm'
import {
  assigneeStatus,
  clearCurrentTask,
  clearTaskError,
  createTask,
  deleteTask,
  fetchTaskById,
  fetchTasks,
  fetchUsers,
  selfAssignTask,
  setPagination,
  updateTask,
} from '../features/tasks/tasksSlice'
import {
  assignmentLabels,
  formatDate,
  priorityLabels,
  statusLabels,
} from '../labels'
import type { CreateTaskRequest, ReplaceTaskRequest, Task, TaskStatus } from '../types'

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

export const TasksPage = () => {

  const dispatch = useAppDispatch()

  const [messageApi, contextHolder] = message.useMessage()

  const [createOpen, setCreateOpen] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)

  const [editTask, setEditTask] = useState<Task | null>(null)

  const user = useAppSelector((state) => state.auth.user)

  const {
    current,
    currentLoading,
    dictionariesLoading,
    error,
    filters,
    items,
    listLoading,
    mutationLoading,
    page,
    pageSize,
    total,
    users,
  } = useAppSelector((state) => state.tasks)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchTasks(undefined))
  }, [dispatch, filters, page, pageSize])

  const openTask = useCallback((id: string) => {
    setDetailOpen(true)
    dispatch(fetchTaskById(id))
  }, [dispatch])

  const refreshTasks = () => {
    dispatch(fetchTasks(undefined))
  }

  const handleCreate = async (payload: CreateTaskRequest | ReplaceTaskRequest) => {
    try {
      await dispatch(createTask(payload as CreateTaskRequest)).unwrap()
      messageApi.success('Задача создана')
      setCreateOpen(false)

    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось создать задачу')
    }
  }

  const handleUpdate = async (payload: CreateTaskRequest | ReplaceTaskRequest) => {
    if (!editTask) {
      return
    }

    try {
      await dispatch(
        updateTask({
          id: editTask.id,
          payload: payload as ReplaceTaskRequest,
        }),
      ).unwrap()
      messageApi.success('Задача обновлена')
      setEditTask(null)

    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось обновить задачу')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteTask(id)).unwrap()
      messageApi.success('Задача удалена')
      setDetailOpen(false)

    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : 'Не удалось удалить задачу')
    }
  }

  const handleChangeStatus = async(id: string, status: TaskStatus) => {
    try {
      await dispatch(assigneeStatus({id, status})).unwrap()
      messageApi.success("Статус задачи сменился")
      setDetailOpen(false)
    } catch (error){
      messageApi.error(error instanceof Error ? error.message : 'Не удалось сменить статус задачу')
    }
  }

  const handleSelfAssign = async (id: string) => {
      if (!user){
        return
      }
      await dispatch(selfAssignTask({ id, userId: user.id })).unwrap()
      messageApi.success('Задача назначена на вас')
  }

  const columns = useMemo<TableProps<Task>['columns']>(
    () => [
      {
        title: 'Задача',
        dataIndex: 'title',
        key: 'title',
        render: (title: string, task) => (
          <div>
            <Button type="link" className="task-title-link" onClick={() => openTask(task.id)}>
              {title}
            </Button>
            <Typography.Text className="task-meta" type="secondary">
              Автор: {task.creator.nickname}
            </Typography.Text>
          </div>
        ),
      },
      {
        title: 'Статус',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (status: Task['status']) => (
          <Tag color={statusColor[status]}>{statusLabels[status]}</Tag>
        ),
      },
      {
        title: 'Приоритет',
        dataIndex: 'priority',
        key: 'priority',
        width: 140,
        render: (priority: Task['priority']) => (
          <Tag color={priorityColor[priority]}>{priorityLabels[priority]}</Tag>
        ),
      },
      {
        title: 'Исполнитель',
        key: 'assignee',
        width: 170,
        render: (_, task) => task.assignee?.nickname ?? 'Не назначен',
      },
      {
        title: 'Назначение',
        dataIndex: 'assignmentStatus',
        key: 'assignmentStatus',
        width: 180,
        render: (status: Task['assignmentStatus']) => assignmentLabels[status],
      },
      {
        title: 'Обновлена',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 170,
        render: (date: string) => formatDate(date),
      },
      {
        title: '',
        key: 'actions',
        fixed: 'right',
        width: 150,
        render: (_, task) => (
          <Button icon={<EyeOutlined />} onClick={() => openTask(task.id)}>
            Открыть
          </Button>
        ),
      },
    ],
    [openTask],
  )

  if (!user) {
    return null
  }

  return (
    <main className="tasks-page">
      {contextHolder}
      <div className="page-heading">
        <div>
          <Typography.Title>Задачи</Typography.Title>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refreshTasks}>
            Обновить
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            Новая задача
          </Button>
        </Space>
      </div>

      {error && (
        <Alert
          showIcon
          closable
          className="page-alert"
          type="error"
          message={error}
          onClose={() => dispatch(clearTaskError())}
        />
      )}

      <TaskFiltersBar />

      <Card className="table-card">
        <Table<Task>
          rowKey="id"
          loading={listLoading || dictionariesLoading}
          columns={columns}
          dataSource={items}
          scroll={{ x: 1160 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: (value) => `Всего: ${value}`,
            onChange: (nextPage, nextPageSize) =>
              dispatch(setPagination({ page: nextPage, pageSize: nextPageSize })),
          }}
        />
      </Card>

      <Modal
        title="Новая задача"
        open={createOpen}
        okText="Создать"
        cancelText="Отмена"
        confirmLoading={mutationLoading}
        onCancel={() => setCreateOpen(false)}
        onOk={() => document.querySelector<HTMLFormElement>('#create-task-form')?.requestSubmit()}
      >
        <TaskForm
          formId="create-task-form"
          users={users}
          currentUserId={user.id}
          loading={mutationLoading}
          onSubmit={handleCreate}
        />
      </Modal>

      <Modal
        title="Редактирование задачи"
        open={Boolean(editTask)}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={mutationLoading}
        onCancel={() => {
          setEditTask(null)
          setDetailOpen(true)
        }}
        onOk={() => document.querySelector<HTMLFormElement>('#edit-task-form')?.requestSubmit()}
      >
        <TaskForm
          formId="edit-task-form"
          task={editTask}
          users={users}
          currentUserId={user.id}
          loading={mutationLoading}
          onSubmit={handleUpdate}
        />
      </Modal>

      <TaskDetail
        open={detailOpen}
        task={current}
        currentUser={user}
        loading={currentLoading}
        mutationLoading={mutationLoading}
        onClose={() => {
          setDetailOpen(false)
          dispatch(clearCurrentTask())
        }}
        onEdit={(task) => {
          setDetailOpen(false);
          setEditTask(task);
          }}
        onDelete={handleDelete}
        onSelfAssign={handleSelfAssign}
        onChangeStatus={handleChangeStatus}
      />
    </main>
  )
}
