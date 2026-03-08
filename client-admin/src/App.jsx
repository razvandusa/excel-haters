import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import RoleSelectionPage from './auth/RoleSelectionPage.jsx'
import ConfiguratorPage from './configurator/ConfiguratorPage.jsx'
import CreateTerminalWithAiPage from './configurator/CreateTerminalWithAiPage.jsx'
import TerminalComponentsPage from './configurator/TerminalComponentsPage.jsx'
import FlightsPage from './flights/FlightsPage.jsx'
import RecommendationPage from './recommendation/RecommendationPage.jsx'
import TabNav from './shared/TabNav.jsx'
import TimetablesPage from './timetables/TimetablesPage.jsx'

const ROLE_STORAGE_KEY = 'client-admin-role'

const tabs = [
  {
    id: 'configurator',
    label: 'Configurator',
    path: '/configurator',
  },
  {
    id: 'timetables',
    label: 'Timetables',
    path: '/timetables',
  },
  {
    id: 'flights',
    label: 'Flights',
    path: '/flights',
  },
  {
    id: 'recommendation',
    label: 'Flight Viewer',
    path: '/recommendation',
  },
]

const defaultPathByRole = {
  admin: '/configurator',
  user: '/recommendation',
}

function readStoredRole() {
  if (typeof window === 'undefined') {
    return ''
  }

  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY)
  return storedRole === 'admin' || storedRole === 'user' ? storedRole : ''
}

function ProtectedRoute({ allowedRoles, role, children }) {
  if (!role) {
    return <Navigate to="/" replace />
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={defaultPathByRole[role]} replace />
  }

  return children
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [role, setRole] = useState(readStoredRole)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!role) {
      window.localStorage.removeItem(ROLE_STORAGE_KEY)
      return
    }

    window.localStorage.setItem(ROLE_STORAGE_KEY, role)
  }, [role])

  const visibleTabs = role === 'admin'
    ? tabs
    : tabs.filter((tab) => tab.id === 'recommendation')
  const shouldShowTabs = Boolean(role) && location.pathname !== '/'

  function handleLogout() {
    setRole('')
    navigate('/', { replace: true })
  }

  return (
    <main className="app-shell">
      {shouldShowTabs ? (
        <TabNav tabs={visibleTabs} onLogout={handleLogout} />
      ) : null}
      <Routes>
        <Route
          path="/"
          element={
            <RoleSelectionPage
              activeRole={role}
              onSelectRole={setRole}
            />
          }
        />
        <Route
          path="/configurator"
          element={
            <ProtectedRoute allowedRoles={['admin']} role={role}>
              <ConfiguratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configurator/create-terminal-with-ai"
          element={
            <ProtectedRoute allowedRoles={['admin']} role={role}>
              <CreateTerminalWithAiPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configurator/:terminalName"
          element={
            <ProtectedRoute allowedRoles={['admin']} role={role}>
              <TerminalComponentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetables"
          element={
            <ProtectedRoute allowedRoles={['admin']} role={role}>
              <TimetablesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flights"
          element={
            <ProtectedRoute allowedRoles={['admin']} role={role}>
              <FlightsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'user']} role={role}>
              <RecommendationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={role ? defaultPathByRole[role] : '/'}
              replace
            />
          }
        />
      </Routes>
    </main>
  )
}
