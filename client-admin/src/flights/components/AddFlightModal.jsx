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
}) {
  return (
    <FlightActionModal
      draftValues={draftFlight}
      fields={flightFieldDefinitions}
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
