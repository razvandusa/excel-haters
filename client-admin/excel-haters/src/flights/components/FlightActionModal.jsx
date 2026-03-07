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

  return (
    <div className="configurator-modal-backdrop">
      <div className="configurator-modal flights-form-modal">
        <div className="configurator-modal__header">
          <h2 className="configurator-modal__title">{title}</h2>
          <button
            type="button"
            className="configurator-modal__close"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="configurator-modal__body flights-form-grid">
            {fields.map((field) => (
              <label key={field.key} className="configurator-modal__field">
                <span className="configurator-modal__label">{field.label}</span>
                <input
                  type={field.type}
                  value={draftValues[field.key]}
                  onChange={(event) =>
                    onChangeField(field.key, event.target.value)
                  }
                  className="configurator-modal__input"
                />
              </label>
            ))}
          </div>

          <div className="configurator-modal__actions">
            <button
              type="button"
              className="configurator-pagination-button"
              onClick={() => {
                onReset()
                onClose()
              }}
            >
              Cancel
            </button>
            <button type="submit" className="configurator-action-link">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
