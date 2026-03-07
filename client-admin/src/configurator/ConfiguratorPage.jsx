import { Link } from 'react-router-dom'
import TerminalTable from './components/TerminalTable.jsx'
import configuratorContent from './config/configuratorContent.js'
import useTerminalManager from './hooks/useTerminalManager.js'

export default function ConfiguratorPage() {
  const { terminals, terminalsError, terminalsLoading } = useTerminalManager()

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--configurator">
        <p className="page-kicker page-kicker--configurator">
          {configuratorContent.kicker}
        </p>
        <h1 className="page-title">{configuratorContent.title}</h1>
        <div className="configurator-page-actions">
          <button type="button" className="configurator-action-link">
            Create Terminal
          </button>
          <Link
            to="/configurator/create-terminal-with-ai"
            className="configurator-action-link"
          >
            Create Terminal with AI
          </Link>
        </div>

        <div className="mt-8">
          <TerminalTable
            terminals={terminals}
            title={configuratorContent.terminalsTableTitle}
            isLoading={terminalsLoading}
            error={terminalsError}
          />
        </div>
      </div>
    </section>
  )
}
