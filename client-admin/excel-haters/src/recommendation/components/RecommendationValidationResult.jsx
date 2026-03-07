import ComponentTypeColumns from '../../configurator/components/ComponentTypeColumns.jsx'

function buildFlightComponents(flight) {
  if (!flight) {
    return []
  }

  return [
    {
      id: `${flight.flightID}-desk`,
      name: flight.desk,
      type: 'desk',
      isActive: true,
    },
    {
      id: `${flight.flightID}-security`,
      name: flight.security,
      type: 'security',
      isActive: true,
    },
    {
      id: `${flight.flightID}-gate`,
      name: flight.gate,
      type: 'gate',
      isActive: true,
    },
    {
      id: `${flight.flightID}-stand`,
      name: flight.stand,
      type: 'stand',
      isActive: true,
    },
  ]
}

export default function RecommendationValidationResult({ result }) {
  if (!result) {
    return null
  }

  return (
    <section className="recommendation-result">
      <h2 className="configurator-modal__title">{result.title}</h2>
      <p
        className={
          result.isValid
            ? 'recommendation-result__copy recommendation-result__copy--valid'
            : 'recommendation-result__copy recommendation-result__copy--invalid'
        }
      >
        {result.message}
      </p>
      {result.flight ? (
        <div className="mt-6">
          <ComponentTypeColumns
            components={buildFlightComponents(result.flight)}
            showControls={false}
            showStatus={false}
          />
        </div>
      ) : null}
    </section>
  )
}
