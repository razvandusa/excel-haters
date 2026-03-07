import { useState } from 'react'
import { Link } from 'react-router-dom'
import ComponentTypeColumns from './components/ComponentTypeColumns.jsx'
import TerminalPhotoUploadPanel from './components/TerminalPhotoUploadPanel.jsx'
import useImageUploadPreview from './hooks/useImageUploadPreview.js'

export default function CreateTerminalWithAiPage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [draftName, setDraftName] = useState('AI Terminal')
  const [draftIsActive, setDraftIsActive] = useState(true)
  const { uploadedImageName, uploadedImageUrl, handleImageUpload } =
    useImageUploadPreview()

  // Future AI terminal generation will use a separate API call on this page.
  // Do not reuse the terminal detail API hooks here.
  const generatedTerminal = {
    name: draftName,
    type: 'arrivals',
    isActive: draftIsActive,
  }

  return (
    <section className="page-shell">
      <div className="page-panel page-panel--configurator">
        <div className="configurator-detail-header">
          <div>
            <p className="page-kicker page-kicker--configurator">Configurator</p>
            <h1 className="page-title">{generatedTerminal.name}</h1>
          </div>

          <div className="configurator-detail-actions">
            <button
              type="button"
              className="configurator-action-link"
              onClick={() => setIsEditModalOpen(true)}
            >
              Update
            </button>
            <Link to="/configurator" className="configurator-action-link">
              Back
            </Link>
          </div>
        </div>

        <div className="configurator-detail-meta">
          <span
            className={
              generatedTerminal.isActive
                ? 'configurator-status configurator-status--active'
                : 'configurator-status configurator-status--inactive'
            }
          >
            {generatedTerminal.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <TerminalPhotoUploadPanel
          imageName={uploadedImageName}
          imageUrl={uploadedImageUrl}
          onUpload={handleImageUpload}
        />

        <div className="mt-8">
          <ComponentTypeColumns components={[]} />
        </div>
      </div>

      {isEditModalOpen ? (
        <div
          className="configurator-modal-backdrop"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="configurator-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="configurator-modal__header">
              <h2 className="configurator-modal__title">Update Terminal</h2>
              <button
                type="button"
                className="configurator-modal__close"
                onClick={() => setIsEditModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="configurator-modal__body">
              <label className="configurator-modal__field">
                <span className="configurator-modal__label">Name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="configurator-modal__input"
                />
              </label>

              <label className="configurator-modal__checkbox">
                <input
                  type="checkbox"
                  checked={draftIsActive}
                  onChange={(event) => setDraftIsActive(event.target.checked)}
                />
                <span>Is Active</span>
              </label>
            </div>

            <div className="configurator-modal__actions">
              <button
                type="button"
                className="configurator-pagination-button"
                onClick={() => {
                  setDraftName('AI Terminal')
                  setDraftIsActive(true)
                  setIsEditModalOpen(false)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="configurator-action-link"
                onClick={() => setIsEditModalOpen(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
