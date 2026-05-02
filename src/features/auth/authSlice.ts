import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'
import type {
  AuthResponse,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  User,
} from '../../types'

type AuthState = {
  token: string | null
  user: User | null
  loading: boolean
  error: string | null
  passwordLoading: boolean
}

const savedToken = localStorage.getItem('taskBoardToken')
const savedUser = localStorage.getItem('taskBoardUser')

const initialState: AuthState = {
  token: savedToken,
  user: savedUser ? (JSON.parse(savedUser) as User) : null,
  loading: false,
  error: null,
  passwordLoading: false,
}

const persistAuth = ({ accessToken, user }: AuthResponse) => {
  localStorage.setItem('taskBoardToken', accessToken)
  localStorage.setItem('taskBoardUser', JSON.stringify(user))
}

export const login = createAsyncThunk(
  'auth/login',
  async (payload: LoginRequest) => {
    const response = await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    persistAuth(response)
    return response
  },
)

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterRequest) => {
    const response = await apiClient<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    persistAuth(response)
    return response
  },
)

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (payload: ChangePasswordRequest) =>
    apiClient<{ ok: true }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      state.error = null
      localStorage.removeItem('taskBoardToken')
      localStorage.removeItem('taskBoardUser')
    },
    clearAuthError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Не удалось войти'
      })
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message ?? 'Не удалось зарегистрироваться'
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.passwordLoading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false
        state.error = action.error.message ?? 'Не удалось сменить пароль'
      })
  },
})

export const { clearAuthError, logout } = authSlice.actions
export default authSlice.reducer
