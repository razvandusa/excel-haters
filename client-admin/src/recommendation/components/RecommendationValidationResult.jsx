function formatDisplayValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

export default function RecommendationValidationResult({ result }) {
  if (!result) {
    return null
  }

  return (
    <section className="flights-form-modal recommendation-result">
      <h2 className="configurator-modal__title">{result.title}</h2>
      {!result.isValid ? (
        <p className="recommendation-result__copy recommendation-result__copy--invalid">
          {result.message}
        </p>
      ) : null}
      {result.flight ? (
        <>
          <div className="recommendation-result__grid">
            {Object.entries(result.flight).map(([key, value]) => (
              <div key={key} className="recommendation-result__row">
                <span className="recommendation-result__label">{key}</span>
                <span className="recommendation-result__value">
                  {formatDisplayValue(value)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="configurator-modal__title">Flight Components</h3>
            {result.components?.length ? (
              <div className="recommendation-result__grid">
                {result.components.map((component, index) => (
                  <div key={component.id ?? component.elementId ?? index} className="recommendation-result__row">
                    {Object.entries(component).map(([key, value]) => (
                      <div key={key}>
                        <span className="recommendation-result__label">{key}</span>
                        <span className="recommendation-result__value">
                          {formatDisplayValue(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="recommendation-result__copy">No components found for this flight.</p>
            )}
          </div>
        </>
      ) : null}
    </section>
  )
}
