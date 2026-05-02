import type {
  AssignmentStatus,
  TaskPriority,
  TaskStatus,
  TaskVisibility,
} from './types'



export const statusLabels: Record<TaskStatus, string> = {
  TODO: 'К выполнению',
  IN_PROGRESS: 'В работе',
  DONE: 'Готово',
}
export const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  label,
  value,
}))


export const priorityLabels: Record<TaskPriority, string> = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
}
export const priorityOptions = Object.entries(priorityLabels).map(
  ([value, label]) => ({
    label,
    value,
  }),
)

export const visibilityLabels: Record<TaskVisibility, string> = {
  ONLY_ME: 'Только я',
  LIST: 'Список пользователей',
  ANYONE: 'Все пользователи',
}
export const visibilityOptions = Object.entries(visibilityLabels).map(
  ([value, label]) => ({
    label,
    value,
  }),
)

export const assignmentLabels: Record<AssignmentStatus, string> = {
  NONE: 'Без исполнителя',
  PENDING: 'Ожидает подтверждения',
  APPROVED: 'Подтверждено',
  REJECTED: 'Отклонено',
}
export const assignmentOptions = Object.entries(assignmentLabels).map(
  ([value, label]) => ({
    label,
    value,
  }),
)

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
