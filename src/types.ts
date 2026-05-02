export type Role = 'USER' | 'ADMIN'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type TaskVisibility = 'ONLY_ME' | 'LIST' | 'ANYONE'

export type AssignmentStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'

export type User = {
  id: string
  nickname: string
  email: string | null
  role: Role
}

export type UserPicker = User

export type AdminUserRow = User & {
  bannedAt: string | null
  createdAt: string
}

export type UserRef = {
  id: string
  nickname: string
  email: string | null
}

export type TagEntry = {
  id: string
  name: string
}

export type Task = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  visibility: TaskVisibility
  creator: UserRef
  assignee: UserRef | null
  assignmentStatus: AssignmentStatus
  assignedById: string | null
  viewerUserIds: string[]
  createdAt: string
  updatedAt: string
}

export type TaskListResponse = {
  items: Task[]
  total: number
  page: number
  pageSize: number
}

export type AuthResponse = {
  accessToken: string
  user: User
}

export type LoginRequest = {
  nickname: string
  password: string
}

export type RegisterRequest = LoginRequest & {
  email?: string
}

export type ChangePasswordRequest = {
  currentPassword: string
  newPassword: string
}

export type TaskFilters = {
  q: string
  status: TaskStatus[]
  priority: TaskPriority[]
  assignmentStatus?: AssignmentStatus
  tag: string[]
  mine: 'all' | 'created' | 'assigned' | 'involved'
  sort: 'createdAt' | 'updatedAt' | 'title'
  order: 'asc' | 'desc'
}

export type TaskQuery = Partial<TaskFilters> & {
  page?: number
  pageSize?: number
}

export type CreateTaskRequest = {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  visibility?: TaskVisibility
  viewerUserIds?: string[]
  assigneeId?: string
}

export type ReplaceTaskRequest = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  visibility: TaskVisibility
  viewerUserIds: string[]
}

export type ApiErrorBody = {
  message?: string | string[]
  code?: string
  statusCode?: number
}
