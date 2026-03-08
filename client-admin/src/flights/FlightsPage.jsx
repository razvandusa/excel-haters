import { useRef } from 'react'
import AddFlightModal from './components/AddFlightModal.jsx'
import FlightActionModal from './components/FlightActionModal.jsx'
import flightsContent from './config/flightsContent.js'
import updateFlightTimeFieldDefinitions from './config/updateFlightTimeFieldDefinitions.js'
import useFlightForm from './hooks/useFlightForm.js'

export default function FlightsPage() {
  const excelInputRef = useRef(null)
  const {
    closeForm,
    componentsByTerminalId,
    draftFlight,
    draftFlightTimeUpdate,
    handleExcelUpload,
    handleFieldChange,
    handleFlightTimeChange,
    isAddFormOpen,
    isUpdateTimeFormOpen,
    openAddForm,
    openUpdateTimeForm,
    resetForm,
    resetFlightTimeForm,
    selectedTerminalComponents,
    selectedTerminalComponentsError,
    selectedTerminalComponentsLoading,
    submitFlight,
    submitFlightTimeUpdate,
    terminals,
    terminalsError,
    terminalsLoading,
  } = useFlightForm()

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--flights">
        <p className="page-kicker page-kicker--flights">{flightsContent.kicker}</p>
        <h1 className="page-title">{flightsContent.title}</h1>

        <div className="flights-page-actions">
          <button
            type="button"
            className="configurator-action-link"
            onClick={() => excelInputRef.current?.click()}
          >
            {flightsContent.addExcelLabel}
          </button>
          <button
            type="button"
            className="configurator-action-link"
            onClick={openAddForm}
          >
            {flightsContent.addFormLabel}
          </button>
          <button
            type="button"
            className="configurator-action-link"
            onClick={openUpdateTimeForm}
          >
            {flightsContent.updateTimeLabel}
          </button>
        </div>
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="configurator-image-panel__input"
          onChange={handleExcelUpload}
        />
      </div>

      <AddFlightModal
        draftFlight={draftFlight}
        isOpen={isAddFormOpen}
        onChangeField={handleFieldChange}
        onClose={closeForm}
        onReset={resetForm}
        onSubmit={submitFlight}
        componentsByTerminalId={componentsByTerminalId}
        selectedTerminalComponents={selectedTerminalComponents}
        selectedTerminalComponentsError={selectedTerminalComponentsError}
        selectedTerminalComponentsLoading={selectedTerminalComponentsLoading}
        terminals={terminals}
        terminalsError={terminalsError}
        terminalsLoading={terminalsLoading}
      />
      <FlightActionModal
        draftValues={draftFlightTimeUpdate}
        fields={updateFlightTimeFieldDefinitions}
        isOpen={isUpdateTimeFormOpen}
        onChangeField={handleFlightTimeChange}
        onClose={closeForm}
        onReset={resetFlightTimeForm}
        onSubmit={submitFlightTimeUpdate}
        submitLabel={flightsContent.updateTimeSubmitLabel}
        title={flightsContent.updateTimeModalTitle}
      />
    </section>
  )
}
