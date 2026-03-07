import ComponentTable from '../../configurator/components/ComponentTable.jsx'
import ComponentTypeColumns from '../../configurator/components/ComponentTypeColumns.jsx'
import useRecommendationComponentLookup from '../hooks/useRecommendationComponentLookup.js'

function buildFlightComponents(flight) {
  if (!flight) {
    return []
  }

  return [
    {
      id: `${flight.flightID}-desk`,
      name: flight.desk,
      terminalID: flight.terminal,
      type: 'desk',
      isActive: true,
    },
    {
      id: `${flight.flightID}-security`,
      name: flight.security,
      terminalID: flight.terminal,
      type: 'security',
      isActive: true,
    },
    {
      id: `${flight.flightID}-gate`,
      name: flight.gate,
      terminalID: flight.terminal,
      type: 'gate',
      isActive: true,
    },
    {
      id: `${flight.flightID}-stand`,
      name: flight.stand,
      terminalID: flight.terminal,
      type: 'stand',
      isActive: true,
    },
  ]
}

export default function RecommendationValidationResult({ result }) {
  const {
    handleComponentLookup,
    lookupTitle,
    matchedComponents,
    selectedComponentId,
  } =
    useRecommendationComponentLookup(result?.flight || null)

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
            onIconClick={handleComponentLookup}
            selectedComponentId={selectedComponentId}
          />
        </div>
      ) : null}

      {lookupTitle ? (
        <div className="mt-10">
          <ComponentTable
            components={matchedComponents}
            title={lookupTitle}
            showTypeColumn={false}
            showStatusColumn={false}
          />
        </div>
      ) : null}
    </section>
  )
}
