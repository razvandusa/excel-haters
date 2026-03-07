export default function RecommendationValidationResult({ result }) {
  if (!result) {
    return null
  }

  return (
    <section className="flights-form-modal recommendation-result">
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
        <div className="recommendation-result__grid">
          {Object.entries(result.flight).map(([key, value]) => (
            <div key={key} className="recommendation-result__row">
              <span className="recommendation-result__label">{key}</span>
              <span className="recommendation-result__value">{value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
