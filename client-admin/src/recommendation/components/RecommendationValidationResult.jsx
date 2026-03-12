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
    <section className="mt-6 max-w-3xl border border-white/10 bg-slate-950/40 p-5">
      <h2 className="text-lg font-semibold text-white">{result.title}</h2>
      {!result.isValid ? (
        <p className="mt-3 text-sm text-rose-200">
          {result.message}
        </p>
      ) : null}
      {result.flight ? (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(result.flight).map(([key, value]) => (
              <div key={key} className="border border-white/10 bg-white/[0.02] px-4 py-3">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{key}</span>
                <span className="mt-2 block text-sm text-slate-100">
                  {formatDisplayValue(value)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
