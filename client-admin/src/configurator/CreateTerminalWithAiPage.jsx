import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ComponentTypeColumns from "./components/ComponentTypeColumns.jsx";
import TerminalPhotoUploadPanel from "./components/TerminalPhotoUploadPanel.jsx";
import useImageUploadPreview from "./hooks/useImageUploadPreview.js";
import {
  uploadLayoutImage,
  getLayoutAnalysis,
  commitLayout,
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
        let prefix;
        switch (c.type) {
          case "desk":
            prefix = "D";
            break;
          case "security":
            prefix = "S";
            break;
          case "gate":
            prefix = "G";
            break;
          case "stand":
            prefix = "St";
            break;
          default:
            prefix = "C";
        }
        const uniqueName = `${prefix}-${terminalId}-${Math.floor(Math.random() * 1000)}`;
        const payload = {
          terminalId,
          name: uniqueName,
          type: c.type.toUpperCase(),
          isActive: c.isActive,
        };
        console.log("Creating component:", payload);
        const result = await createComponent(payload);
        console.log("Result:", result);
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
    <section className="page-shell">
      <div className="page-panel page-panel--configurator">
        <div className="configurator-detail-header">
          <div>
            <p className="page-kicker page-kicker--configurator">
              Configurator
            </p>
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="configurator-modal__input mt-1"
              placeholder="Terminal Name"
            />
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
                ? "configurator-status configurator-status--active"
                : "configurator-status configurator-status--inactive"
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
              className="configurator-action-link"
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
              className="configurator-action-link"
              onClick={handleCommit}
              disabled={committing}
            >
              {committing ? "Submitting..." : "Submit Terminal & Components"}
            </button>
          </div>
        )}
      </div>

      {isEditModalOpen ? (
        <div className="configurator-modal-backdrop">
          <div className="configurator-modal">
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
                  setDraftName("AI Terminal");
                  setDraftIsActive(true);
                  setIsEditModalOpen(false);
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
  );
}
