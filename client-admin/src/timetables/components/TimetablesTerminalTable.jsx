import { useEffect, useState } from 'react'
import useTimetablesTerminalComponents from '../hooks/useTimetablesTerminalComponents.js'

function formatTerminalLabel(terminal) {
  return `${terminal.id} - ${terminal.name}`
}

function formatComponentLabel(component) {
  const typeSuffix = component.type ? ` (${component.type})` : ''

  return `${component.id} - ${component.name}${typeSuffix}`
}

function formatTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export default function TimetablesTerminalTable({
  terminals,
  terminalsTitle,
  componentsTitle,
  isLoading = false,
  error = '',
}) {
  const [selectedTerminalId, setSelectedTerminalId] = useState('')
  const [selectedComponentId, setSelectedComponentId] = useState('')
  const { components, componentsError, componentsLoading, hasFetchedComponents } =
    useTimetablesTerminalComponents(selectedTerminalId)

  useEffect(() => {
    if (!terminals.length) {
      setSelectedTerminalId('')
      return
    }

    const hasSelectedTerminal = terminals.some(
      (terminal) => String(terminal.id) === selectedTerminalId,
    )

    if (!hasSelectedTerminal) {
      setSelectedTerminalId(String(terminals[0].id))
    }
  }, [selectedTerminalId, terminals])

  useEffect(() => {
    if (!components.length) {
      setSelectedComponentId('')
      return
    }

    const hasSelectedComponent = components.some(
      (component) => String(component.id) === selectedComponentId,
    )

    if (!hasSelectedComponent) {
      setSelectedComponentId(String(components[0].id))
    }
  }, [components, selectedComponentId])

  useEffect(() => {
    if (!selectedComponentId) {
      return
    }

    const selectedComponent = components.find(
      (component) => String(component.id) === selectedComponentId,
    )

    if (selectedComponent) {
      const componentId = selectedComponent.elementId ?? selectedComponent.id

      console.log(
        `GET /api/components/${componentId}/assignments?date=${formatTodayDate()}`,
      )
    }
  }, [components, selectedComponentId])

  return (
    <div className="configurator-tables-layout">
      <section className="configurator-table-card">
        <div className="configurator-table-card__header">
          <div>
            <h2 className="configurator-table-card__title">{terminalsTitle}</h2>
          </div>
          <span className="configurator-table-card__count">
            {terminals.length} items
          </span>
        </div>

        <div className="p-5">
          {isLoading ? (
            <p className="configurator-table__feedback">Loading terminals...</p>
          ) : null}

          {!isLoading && error ? (
            <p className="configurator-table__feedback configurator-table__feedback--error">
              {error}
            </p>
          ) : null}

          {!isLoading && !error && terminals.length === 0 ? (
            <p className="configurator-table__feedback">No terminals found.</p>
          ) : null}

          {!isLoading && !error && terminals.length > 0 ? (
            <select
              value={selectedTerminalId}
              onChange={(event) => setSelectedTerminalId(event.target.value)}
              className="configurator-modal__input w-full"
            >
              {terminals.map((terminal) => (
                <option key={terminal.id} value={String(terminal.id)}>
                  {formatTerminalLabel(terminal)}
                </option>
              ))}
            </select>
          ) : null}

          {!isLoading && !error && terminals.length > 0 && componentsLoading ? (
            <p className="configurator-table__feedback mt-4">
              Loading components...
            </p>
          ) : null}

          {!isLoading && !error && terminals.length > 0 && componentsError ? (
            <p className="configurator-table__feedback configurator-table__feedback--error mt-4">
              {componentsError}
            </p>
          ) : null}
        </div>
      </section>

      {!isLoading && !error && hasFetchedComponents ? (
        <section className="configurator-table-card">
          <div className="configurator-table-card__header">
            <div>
              <h2 className="configurator-table-card__title">{componentsTitle}</h2>
            </div>
            <span className="configurator-table-card__count">
              {components.length} items
            </span>
          </div>

          <div className="p-5">
            {components.length === 0 ? (
              <p className="configurator-table__feedback">
                No components found for this terminal.
              </p>
            ) : (
              <select
                value={selectedComponentId}
                onChange={(event) => setSelectedComponentId(event.target.value)}
                className="configurator-modal__input w-full"
              >
                {components.map((component) => (
                  <option key={component.id} value={String(component.id)}>
                    {formatComponentLabel(component)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>
      ) : null}
    </div>
  )
}
