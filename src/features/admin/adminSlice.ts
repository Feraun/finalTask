import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type { AdminUserRow } from '../../types'

type AdminState = {
  users: AdminUserRow[]
  usersLoading: boolean
  banLoading: boolean
  error: string | null
}

const initialState: AdminState = {
  users: [],
  usersLoading: false,
  banLoading: false,
  error: null,
}

export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchUsers',
  async () => apiClient<AdminUserRow[]>('/admin/users'),
)

export const banUser = createAsyncThunk(
  'admin/banUser',
  async (userId: string) => {
    await apiClient<{ ok: true }>(`/admin/users/${userId}/ban`, {
      method: 'POST',
    })
    return userId
  },
)

export const unbanUser = createAsyncThunk(
  'admin/unbanUser',
  async (userId: string) => {
    await apiClient<{ ok: true }>(`/admin/users/${userId}/unban`, {
      method: 'POST',
    })
    return userId
  },
)

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder


      //редьюсеры под загрузку юзеров
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true
        state.error = null
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false
        state.users = action.payload
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false
        state.error = action.error.message ?? 'Не удалось загрузить пользователей'
      })
      
      //редьюсеры под бан юзера
      .addCase(banUser.pending, (state) => {
        state.banLoading = true
        state.error = null
      })
      .addCase(banUser.fulfilled, (state, action) => {
        state.banLoading = false
        const user = state.users.find((item) => item.id === action.payload)
        if (user) {
          user.bannedAt = new Date().toISOString()
        }
      })
      .addCase(banUser.rejected, (state, action) => {
        state.banLoading = false
        state.error = action.error.message ?? 'Не удалось заблокировать пользователя'
      })

      //редьюсеры под разбан юзера
      .addCase(unbanUser.pending, (state) => {
        state.banLoading = true
        state.error = null
      })
      .addCase(unbanUser.fulfilled, (state, action) => {
        state.banLoading = false
        const user = state.users.find((item) => item.id === action.payload)
        if (user) {
          user.bannedAt = null
        }
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.banLoading = false
        state.error = action.error.message ?? 'Не удалось разблокировать пользователя'
      })

  },
})

export const { clearAdminError } = adminSlice.actions
export default adminSlice.reducer