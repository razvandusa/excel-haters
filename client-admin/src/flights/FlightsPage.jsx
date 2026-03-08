import { useRef } from 'react'
import AddFlightModal from './components/AddFlightModal.jsx'
import FlightActionModal from './components/FlightActionModal.jsx'
import cancelFlightFieldDefinitions from './config/cancelFlightFieldDefinitions.js'
import flightsContent from './config/flightsContent.js'
import updateFlightTimeFieldDefinitions from './config/updateFlightTimeFieldDefinitions.js'
import useFlightForm from './hooks/useFlightForm.js'

export default function FlightsPage() {
  const excelInputRef = useRef(null)
  const {
    closeForm,
    draftCancelFlight,
    draftFlight,
    draftFlightTimeUpdate,
    handleCancelFlightChange,
    handleExcelUpload,
    handleFieldChange,
    handleFlightTimeChange,
    isAddFormOpen,
    isCancelFlightFormOpen,
    isUpdateTimeFormOpen,
    openAddForm,
    openCancelFlightForm,
    openUpdateTimeForm,
    resetCancelFlightForm,
    resetForm,
    resetFlightTimeForm,
    submitCancelFlight,
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
          <button
            type="button"
            className="configurator-action-link"
            onClick={openCancelFlightForm}
          >
            {flightsContent.cancelFlightLabel}
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
      <FlightActionModal
        draftValues={draftCancelFlight}
        fields={cancelFlightFieldDefinitions}
        isOpen={isCancelFlightFormOpen}
        onChangeField={handleCancelFlightChange}
        onClose={closeForm}
        onReset={resetCancelFlightForm}
        onSubmit={submitCancelFlight}
        submitLabel={flightsContent.cancelSubmitLabel}
        title={flightsContent.cancelModalTitle}
      />
    </section>
  )
}
