import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TerminalTable from "./components/TerminalTable.jsx";
import configuratorContent from "./config/configuratorContent.js";
import { fetchTerminals } from "../api/terminals.js";

export default function ConfiguratorPage() {
  const [terminals, setTerminals] = useState([]);
  const [terminalsLoading, setTerminalsLoading] = useState(true);
  const [terminalsError, setTerminalsError] = useState("");

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
    </section>
  );
}
