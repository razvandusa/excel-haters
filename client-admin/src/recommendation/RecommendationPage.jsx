import RecommendationFlightForm from './components/RecommendationFlightForm.jsx'
import RecommendationValidationResult from './components/RecommendationValidationResult.jsx'
import recommendationContent from './config/recommendationContent.js'
import useRecommendationForm from './hooks/useRecommendationForm.js'

export default function RecommendationPage({ role = 'admin' }) {
  const fieldLabel = role === 'user' ? 'Flight Name' : 'Flight ID'
  const { flightId, handleSubmit, result, setFlightId } =
    useRecommendationForm({ fieldLabel })

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--recommendation">
        <p className="page-kicker page-kicker--recommendation">
          {recommendationContent.kicker}
        </p>
        <h1 className="page-title">{recommendationContent.title}</h1>

        <RecommendationFlightForm
          fieldLabel={fieldLabel}
          flightId={flightId}
          onChangeFlightId={setFlightId}
          onSubmit={handleSubmit}
        />

        <RecommendationValidationResult result={result} />
      </div>
    </section>
  )
}
