import { useEffect, useState } from "react";
import componentTypeOptions from "../config/componentTypeOptions.js";
import { createComponent, deleteComponent } from "../../api/components.js";

function formatTitle(type) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatStatus(isActive) {
  return isActive ? "Active" : "Inactive";
}

export default function ComponentTypeColumns({
  components,
  terminalId,
  isLoading = false,
  error = "",
  onComponentCreated,
}) {
  const [componentItems, setComponentItems] = useState(components);
  const [createModalType, setCreateModalType] = useState(null);
  const [newName, setNewName] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setComponentItems(components);
  }, [components]);

  async function handleRemoveComponent(componentId) {
    try {
      await deleteComponent(componentId);
      setComponentItems((currentItems) =>
        currentItems.filter((component) => component.id !== componentId),
      );
    } catch (err) {
      alert(err.message);
    }
  }

  function handleOpenCreateModal(type) {
    setCreateModalType(type);
    setNewName("");
    setNewIsActive(true);
  }

  function handleCloseCreateModal() {
    setCreateModalType(null);
    setNewName("");
    setNewIsActive(true);
  }

  async function handleCreate() {
    console.log("=== handleCreate START ===");
    console.log("terminalId:", terminalId);
    console.log("name:", newName);
    console.log("type:", createModalType.toUpperCase());
    console.log("isActive:", newIsActive);

    setCreating(true);
    try {
      const result = await createComponent({
        terminalId,
        name: newName,
        type: createModalType.toUpperCase(),
        isActive: newIsActive,
      });
      console.log("=== createComponent SUCCESS ===", result);
      handleCloseCreateModal();

      if (onComponentCreated) onComponentCreated();
    } catch (err) {
      console.error("=== createComponent FAILED ===", err);
      alert(err.message);
    } finally {
      setCreating(false);
      console.log("=== handleCreate END ===");
    }
  }

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="border border-white/10 bg-slate-950/40">
          <p className="px-5 py-6 text-sm text-slate-400">
            Loading components...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        <div className="border border-white/10 bg-slate-950/40">
          <p className="px-5 py-6 text-sm text-rose-300">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 gap-5 md:grid-cols-4">
        {componentTypeOptions.map((type) => {
          const typedComponents = componentItems.filter(
            (component) => component.type === type,
          );

          return (
            <div key={type} className="border border-white/10 bg-slate-950/40">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <h2 className="text-lg font-semibold text-white">
                  {formatTitle(type)}
                </h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 items-center justify-center border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                    onClick={() => handleOpenCreateModal(type)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                {typedComponents.length > 0 ? (
                  typedComponents.map((component) => (
                    <article
                      key={component.id}
                      className="flex items-start justify-between gap-4 border-b border-white/5 bg-white/[0.02] px-5 py-4 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          ID {component.id}
                        </p>
                        <h3 className="mt-2 text-sm font-medium text-white">
                          {component.name}
                        </h3>
                      </div>
                      <span className="flex items-center gap-2">
                        <span
                          className={
                            component.isActive
                              ? "inline-flex border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-100"
                              : "inline-flex border border-slate-300/15 bg-slate-300/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-300"
                          }
                        >
                          {formatStatus(component.isActive)}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 items-center justify-center border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                          onClick={() => handleRemoveComponent(component.id)}
                        >
                          -
                        </button>
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="px-5 py-6 text-sm text-slate-400">
                    No {type} components.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {createModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <h2 className="text-lg font-semibold text-white">
                Create {formatTitle(createModalType)} Component
              </h2>
              <button
                type="button"
                className="border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors duration-150 hover:bg-white/10"
                onClick={handleCloseCreateModal}
              >
                Close
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Name</span>
                <input
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
                />
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(event) => setNewIsActive(event.target.checked)}
                />
                <span>Is Active</span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
                onClick={handleCloseCreateModal}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
