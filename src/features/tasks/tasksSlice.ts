import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type {
  CreateTaskRequest,
  ReplaceTaskRequest,
  Task,
  TaskFilters,
  TaskListResponse,
  TaskQuery,
  TaskStatus,
  UserPicker,
} from '../../types'

const defaultFilters: TaskFilters = {
  q: '',
  status: [],
  priority: [],
  tag: [],
  mine: 'all',
  sort: 'updatedAt',
  order: 'desc',
}

type TasksState = {
  items: Task[]
  current: Task | null
  users: UserPicker[]
  filters: TaskFilters
  page: number
  pageSize: number
  total: number
  listLoading: boolean
  currentLoading: boolean
  mutationLoading: boolean
  dictionariesLoading: boolean
  error: string | null
}

const initialState: TasksState = {
  items: [],
  current: null,
  users: [],
  filters: defaultFilters,
  page: 1,
  pageSize: 10,
  total: 0,
  listLoading: false,
  currentLoading: false,
  mutationLoading: false,
  dictionariesLoading: false,
  error: null,
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (query: TaskQuery | undefined, { getState }) => {
    const state = getState() as { tasks: TasksState }
    const filters = { ...state.tasks.filters, ...query }

    return apiClient<TaskListResponse>('/tasks', {
      query: {
        page: query?.page ?? state.tasks.page,
        pageSize: query?.pageSize ?? state.tasks.pageSize,
        q: filters.q,
        status: filters.status,
        priority: filters.priority,
        assignmentStatus: filters.assignmentStatus,
        tag: filters.tag,
        mine: filters.mine,
        sort: filters.sort,
        order: filters.order,
      },
    })
  },
)

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string) => apiClient<Task>(`/tasks/${id}`),
)

export const fetchUsers = createAsyncThunk(
  'tasks/fetchUsers',
  async () => apiClient<UserPicker[]>('/users'),
)

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (payload: CreateTaskRequest) =>
    apiClient<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
)

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, payload }: { id: string; payload: ReplaceTaskRequest }) =>
    apiClient<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
)

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    await apiClient<{ ok: true }>(`/tasks/${id}`, { method: 'DELETE' })
    return id
  },
)

export const selfAssignTask = createAsyncThunk(
  'tasks/selfAssignTask',
  async ({ id, userId }: { id: string; userId: string }) =>
    apiClient<Task>(`/tasks/${id}/assignment`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId: userId }),
    }),
)


//todo ДЕЛАТЬ ЛИ ОТДЕЛЬНУЮ КНОПКУ ИЗМЕНЕНИЯ СТАТУСА???
export const assigneeStatus = createAsyncThunk<Task, { id: string; status: TaskStatus }>(
  "tasks/assignee-status",
  async ({ id, status }) => {
    const res = await apiClient<Task>(
      `/tasks/${id}/assignee-status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    )
    return res
  }
)

const upsertTask = (items: Task[], task: Task) => {
  const index = items.findIndex((item) => item.id === task.id)

  if (index === -1) {
    items.unshift(task)
    return
  }

  items[index] = task
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1
    },
    resetFilters(state) {
      state.filters = defaultFilters
      state.page = 1
    },
    setPagination(state, action: PayloadAction<{ page: number; pageSize: number }>) {
      state.page = action.payload.page
      state.pageSize = action.payload.pageSize
    },
    clearTaskError(state) {
      state.error = null
    },
    clearCurrentTask(state) {
      state.current = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.listLoading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.listLoading = false
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.pageSize = action.payload.pageSize
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.listLoading = false
        state.error = action.error.message ?? 'Не удалось загрузить задачи'
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.currentLoading = true
        state.error = null
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.currentLoading = false
        state.current = action.payload
        upsertTask(state.items, action.payload)
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.currentLoading = false
        state.error = action.error.message ?? 'Не удалось открыть задачу'
      })
      .addCase(fetchUsers.pending, (state) => {
        state.dictionariesLoading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.dictionariesLoading = false
        state.users = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.dictionariesLoading = false
        state.error = action.error.message ?? 'Не удалось загрузить пользователей'
      })
      .addCase(createTask.pending, (state) => {
        state.mutationLoading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.mutationLoading = false
        upsertTask(state.items, action.payload)
        state.total += 1
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationLoading = false
        state.error = action.error.message ?? 'Не удалось создать задачу'
      })
      .addCase(updateTask.pending, (state) => {
        state.mutationLoading = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.current = action.payload
        upsertTask(state.items, action.payload)
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationLoading = false
        state.error = action.error.message ?? 'Не удалось обновить задачу'
      })
      .addCase(deleteTask.pending, (state) => {
        state.mutationLoading = true
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.items = state.items.filter((task) => task.id !== action.payload)
        state.current = null
        state.total = Math.max(0, state.total - 1)
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutationLoading = false
        state.error = action.error.message ?? 'Не удалось удалить задачу'
      })
      .addCase(selfAssignTask.pending, (state) => {
        state.mutationLoading = true
        state.error = null
      })
      .addCase(selfAssignTask.fulfilled, (state, action) => {
        state.mutationLoading = false
        state.current = action.payload
        upsertTask(state.items, action.payload)
      })
      .addCase(selfAssignTask.rejected, (state, action) => {
        state.mutationLoading = false
        state.error = action.error.message ?? 'Не удалось назначить задачу'
      })
      
      .addCase(assigneeStatus.pending, (state)=> {
        state.mutationLoading = true
        state.error = null
      })

      .addCase(assigneeStatus.fulfilled, (state, action)=> {
        state.mutationLoading = false
        state.current = action.payload
        upsertTask(state.items, action.payload)
      })

      .addCase(assigneeStatus.rejected, (state, action)=> {
        state.mutationLoading = false
        state.error = action.error.message ?? 'Не удалось поменять статус задачи'
      })
  },
})

export const {
  clearCurrentTask,
  clearTaskError,
  resetFilters,
  setFilters,
  setPagination,
} = tasksSlice.actions
export default tasksSlice.reducer
