import recommendationContent from '../config/recommendationContent.js'

export default function RecommendationFlightForm({
  flightId,
  onChangeFlightId,
  pastFlightIds,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="flights-page-actions">
      <input
        type="text"
        value={flightId}
        onChange={(event) => onChangeFlightId(event.target.value)}
        placeholder={recommendationContent.flightIdPlaceholder}
        className="configurator-modal__input"
        list="recommendation-flight-id-history"
      />
      <datalist id="recommendation-flight-id-history">
        {pastFlightIds.map((id) => (
          <option key={id} value={id} />
        ))}
      </datalist>
      <button type="submit" className="configurator-action-link">
        {recommendationContent.submitLabel}
      </button>
    </form>
  )
}
