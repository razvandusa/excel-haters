import FlightActionModal from './FlightActionModal.jsx'
import flightsContent from '../config/flightsContent.js'
import flightFieldDefinitions from '../config/flightFieldDefinitions.js'

export default function AddFlightModal({
  draftFlight,
  isOpen,
  onChangeField,
  onClose,
  onReset,
  onSubmit,
  terminals,
  terminalsError,
  terminalsLoading,
}) {
  const fields = flightFieldDefinitions.map((field) => {
    if (field.key !== 'terminal') {
      return field
    }

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
      disabled: terminalsLoading || Boolean(terminalsError) || !terminals.length,
      error: terminalsError,
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
