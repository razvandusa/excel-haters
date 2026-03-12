export default function TerminalPhotoUploadPanel({
  inputId = 'terminal-photo',
  imageName = '',
  imageUrl = '',
  onUpload,
}) {
  return (
    <div className="mt-8 border border-white/10 bg-slate-950/40 p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">AI Input</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Terminal photo</h2>
        </div>

        <label
          className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          htmlFor={inputId}
        >
          Upload Photo
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={onUpload}
        />
      </div>

      <div className="mt-5">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={imageName || 'Uploaded terminal preview'}
              className="max-h-[420px] w-full border border-white/10 object-contain"
            />
            <p className="mt-3 text-sm text-slate-300">{imageName}</p>
          </>
        ) : (
          <p className="border border-dashed border-white/10 px-4 py-12 text-center text-sm text-slate-400">
            Upload an image to preview it on this page.
          </p>
        )}
      </div>
    </div>
  )
}
