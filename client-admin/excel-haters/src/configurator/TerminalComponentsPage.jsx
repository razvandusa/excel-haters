import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ComponentTypeColumns from './components/ComponentTypeColumns.jsx'
import useTerminalComponents from './hooks/useTerminalComponents.js'

export default function TerminalComponentsPage() {
  const { terminalName = '' } = useParams()
  const { terminal, components, isLoading, error } =
    useTerminalComponents(terminalName)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftIsActive, setDraftIsActive] = useState(false)

  useEffect(() => {
    setDraftName(terminal?.name || terminalName)
    setDraftIsActive(Boolean(terminal?.isActive))
  }, [terminal, terminalName])

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--configurator">
        <div className="configurator-detail-header">
          <div>
            <p className="page-kicker page-kicker--configurator">Configurator</p>
            <h1 className="page-title">
              {terminal ? terminal.name : terminalName}
            </h1>
          </div>

          <div className="configurator-detail-actions">
            <button
              type="button"
              className="configurator-action-link"
              onClick={() => setIsEditModalOpen(true)}
            >
              Update
            </button>
            <Link to="/configurator" className="configurator-action-link">
              Back
            </Link>
          </div>
        </div>

        <div className="configurator-detail-meta">
          <span
            className={
              terminal?.isActive
                ? 'configurator-status configurator-status--active'
                : 'configurator-status configurator-status--inactive'
            }
          >
            {terminal ? (terminal.isActive ? 'Active' : 'Inactive') : 'Unknown'}
          </span>
        </div>

        <div className="mt-8">
          <ComponentTypeColumns
            components={components}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>

      {isEditModalOpen ? (
        <div
          className="configurator-modal-backdrop"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="configurator-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="configurator-modal__header">
              <h2 className="configurator-modal__title">Update Terminal</h2>
              <button
                type="button"
                className="configurator-modal__close"
                onClick={() => setIsEditModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="configurator-modal__body">
              <label className="configurator-modal__field">
                <span className="configurator-modal__label">Name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="configurator-modal__input"
                />
              </label>

              <label className="configurator-modal__checkbox">
                <input
                  type="checkbox"
                  checked={draftIsActive}
                  onChange={(event) => setDraftIsActive(event.target.checked)}
                />
                <span>Is Active</span>
              </label>
            </div>

            <div className="configurator-modal__actions">
              <button
                type="button"
                className="configurator-pagination-button"
                onClick={() => {
                  setDraftName(terminal?.name || terminalName)
                  setDraftIsActive(Boolean(terminal?.isActive))
                  setIsEditModalOpen(false)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="configurator-action-link"
                onClick={() => setIsEditModalOpen(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
