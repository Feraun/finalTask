import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AuthPage } from './pages/AuthPage'
import { TasksPage } from './pages/TasksPage'

const App = () => (
  <Routes>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/tasks" replace />} />
  </Routes>
)

export default App
