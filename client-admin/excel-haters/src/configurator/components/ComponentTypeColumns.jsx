import { useEffect, useState } from 'react'
import componentTypeOptions from '../config/componentTypeOptions.js'

function formatTitle(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function formatStatus(isActive) {
  return isActive ? 'Active' : 'Inactive'
}

export default function ComponentTypeColumns({
  components,
  isLoading = false,
  error = '',
  showControls = true,
  showStatus = true,
}) {
  const [componentItems, setComponentItems] = useState(components)

  useEffect(() => {
    setComponentItems(components)
  }, [components])

  function handleRemoveComponent(componentId) {
    setComponentItems((currentItems) =>
      currentItems.filter((component) => component.id !== componentId),
    )
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
    )
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
    )
  }

  return (
    <>
      <section className="configurator-type-rows">
        {componentTypeOptions.map((type) => {
          const typedComponents = componentItems.filter(
            (component) => component.type === type,
          )

          return (
            <div key={type} className="configurator-type-column">
              <div className="configurator-type-column__header">
                <h2 className="configurator-type-column__title">
                  {formatTitle(type)}
                </h2>
                {showControls ? (
                  <div className="configurator-type-column__actions">
                    <button
                      type="button"
                      className="configurator-type-column__add-button"
                    >
                      +
                    </button>
                  </div>
                ) : null}
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
                        {showStatus ? (
                          <span
                            className={
                              component.isActive
                                ? 'configurator-status configurator-status--active'
                                : 'configurator-status configurator-status--inactive'
                            }
                          >
                            {formatStatus(component.isActive)}
                          </span>
                        ) : null}
                        {showControls ? (
                          <button
                            type="button"
                            className="configurator-type-column__add-button"
                            onClick={() => handleRemoveComponent(component.id)}
                          >
                            -
                          </button>
                        ) : null}
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
          )
        })}
      </section>
    </>
  )
}
