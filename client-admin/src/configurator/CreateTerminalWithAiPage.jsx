import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ComponentTypeColumns from "./components/ComponentTypeColumns.jsx";
import TerminalPhotoUploadPanel from "./components/TerminalPhotoUploadPanel.jsx";
import useImageUploadPreview from "./hooks/useImageUploadPreview.js";
import {
  uploadLayoutImage,
  getLayoutAnalysis,
} from "../api/components.js";
import { createTerminal, fetchTerminals } from "../api/terminals.js";
import { createComponent } from "../api/components.js";

const POLL_INTERVAL = 2000;

export default function CreateTerminalWithAiPage() {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draftName, setDraftName] = useState("AI Terminal");
  const [draftIsActive, setDraftIsActive] = useState(true);
  const { uploadedImageName, uploadedImageUrl, handleImageUpload } =
    useImageUploadPreview();

  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // null | 'uploading' | 'processing' | 'ready' | 'failed'
  const [jobError, setJobError] = useState("");
  const [generatedComponents, setGeneratedComponents] = useState([]);
  const [committing, setCommitting] = useState(false);
  const pollingRef = useRef(null);

  const generatedTerminal = {
    name: draftName,
    type: "arrivals",
    isActive: draftIsActive,
  };

  function normalizeComponentType(type) {
    const lower = type.toLowerCase().trim();
    if (lower.includes("security")) return "security";
    if (lower.includes("desk")) return "desk";
    if (lower.includes("gate")) return "gate";
    if (lower.includes("stand")) return "stand";
    return lower;
  }

  // Wrap the original handleImageUpload to also capture the file
  function handleUpload(event) {
    const [selectedFile] = event.target.files || [];
    if (selectedFile) {
      setFile(selectedFile);
      setJobId(null);
      setJobStatus(null);
      setJobError("");
      setGeneratedComponents([]);
    }
    handleImageUpload(event);
  }

  // Poll for job status
  const pollJob = useCallback(async (id) => {
    try {
      const result = await getLayoutAnalysis(id);
      const status = result.status?.toLowerCase();

      if (status === "completed" || status === "ready") {
        console.log("AI result:", result);

        setJobStatus("ready");
        const components =
          result.detectedComponents || result.components || result.layout || [];
        setGeneratedComponents(
          components.map((c, index) => ({
            id: `ai-${index}`,
            name: c.name,
            type: normalizeComponentType(String(c.type ?? "")),
            originalType: String(c.type ?? "").toUpperCase(),
            isActive: c.isActive !== undefined ? Boolean(c.isActive) : true,
          })),
        );
        return true; // done
      }

      if (status === "failed" || status === "error") {
        setJobStatus("failed");
        setJobError(result.error || result.message || "AI analysis failed.");
        return true; // done
      }

      // still processing
      return false;
    } catch (err) {
      setJobStatus("failed");
      setJobError(err.message);
      return true;
    }
  }, []);

  // Start upload + polling when file is set
  async function handleStartAnalysis() {
    if (!file) return;

    setJobStatus("uploading");
    setJobError("");
    setGeneratedComponents([]);

    try {
      const result = await uploadLayoutImage(file);
      const newJobId = result.jobId;
      setJobId(newJobId);
      setJobStatus("processing");

      // Start polling
      pollingRef.current = setInterval(async () => {
        const done = await pollJob(newJobId);
        if (done && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, POLL_INTERVAL);
    } catch (err) {
      setJobStatus("failed");
      setJobError(err.message);
    }
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  function handleAddComponent(component) {
    setGeneratedComponents((prev) => [...prev, component]);
  }

  function handleRemoveComponent(componentId) {
    setGeneratedComponents((prev) => prev.filter((c) => c.id !== componentId));
  }

  async function handleCommit() {
    setCommitting(true);
    try {
      // 1. Create the terminal
      await createTerminal({
        name: draftName,
        isActive: draftIsActive,
      });

      // 2. Fetch terminals to get the ID of the one we just created
      const terminals = await fetchTerminals();
      const createdTerminal = terminals.find((t) => t.name === draftName);
      if (!createdTerminal) {
        throw new Error("Could not find the created terminal");
      }
      const terminalId = createdTerminal.id;
      console.log("Terminal ID:", terminalId);

      // 3. Create each component
      for (const c of generatedComponents) {
        const payload = {
          terminalId,
          name: c.name,
          type: c.originalType || c.type.toUpperCase(),
          isActive: c.isActive,
        };
        await createComponent(payload);
      }

      navigate("/configurator");
    } catch (err) {
      alert(err.message);
    } finally {
      setCommitting(false);
    }
  }

  const isProcessing = jobStatus === "uploading" || jobStatus === "processing";
  const isReady = jobStatus === "ready" && generatedComponents.length > 0;

  return (
    <section className="mt-4">
      <div className="border border-cyan-400/15 bg-cyan-400/5 p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
              Configurator
            </p>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="mt-1 border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
              placeholder="Terminal Name"
            />
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
              generatedTerminal.isActive
                ? "inline-flex border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-100"
                : "inline-flex border border-slate-300/15 bg-slate-300/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300"
            }
          >
            {generatedTerminal.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <TerminalPhotoUploadPanel
          imageName={uploadedImageName}
          imageUrl={uploadedImageUrl}
          onUpload={handleUpload}
        />

        {/* Analyze button */}
        {file && !jobId && !isProcessing && (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={handleStartAnalysis}
            >
              Analyze with AI
            </button>
          </div>
        )}

        {/* Processing status */}
        {isProcessing && (
          <div className="mt-4">
            <p className="text-sm text-cyan-200">
              {jobStatus === "uploading"
                ? "Uploading image..."
                : "AI is analyzing the layout..."}
            </p>
          </div>
        )}

        {/* Error */}
        {jobStatus === "failed" && (
          <div className="mt-4">
            <p className="text-sm text-rose-300">{jobError}</p>
          </div>
        )}

        <div className="mt-8">
          <ComponentTypeColumns components={generatedComponents} />
        </div>

        {/* Submit button after AI generates components */}
        {isReady && (
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              onClick={handleCommit}
              disabled={committing}
            >
              {committing ? "Submitting..." : "Submit Terminal & Components"}
            </button>
          </div>
        )}
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
                  setDraftName("AI Terminal");
                  setDraftIsActive(true);
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
