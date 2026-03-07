import RecommendationFlightForm from './components/RecommendationFlightForm.jsx'
import RecommendationValidationResult from './components/RecommendationValidationResult.jsx'
import recommendationContent from './config/recommendationContent.js'
import useRecommendationForm from './hooks/useRecommendationForm.js'

export default function RecommendationPage() {
  const { flightId, handleSubmit, pastFlightIds, result, setFlightId } =
    useRecommendationForm()

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--recommendation">
        <p className="page-kicker page-kicker--recommendation">
          {recommendationContent.kicker}
        </p>
        <h1 className="page-title">{recommendationContent.title}</h1>

        <RecommendationFlightForm
          flightId={flightId}
          onChangeFlightId={setFlightId}
          pastFlightIds={pastFlightIds}
          onSubmit={handleSubmit}
        />

        <RecommendationValidationResult result={result} />
      </div>
    </section>
  )
}
