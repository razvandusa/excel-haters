import FlightActionModal from './FlightActionModal.jsx'
import flightsContent from '../config/flightsContent.js'
import flightFieldDefinitions from '../config/flightFieldDefinitions.js'

export default function AddFlightModal({
  componentsByTerminalId,
  draftFlight,
  isOpen,
  onChangeField,
  onClose,
  onReset,
  onSubmit,
  selectedTerminalComponents,
  selectedTerminalComponentsError,
  selectedTerminalComponentsLoading,
  terminals,
  terminalsError,
  terminalsLoading,
}) {
  const selectedTerminal = terminals.find(
    (terminal) => terminal.name === draftFlight.terminal,
  )
  const selectedTerminalId = String(selectedTerminal?.id ?? '')
  const cachedTerminalComponents =
    componentsByTerminalId[selectedTerminalId] ?? selectedTerminalComponents

  function getComponentOptions(type) {
    return cachedTerminalComponents
      .filter((component) => component.type === type)
      .map((component) => ({
        label: component.name,
        value: component.name,
      }))
  }

  const fields = flightFieldDefinitions.map((field) => {
    if (field.key === 'terminal') {
      return {
        ...field,
        type: 'select',
        options: terminals.map((terminal) => ({
          label: terminal.name,
          value: terminal.name,
        })),
        placeholder: terminalsLoading
          ? 'Loading terminals...'
          : terminalsError
            ? 'Failed to load terminals'
            : 'Select terminal',
        disabled:
          terminalsLoading || Boolean(terminalsError) || !terminals.length,
        error: terminalsError,
      }
    }

    const componentTypeByField = {
      desk: 'desk',
      security: 'security',
      gate: 'gate',
      stand: 'stand',
    }
    const componentType = componentTypeByField[field.key]

    if (!componentType) {
      return field
    }

    return {
      ...field,
      type: 'autocomplete',
      options: getComponentOptions(componentType),
      placeholder: !selectedTerminalId
        ? 'Select terminal first'
        : selectedTerminalComponentsLoading
          ? 'Loading components...'
          : selectedTerminalComponentsError
            ? 'Failed to load terminal components'
            : `Select ${field.label.replace(' *', '').toLowerCase()}`,
      disabled: !selectedTerminalId || selectedTerminalComponentsLoading,
      error: selectedTerminalComponentsError,
    }
  })

  return (
    <FlightActionModal
      draftValues={draftFlight}
      fields={fields}
      isOpen={isOpen}
      onChangeField={onChangeField}
      onClose={onClose}
      onReset={onReset}
      onSubmit={onSubmit}
      submitLabel={flightsContent.addSubmitLabel}
      title={flightsContent.addModalTitle}
    />
  )
}
