import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ComponentTypeColumns from "./components/ComponentTypeColumns.jsx";
import useTerminalComponents from "./hooks/useTerminalComponents.js";

export default function TerminalComponentsPage() {
  const { terminalName = "" } = useParams();
  const { terminal, components, isLoading, error, refresh } =
    useTerminalComponents(terminalName);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftIsActive, setDraftIsActive] = useState(false);

  useEffect(() => {
    setDraftName(terminal?.name || terminalName);
    setDraftIsActive(Boolean(terminal?.isActive));
  }, [terminal, terminalName]);

  return (
    <section className="mt-4">
      <div className="border border-cyan-400/15 bg-cyan-400/5 p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
              Configurator
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {terminal ? terminal.name : terminalName}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={() => setIsEditModalOpen(true)}
            >
              Update
            </button>
            <Link
              to="/configurator"
              className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Back
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <span
            className={
              terminal?.isActive
                ? "inline-flex border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-100"
                : "inline-flex border border-slate-300/15 bg-slate-300/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300"
            }
          >
            {terminal ? (terminal.isActive ? "Active" : "Inactive") : "Unknown"}
          </span>
        </div>

        <div className="mt-8">
          <ComponentTypeColumns
            components={components}
            terminalId={terminal?.id}
            isLoading={isLoading}
            error={error}
            onComponentCreated={refresh}
          />
        </div>
      </div>

      {isEditModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">Update Terminal</h2>
              <button
                type="button"
                className="border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors duration-150 hover:bg-white/10"
                onClick={() => setIsEditModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Name</span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                />
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={draftIsActive}
                  onChange={(event) => setDraftIsActive(event.target.checked)}
                />
                <span>Is Active</span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
                onClick={() => {
                  setDraftName(terminal?.name || terminalName);
                  setDraftIsActive(Boolean(terminal?.isActive));
                  setIsEditModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                onClick={() => setIsEditModalOpen(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
