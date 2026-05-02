import { Checkbox, Form, Input, Select } from 'antd'
import { useEffect } from 'react'
import {
  priorityOptions,
  statusOptions,
  visibilityOptions,
} from '../../labels'
import type {
  CreateTaskRequest,
  ReplaceTaskRequest,
  Task,
  TaskPriority,
  TaskStatus,
  TaskVisibility,
  UserPicker,
} from '../../types'

type TaskFormValues = {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  visibility: TaskVisibility
  viewerUserIds?: string[]
  selfAssigned?: boolean
}

type TaskFormProps = {
  task?: Task | null
  formId: string
  users: UserPicker[]
  currentUserId: string
  loading: boolean
  onSubmit: (payload: CreateTaskRequest | ReplaceTaskRequest) => Promise<void>
}

const getInitialValues = (task?: Task | null): TaskFormValues => ({
  title: task?.title ?? '',
  description: task?.description ?? '',
  status: task?.status ?? 'TODO',
  priority: task?.priority ?? 'MEDIUM',
  visibility: task?.visibility ?? 'ONLY_ME',
  viewerUserIds: task?.viewerUserIds ?? [],
  selfAssigned: false,
})

export const TaskForm = ({
  currentUserId,
  formId,
  loading,
  onSubmit,
  task,
  users,
}: TaskFormProps) => {
  const [form] = Form.useForm<TaskFormValues>()
  const visibility = Form.useWatch('visibility', form)
  const isEdit = Boolean(task)

  useEffect(() => {
    form.setFieldsValue(getInitialValues(task))
  }, [form, task])

  const handleFinish = async (values: TaskFormValues) => {
    const viewerUserIds =
      values.visibility === 'LIST' ? values.viewerUserIds ?? [] : []


    if (isEdit) {
      await onSubmit({
        title: values.title.trim(),
        description: values.description?.trim() ?? '',
        status: values.status,
        priority: values.priority,
        visibility: values.visibility,
        viewerUserIds,
      })
      return
    }

    await onSubmit({
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      status: values.status,
      priority: values.priority,
      visibility: values.visibility,
      viewerUserIds,
      assigneeId: values.selfAssigned ? currentUserId : undefined,
    })
  }

  return (
    <Form
      form={form}
      id={formId}
      layout="vertical"
      requiredMark={false}
      initialValues={getInitialValues(task)}
      onFinish={handleFinish}
      disabled={loading}
    >
      <Form.Item
        label="Название"
        name="title"
        rules={[
          { required: true, message: 'Введите название задачи' },
          { max: 500, message: 'Максимум 500 символов' },
          {
            validator: (_, value: string | undefined) =>
              value?.trim()
                ? Promise.resolve()
                : Promise.reject(new Error('Название не может быть пустым')),
          },
        ]}
      >
        <Input placeholder="Введите название задачи" />
      </Form.Item>

      <Form.Item
        label="Описание"
        name="description"
        rules={[{ max: 5000, message: 'Максимум 5000 символов' }]}
      >
        <Input.TextArea rows={5} placeholder="Описание задачи" />
      </Form.Item>

      <div className="form-grid">
        <Form.Item label="Статус" name="status">
          <Select options={statusOptions} />
        </Form.Item>
        <Form.Item label="Приоритет" name="priority">
          <Select options={priorityOptions} />
        </Form.Item>
      </div>

      <Form.Item label="Видимость" name="visibility">
        <Select options={visibilityOptions} />
      </Form.Item>

      {visibility === 'LIST' && (
        <Form.Item
          label="Кому видна задача"
          name="viewerUserIds"
          rules={[{ required: true, message: 'Выберите хотя бы одного пользователя' }]}
        >
          <Select
            mode="multiple"
            optionFilterProp="label"
            options={users
              .filter((user) => user.id !== currentUserId)
              .map((user) => ({
                label: user.email ? `${user.nickname} (${user.email})` : user.nickname,
                value: user.id,
              }))}
          />
        </Form.Item>)}

      {!isEdit && (
        <Form.Item name="selfAssigned" valuePropName="checked">
          <Checkbox>Назначить задачу на себя</Checkbox>
        </Form.Item>
      )}
    </Form>
  )
}
