export default function TerminalPhotoUploadPanel({
  inputId = 'terminal-photo',
  imageName = '',
  imageUrl = '',
  onUpload,
}) {
  return (
    <div className="configurator-image-panel">
      <div className="configurator-image-panel__header">
        <div>
          <p className="configurator-image-panel__kicker">AI Input</p>
          <h2 className="configurator-image-panel__title">Terminal photo</h2>
        </div>

        <label className="configurator-action-link" htmlFor={inputId}>
          Upload Photo
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="configurator-image-panel__input"
          onChange={onUpload}
        />
      </div>

      <div className="configurator-image-panel__body">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={imageName || 'Uploaded terminal preview'}
              className="configurator-image-panel__preview"
            />
            <p className="configurator-image-panel__caption">{imageName}</p>
          </>
        ) : (
          <p className="configurator-image-panel__empty">
            Upload an image to preview it on this page.
          </p>
        )}
      </div>
    </div>
  )
}
