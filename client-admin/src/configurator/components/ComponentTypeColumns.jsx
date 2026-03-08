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
    setCreating(true);
    try {
      await createComponent({
        terminalId,
        name: newName,
        type: createModalType.toUpperCase(),
        isActive: newIsActive,
      });
      handleCloseCreateModal();
      if (onComponentCreated) onComponentCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (isLoading) {
    return (
      <section className="configurator-type-rows">
        <div className="configurator-type-column">
          <p className="configurator-type-column__feedback">
            Loading components...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="configurator-type-rows">
        <div className="configurator-type-column">
          <p className="configurator-type-column__feedback configurator-type-column__feedback--error">
            {error}
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="configurator-type-rows">
        {componentTypeOptions.map((type) => {
          const typedComponents = componentItems.filter(
            (component) => component.type === type,
          );

          return (
            <div key={type} className="configurator-type-column">
              <div className="configurator-type-column__header">
                <h2 className="configurator-type-column__title">
                  {formatTitle(type)}
                </h2>
                <div className="configurator-type-column__actions">
                  <button
                    type="button"
                    className="configurator-type-column__add-button"
                    onClick={() => handleOpenCreateModal(type)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="configurator-type-column__list">
                {typedComponents.length > 0 ? (
                  typedComponents.map((component) => (
                    <article
                      key={component.id}
                      className="configurator-type-column__item"
                    >
                      <div className="configurator-type-column__item-copy">
                        <p className="configurator-type-column__item-id">
                          ID {component.id}
                        </p>
                        <h3 className="configurator-type-column__item-name">
                          {component.name}
                        </h3>
                      </div>
                      <span className="configurator-type-column__item-actions">
                        <span
                          className={
                            component.isActive
                              ? "configurator-status configurator-status--active"
                              : "configurator-status configurator-status--inactive"
                          }
                        >
                          {formatStatus(component.isActive)}
                        </span>
                        <button
                          type="button"
                          className="configurator-type-column__add-button"
                          onClick={() => handleRemoveComponent(component.id)}
                        >
                          -
                        </button>
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="configurator-type-column__feedback">
                    No {type} components.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {createModalType && (
        <div className="configurator-modal-backdrop">
          <div className="configurator-modal">
            <div className="configurator-modal__header">
              <h2 className="configurator-modal__title">
                Create {formatTitle(createModalType)} Component
              </h2>
              <button
                type="button"
                className="configurator-modal__close"
                onClick={handleCloseCreateModal}
              >
                Close
              </button>
            </div>

            <div className="configurator-modal__body">
              <label className="configurator-modal__field">
                <span className="configurator-modal__label">Name</span>
                <input
                  type="text"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  className="configurator-modal__input"
                />
              </label>

              <label className="configurator-modal__checkbox">
                <input
                  type="checkbox"
                  checked={newIsActive}
                  onChange={(event) => setNewIsActive(event.target.checked)}
                />
                <span>Is Active</span>
              </label>
            </div>

            <div className="configurator-modal__actions">
              <button
                type="button"
                className="configurator-pagination-button"
                onClick={handleCloseCreateModal}
                disabled={creating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="configurator-action-link"
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
