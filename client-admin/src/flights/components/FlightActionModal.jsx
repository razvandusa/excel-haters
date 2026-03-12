export default function FlightActionModal({
  draftValues,
  fields,
  isOpen,
  onChangeField,
  onClose,
  onReset,
  onSubmit,
  submitLabel,
  title,
}) {
  if (!isOpen) {
    return null
  }

  function getDatalistId(fieldKey) {
    return `flight-action-modal-${fieldKey}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field.key} className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{field.label}</span>
                {field.type === 'select' ? (
                  <select
                    value={draftValues[field.key]}
                    onChange={(event) =>
                      onChangeField(field.key, event.target.value)
                    }
                    className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                    disabled={field.disabled}
                  >
                    <option value="">{field.placeholder || 'Select an option'}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'autocomplete' ? (
                  <>
                    <input
                      type="text"
                      list={getDatalistId(field.key)}
                      value={draftValues[field.key]}
                      onChange={(event) =>
                        onChangeField(field.key, event.target.value)
                      }
                      className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                      disabled={field.disabled}
                      placeholder={field.placeholder}
                    />
                    <datalist id={getDatalistId(field.key)}>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </datalist>
                  </>
                ) : (
                  <input
                    type={field.type}
                    value={draftValues[field.key]}
                    onChange={(event) =>
                      onChangeField(field.key, event.target.value)
                    }
                    className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                  />
                )}
                {field.error ? (
                  <span className="mt-2 block text-sm text-rose-300">
                    {field.error}
                  </span>
                ) : null}
              </label>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
              onClick={() => {
                onReset()
                onClose()
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
