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
        <section className="overflow-hidden border border-white/10 bg-slate-950/40 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{terminalsTitle}</h2>
            </div>
          </div>

          <div className="p-5">
            {isLoading ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">Loading terminals...</p>
            ) : null}

            {!isLoading && error ? (
              <p className="px-5 py-6 text-center text-sm text-rose-300">
                {error}
              </p>
            ) : null}

            {!isLoading && !error && terminals.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">No terminals found.</p>
            ) : null}

            {!isLoading && !error && terminals.length > 0 ? (
              <div className="space-y-3">
                <select
                  value={selectedTerminalId}
                  onChange={(event) => setSelectedTerminalId(event.target.value)}
                  className="w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                >
                  {terminals.map((terminal) => (
                    <option key={terminal.id} value={String(terminal.id)}>
                      {formatTerminalLabel(terminal)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
        <section className="overflow-hidden border border-white/10 bg-slate-950/40 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{componentsTitle}</h2>
            </div>
            <button
              type="button"
              className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
              onClick={handleBackToTerminals}
            >
              Back
            </button>
          </div>

          <div className="p-5">
            {componentsLoading ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">Loading components...</p>
            ) : null}

            {!componentsLoading && componentsError ? (
              <p className="px-5 py-6 text-center text-sm text-rose-300">
                {componentsError}
              </p>
            ) : null}

            {!componentsLoading && !componentsError && components.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">
                No components found for this terminal.
              </p>
            ) : null}

            {!componentsLoading && !componentsError && hasFetchedComponents ? (
              components.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedComponentId}
                    onChange={(event) => setSelectedComponentId(event.target.value)}
                    className="w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
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
                    className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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
        <section className="overflow-hidden border border-white/10 bg-slate-950/40 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{assignmentsTitle}</h2>
            </div>
            <button
              type="button"
              className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
              onClick={handleBackToComponents}
            >
              Back
            </button>
          </div>

          <div className="p-5">
            {assignmentsLoading ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">Loading assignments...</p>
            ) : null}

            {!assignmentsLoading && assignmentsError ? (
              <p className="px-5 py-6 text-center text-sm text-rose-300">
                {assignmentsError}
              </p>
            ) : null}

            {!assignmentsLoading && !assignmentsError && assignments.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">
                No assignments found for this component today.
              </p>
            ) : null}

            {!assignmentsLoading && !assignmentsError && assignments.length > 0 ? (
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div
                    key={`${getAssignmentTimeRange(assignment)}-${index}`}
                    className="border border-white/10 bg-white/[0.02] px-4 py-3"
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                      {getAssignmentTimeRange(assignment)}
                    </span>
                    {flightsLoading ? (
                      <span className="mt-2 block text-sm text-slate-100">
                        Loading flight info...
                      </span>
                    ) : null}
                    {!flightsLoading && flightsError ? (
                      <span className="mt-2 block text-sm text-slate-100">
                        {flightsError}
                      </span>
                    ) : null}
                    {!flightsLoading && !flightsError ? (
                      <div className="mt-2 space-y-3">
                        {getAssignmentFlightIdList(assignment).map((flightId) => {
                          const flight = flightsById[flightId]

                          if (!flight) {
                            return (
                              <div key={flightId} className="mt-2 block text-sm text-slate-100">
                                Flight {flightId} not found.
                              </div>
                            )
                          }

                          return (
                            <div key={flightId} className="space-y-2">
                              {Object.entries(flight).map(([key, value]) => (
                                <div key={`${flightId}-${key}`}>
                                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                    {key}
                                  </span>
                                  <span className="mt-2 block text-sm text-slate-100">
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
