import { useEffect, useState } from 'react'
import useTimetablesAssignments from '../hooks/useTimetablesAssignments.js'
import useTimetablesFlights from '../hooks/useTimetablesFlights.js'
import useTimetablesTerminalComponents from '../hooks/useTimetablesTerminalComponents.js'

function formatTerminalLabel(terminal) {
  return `${terminal.id} - ${terminal.name}`
}

function formatComponentLabel(component) {
  const typeSuffix = component.type ? ` (${component.type})` : ''

  return `${component.id} - ${component.name}${typeSuffix}`
}

function getComponentRequestId(component) {
  return String(component.elementId ?? component.id ?? '')
}

function getAssignmentTimeRange(assignment) {
  const startTime =
    assignment.startTime ??
    assignment.timeFrom ??
    assignment.from ??
    assignment.start ??
    ''
  const endTime =
    assignment.endTime ?? assignment.timeTo ?? assignment.to ?? assignment.end ?? ''

  if (startTime && endTime) {
    return `${startTime} - ${endTime}`
  }

  return startTime || endTime || 'Unknown interval'
}

function getAssignmentFlightIdList(assignment) {
  const flightIds =
    assignment.flightIds ??
    assignment.flights ??
    assignment.flightID ??
    assignment.flightId ??
    assignment.id ??
    []

  if (Array.isArray(flightIds)) {
    return flightIds.map((flightId) => String(flightId).trim()).filter(Boolean)
  }

  const normalizedFlightId = String(flightIds).trim()

  return normalizedFlightId ? [normalizedFlightId] : []
}

export default function TimetablesTerminalTable({
  terminals,
  terminalsTitle,
  componentsTitle,
  assignmentsTitle,
  isLoading = false,
  error = '',
}) {
  const [selectedTerminalId, setSelectedTerminalId] = useState('')
  const [confirmedTerminalId, setConfirmedTerminalId] = useState('')
  const [selectedComponentId, setSelectedComponentId] = useState('')
  const [confirmedComponentId, setConfirmedComponentId] = useState('')
  const { components, componentsError, componentsLoading, hasFetchedComponents } =
    useTimetablesTerminalComponents(confirmedTerminalId)
  const {
    assignments,
    assignmentsError,
    assignmentsLoading,
  } = useTimetablesAssignments(confirmedComponentId)
  const { flightsById, flightsError, flightsLoading } =
    useTimetablesFlights(assignments)

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
      setConfirmedComponentId('')
      return
    }

    const hasSelectedComponent = components.some(
      (component) => getComponentRequestId(component) === selectedComponentId,
    )

    if (!hasSelectedComponent) {
      setSelectedComponentId(getComponentRequestId(components[0]))
    }
  }, [components, selectedComponentId])

  function handleConfirmTerminal() {
    if (!selectedTerminalId) {
      return
    }

    setConfirmedTerminalId(selectedTerminalId)
    setSelectedComponentId('')
    setConfirmedComponentId('')
  }

  function handleConfirmComponent() {
    if (!selectedComponentId) {
      return
    }

    setConfirmedComponentId(selectedComponentId)
  }

  function handleBackToTerminals() {
    setConfirmedTerminalId('')
    setSelectedComponentId('')
    setConfirmedComponentId('')
  }

  function handleBackToComponents() {
    setConfirmedComponentId('')
  }

  const currentStep = confirmedComponentId
    ? 'assignments'
    : confirmedTerminalId
      ? 'components'
      : 'terminals'

  return (
    <div>
      {currentStep === 'terminals' ? (
        <section className="configurator-table-card">
          <div className="configurator-table-card__header">
            <div>
              <h2 className="configurator-table-card__title">{terminalsTitle}</h2>
            </div>
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
              <div className="space-y-3">
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
                <button
                  type="button"
                  className="configurator-action-link"
                  onClick={handleConfirmTerminal}
                  disabled={!selectedTerminalId || selectedTerminalId === confirmedTerminalId}
                >
                  Confirm
                </button>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {currentStep === 'components' ? (
        <section className="configurator-table-card">
          <div className="configurator-table-card__header">
            <div>
              <h2 className="configurator-table-card__title">{componentsTitle}</h2>
            </div>
            <button
              type="button"
              className="configurator-pagination-button"
              onClick={handleBackToTerminals}
            >
              Back
            </button>
          </div>

          <div className="p-5">
            {componentsLoading ? (
              <p className="configurator-table__feedback">Loading components...</p>
            ) : null}

            {!componentsLoading && componentsError ? (
              <p className="configurator-table__feedback configurator-table__feedback--error">
                {componentsError}
              </p>
            ) : null}

            {!componentsLoading && !componentsError && components.length === 0 ? (
              <p className="configurator-table__feedback">
                No components found for this terminal.
              </p>
            ) : null}

            {!componentsLoading && !componentsError && hasFetchedComponents ? (
              components.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedComponentId}
                    onChange={(event) => setSelectedComponentId(event.target.value)}
                    className="configurator-modal__input w-full"
                  >
                    {components.map((component) => (
                      <option
                        key={getComponentRequestId(component)}
                        value={getComponentRequestId(component)}
                      >
                        {formatComponentLabel(component)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="configurator-action-link"
                    onClick={handleConfirmComponent}
                    disabled={
                      !selectedComponentId ||
                      selectedComponentId === confirmedComponentId
                    }
                  >
                    Confirm
                  </button>
                </div>
              ) : null
            ) : null}
          </div>
        </section>
      ) : null}

      {currentStep === 'assignments' ? (
        <section className="configurator-table-card">
          <div className="configurator-table-card__header">
            <div>
              <h2 className="configurator-table-card__title">{assignmentsTitle}</h2>
            </div>
            <button
              type="button"
              className="configurator-pagination-button"
              onClick={handleBackToComponents}
            >
              Back
            </button>
          </div>

          <div className="p-5">
            {assignmentsLoading ? (
              <p className="configurator-table__feedback">Loading assignments...</p>
            ) : null}

            {!assignmentsLoading && assignmentsError ? (
              <p className="configurator-table__feedback configurator-table__feedback--error">
                {assignmentsError}
              </p>
            ) : null}

            {!assignmentsLoading && !assignmentsError && assignments.length === 0 ? (
              <p className="configurator-table__feedback">
                No assignments found for this component today.
              </p>
            ) : null}

            {!assignmentsLoading && !assignmentsError && assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div
                    key={`${getAssignmentTimeRange(assignment)}-${index}`}
                    className="recommendation-result__row"
                  >
                    <span className="recommendation-result__label">
                      {getAssignmentTimeRange(assignment)}
                    </span>
                    {flightsLoading ? (
                      <span className="recommendation-result__value">
                        Loading flight info...
                      </span>
                    ) : null}
                    {!flightsLoading && flightsError ? (
                      <span className="recommendation-result__value">
                        {flightsError}
                      </span>
                    ) : null}
                    {!flightsLoading && !flightsError ? (
                      <div className="mt-2 space-y-3">
                        {getAssignmentFlightIdList(assignment).map((flightId) => {
                          const flight = flightsById[flightId]

                          if (!flight) {
                            return (
                              <div key={flightId} className="recommendation-result__value">
                                Flight {flightId} not found.
                              </div>
                            )
                          }

                          return (
                            <div key={flightId} className="space-y-2">
                              {Object.entries(flight).map(([key, value]) => (
                                <div key={`${flightId}-${key}`}>
                                  <span className="recommendation-result__label">
                                    {key}
                                  </span>
                                  <span className="recommendation-result__value">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  )
}
