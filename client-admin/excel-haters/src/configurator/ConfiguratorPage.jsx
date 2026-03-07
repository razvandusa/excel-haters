import { useState } from 'react'
import { Link } from 'react-router-dom'
import TerminalTable from './components/TerminalTable.jsx'
import terminalTypeOptions from './config/terminalTypeOptions.js'
import configuratorContent from './config/configuratorContent.js'
import useTerminalManager from './hooks/useTerminalManager.js'

function buildNextTerminalPayload(terminals) {
  const nextIndex = terminals.length + 1

  return {
    isActive: true,
    name: `Auto Terminal ${nextIndex}`,
    type: terminalTypeOptions[terminals.length % terminalTypeOptions.length],
  }
}

export default function ConfiguratorPage() {
  const {
    createTerminal,
    isCreatingTerminal,
    terminals,
    terminalsError,
    terminalsLoading,
  } = useTerminalManager()
  const [createError, setCreateError] = useState('')

  async function handleCreateTerminal() {
    setCreateError('')

    try {
      await createTerminal(buildNextTerminalPayload(terminals))
    } catch (error) {
      setCreateError(error.message || 'Failed to create terminal.')
    }
  }

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--configurator">
        <p className="page-kicker page-kicker--configurator">
          {configuratorContent.kicker}
        </p>
        <h1 className="page-title">{configuratorContent.title}</h1>
        <div className="configurator-page-actions">
          <button
            type="button"
            className="configurator-action-link"
            onClick={handleCreateTerminal}
            disabled={isCreatingTerminal}
          >
            {isCreatingTerminal ? 'Creating...' : 'Create Terminal'}
          </button>
          <Link
            to="/configurator/create-terminal-with-ai"
            className="configurator-action-link"
          >
            Create Terminal with AI
          </Link>
        </div>

        {createError ? (
          <p className="configurator-table__feedback configurator-table__feedback--error">
            {createError}
          </p>
        ) : null}

        <div className="mt-8">
          <TerminalTable
            terminals={terminals}
            title={configuratorContent.terminalsTableTitle}
            isLoading={terminalsLoading}
            error={terminalsError}
            showType={false}
          />
        </div>
      </div>
    </section>
  )
}
