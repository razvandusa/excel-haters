import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TerminalTable from "./components/TerminalTable.jsx";
import configuratorContent from "./config/configuratorContent.js";
import { fetchTerminals, createTerminal } from "../api/terminals.js";

export default function ConfiguratorPage() {
  const [terminals, setTerminals] = useState([]);
  const [terminalsLoading, setTerminalsLoading] = useState(true);
  const [terminalsError, setTerminalsError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTerminalName, setNewTerminalName] = useState("");
  const [newTerminalIsActive, setNewTerminalIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setTerminalsLoading(true);
    setTerminalsError("");

    fetchTerminals(controller.signal)
      .then(setTerminals)
      .catch((error) => {
        if (error.name !== "AbortError") {
          setTerminals([]);
          setTerminalsError(error.message || "Failed to load terminals.");
        }
      })
      .finally(() => setTerminalsLoading(false));

    return () => controller.abort();
  }, []);

  return (
    <section className="mt-4">
      <div className="border p-6 border-cyan-400/15 bg-cyan-400/5">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          {configuratorContent.kicker}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {configuratorContent.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            onClick={() => setShowCreateModal(true)}
          >
            Create Terminal
          </button>
          <Link
            to="/configurator/create-terminal-with-ai"
            className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Create Terminal with AI
          </Link>
        </div>

        <div className="mt-8">
          <TerminalTable
            terminals={terminals}
            setTerminals={setTerminals}
            title={configuratorContent.terminalsTableTitle}
            isLoading={terminalsLoading}
            error={terminalsError}
          />
        </div>
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white mb-4">
              Create Terminal
            </h2>
            <input
              type="text"
              value={newTerminalName}
              onChange={(e) => setNewTerminalName(e.target.value)}
              placeholder="Terminal Name"
              className="mb-4 w-full px-3 py-2"
            />
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={newTerminalIsActive}
                onChange={(e) => setNewTerminalIsActive(e.target.checked)}
              />
              <span className="ml-2 text-slate-200">Active</span>
            </label>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setCreating(true);
                  try {
                    await createTerminal({
                      name: newTerminalName,
                      isActive: newTerminalIsActive,
                    });
                    // Refresh terminals
                    const updated = await fetchTerminals();
                    setTerminals(updated);
                    setShowCreateModal(false);
                    setNewTerminalName("");
                    setNewTerminalIsActive(true);
                  } catch (err) {
                    alert(err.message);
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating || !newTerminalName.trim()}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
