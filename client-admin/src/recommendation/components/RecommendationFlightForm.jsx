import recommendationContent from '../config/recommendationContent.js'

export default function RecommendationFlightForm({
  fieldLabel,
  flightId,
  onChangeFlightId,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="mt-4 flex flex-wrap gap-2">
      <input
        type="text"
        value={flightId}
        onChange={(event) => onChangeFlightId(event.target.value)}
        placeholder={fieldLabel || recommendationContent.flightIdPlaceholder}
        aria-label={fieldLabel || recommendationContent.flightIdPlaceholder}
        className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
      />
      <button
        type="submit"
        className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        {recommendationContent.submitLabel}
      </button>
    </form>
  )
}
