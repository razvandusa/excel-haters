import RecommendationFlightForm from "./components/RecommendationFlightForm.jsx";
import RecommendationValidationResult from "./components/RecommendationValidationResult.jsx";
import recommendationContent from "./config/recommendationContent.js";
import useRecommendationForm from "./hooks/useRecommendationForm.js";

export default function RecommendationPage() {
  const { flightId, handleSubmit, result, setFlightId } =
    useRecommendationForm();

  return (
    <section className="mt-4">
      <div className="border border-cyan-400/15 bg-cyan-400/5 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          {recommendationContent.kicker}
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {recommendationContent.title}
        </h1>

        <RecommendationFlightForm
          flightId={flightId}
          onChangeFlightId={setFlightId}
          onSubmit={handleSubmit}
        />

        <RecommendationValidationResult result={result} />
      </div>
    </section>
  );
}
