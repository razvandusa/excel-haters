import { useRef } from "react";
import AddFlightModal from "./components/AddFlightModal.jsx";
import FlightActionModal from "./components/FlightActionModal.jsx";
import flightsContent from "./config/flightsContent.js";
import updateFlightTimeFieldDefinitions from "./config/updateFlightTimeFieldDefinitions.js";
import useFlightForm from "./hooks/useFlightForm.js";

export default function FlightsPage() {
  const excelInputRef = useRef(null);
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
  } = useFlightForm();

  return (
    <section className="mt-4">
      <div className="border border-cyan-400/15 bg-cyan-400/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          {flightsContent.kicker}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{flightsContent.title}</h1>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            onClick={() => excelInputRef.current?.click()}
          >
            {flightsContent.addExcelLabel}
          </button>
          <button
            type="button"
            className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            onClick={openAddForm}
          >
            {flightsContent.addFormLabel}
          </button>
          <button
            type="button"
            className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            onClick={openUpdateTimeForm}
          >
            {flightsContent.updateTimeLabel}
          </button>
        </div>
        <input
          ref={excelInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="sr-only"
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
  );
}
