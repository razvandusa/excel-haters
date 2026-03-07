import { useState } from 'react'

export default function RecommendationPage() {
  const [flightId, setFlightId] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--recommendation">
        <p className="page-kicker page-kicker--recommendation">
          Recommendation
        </p>
        <h1 className="page-title">Recommendation center</h1>

        <form onSubmit={handleSubmit} className="flights-page-actions">
          <input
            type="text"
            value={flightId}
            onChange={(event) => setFlightId(event.target.value)}
            placeholder="Flight ID"
            className="configurator-modal__input"
          />
          <button type="submit" className="configurator-action-link">
            Submit
          </button>
        </form>
      </div>
    </section>
  )
}
