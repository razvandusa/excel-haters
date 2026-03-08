import recommendationContent from '../config/recommendationContent.js'

export default function RecommendationFlightForm({
  fieldLabel,
  flightId,
  onChangeFlightId,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="flights-page-actions">
      <input
        type="text"
        value={flightId}
        onChange={(event) => onChangeFlightId(event.target.value)}
        placeholder={fieldLabel || recommendationContent.flightIdPlaceholder}
        aria-label={fieldLabel || recommendationContent.flightIdPlaceholder}
        className="configurator-modal__input"
      />
      <button type="submit" className="configurator-action-link">
        {recommendationContent.submitLabel}
      </button>
    </form>
  )
}
