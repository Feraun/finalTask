import { configureStore } from '@reduxjs/toolkit'
import adminReducer from '../features/admin/adminSlice'
import authReducer from '../features/auth/authSlice'
import tasksReducer from '../features/tasks/tasksSlice'

export const store = configureStore({
  reducer: {
    admin: adminReducer,
    auth: authReducer,
    tasks: tasksReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
