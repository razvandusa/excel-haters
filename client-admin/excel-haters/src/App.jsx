import { Navigate, Route, Routes } from 'react-router-dom'
import ConfiguratorPage from './configurator/ConfiguratorPage.jsx'
import CreateTerminalWithAiPage from './configurator/CreateTerminalWithAiPage.jsx'
import TerminalComponentsPage from './configurator/TerminalComponentsPage.jsx'
import FlightsPage from './flights/FlightsPage.jsx'
import RecommendationPage from './recommendation/RecommendationPage.jsx'
import TabNav from './shared/TabNav.jsx'
import TimetablesPage from './timetables/TimetablesPage.jsx'

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
    label: 'Recommendation',
    path: '/recommendation',
  },
]

export default function App() {
  return (
    <main className="app-shell">
      <TabNav tabs={tabs} />
      <Routes>
        <Route path="/" element={<Navigate to="/configurator" replace />} />
        <Route path="/configurator" element={<ConfiguratorPage />} />
        <Route
          path="/configurator/create-terminal-with-ai"
          element={<CreateTerminalWithAiPage />}
        />
        <Route
          path="/configurator/:terminalName"
          element={<TerminalComponentsPage />}
        />
        <Route path="/timetables" element={<TimetablesPage />} />
        <Route path="/flights" element={<FlightsPage />} />
        <Route path="/recommendation" element={<RecommendationPage />} />
      </Routes>
    </main>
  )
}
