const flightFields = [
  'flightID',
  'terminal',
  'desk',
  'security',
  'gate',
  'stand',
  'departureTime',
  'arrivalTime',
]

export default function FlightsPage() {
  return (
    <section className="page-shell">
      <div className="page-panel page-panel--flights">
        <p className="page-kicker page-kicker--flights">Flights</p>
        <h1 className="page-title">Flight operations overview</h1>

        <div className="flights-page-actions">
          <button type="button" className="configurator-action-link">
            Add Flight with Excel
          </button>
          <button type="button" className="configurator-action-link">
            Add Flight with Form
          </button>
        </div>

        <section className="flights-spec-card">
          <div className="flights-spec-card__fields">
            {flightFields.map((field) => (
              <span key={field} className="configurator-detail-badge">
                {field}
              </span>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
