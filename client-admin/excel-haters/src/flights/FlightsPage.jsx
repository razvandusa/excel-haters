import { useState } from 'react'

const flightFieldDefinitions = [
  { key: 'flightID', label: 'Flight ID', type: 'text' },
  { key: 'terminal', label: 'Terminal', type: 'text' },
  { key: 'desk', label: 'Desk', type: 'text' },
  { key: 'security', label: 'Security', type: 'text' },
  { key: 'gate', label: 'Gate', type: 'text' },
  { key: 'stand', label: 'Stand', type: 'text' },
  { key: 'departureTime', label: 'Departure Time', type: 'datetime-local' },
  { key: 'arrivalTime', label: 'Arrival Time', type: 'datetime-local' },
]

const emptyFlightForm = {
  flightID: '',
  terminal: '',
  desk: '',
  security: '',
  gate: '',
  stand: '',
  departureTime: '',
  arrivalTime: '',
}

export default function FlightsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draftFlight, setDraftFlight] = useState(emptyFlightForm)

  function handleFieldChange(field, value) {
    setDraftFlight((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  function resetForm() {
    setDraftFlight(emptyFlightForm)
  }

  function handleAddFlight(event) {
    event.preventDefault()

    console.log(
      'Added flight JSON:',
      JSON.stringify(draftFlight, null, 2),
    )
    resetForm()
    setIsFormOpen(false)
  }

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--flights">
        <p className="page-kicker page-kicker--flights">Flights</p>
        <h1 className="page-title">Flight operations overview</h1>

        <div className="flights-page-actions">
          <button type="button" className="configurator-action-link">
            Add Flight with Excel
          </button>
          <button
            type="button"
            className="configurator-action-link"
            onClick={() => setIsFormOpen(true)}
          >
            Add Flight with Form
          </button>
        </div>

        <section className="flights-spec-card">
          <div className="flights-spec-card__fields">
            {flightFieldDefinitions.map((field) => (
              <span key={field.key} className="configurator-detail-badge">
                {field.key}
              </span>
            ))}
          </div>
        </section>
      </div>

      {isFormOpen ? (
        <div
          className="configurator-modal-backdrop"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="configurator-modal flights-form-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="configurator-modal__header">
              <h2 className="configurator-modal__title">Add Flight</h2>
              <button
                type="button"
                className="configurator-modal__close"
                onClick={() => setIsFormOpen(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddFlight}>
              <div className="configurator-modal__body flights-form-grid">
                {flightFieldDefinitions.map((field) => (
                  <label key={field.key} className="configurator-modal__field">
                    <span className="configurator-modal__label">
                      {field.label}
                    </span>
                    <input
                      type={field.type}
                      value={draftFlight[field.key]}
                      onChange={(event) =>
                        handleFieldChange(field.key, event.target.value)
                      }
                      className="configurator-modal__input"
                    />
                  </label>
                ))}
              </div>

              <div className="configurator-modal__actions">
                <button
                  type="button"
                  className="configurator-pagination-button"
                  onClick={() => {
                    resetForm()
                    setIsFormOpen(false)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="configurator-action-link">
                  Add Flight
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
