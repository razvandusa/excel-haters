import { useMemo, useState } from 'react'
import componentTypeOptions from '../config/componentTypeOptions.js'
import useTablePagination, {
  DEFAULT_PAGE_SIZE,
} from '../hooks/useTablePagination.js'

function formatStatus(isActive) {
  return isActive ? 'Yes' : 'No'
}

function compareComponents(left, right, sortField) {
  if (sortField === 'id') {
    return String(left.id).localeCompare(String(right.id), undefined, {
      numeric: true,
    })
  }

  if (sortField === 'isActive') {
    return Number(right.isActive) - Number(left.isActive)
  }

  return String(left[sortField]).localeCompare(String(right[sortField]))
}

export default function ComponentTable({
  components,
  title,
  isLoading = false,
  error = '',
  showTypeColumn = true,
  showStatusColumn = true,
}) {
  const [searchValue, setSearchValue] = useState('')
  const [sortField, setSortField] = useState('id')

  const filteredComponents = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    const nextComponents = components.filter((component) => {
      const status = component.isActive ? 'yes active' : 'no inactive'
      const matchesQuery =
        !query ||
        [
          component.id,
          component.name,
          ...(showTypeColumn ? [component.type] : []),
          ...(showStatusColumn ? [status] : []),
        ].some((value) => String(value).toLowerCase().includes(query))

      return matchesQuery
    })

    return [...nextComponents].sort((left, right) =>
      compareComponents(left, right, sortField),
    )
  }, [components, searchValue, showStatusColumn, showTypeColumn, sortField])
  const hasRows = filteredComponents.length > 0
  const columnCount = 2 + Number(showTypeColumn) + Number(showStatusColumn)
  const { currentPage, setCurrentPage, totalPages, paginatedItems } =
    useTablePagination(filteredComponents, DEFAULT_PAGE_SIZE)

  return (
    <section className="configurator-table-card">
      <div className="configurator-table-card__header">
        <div>
          {title ? <h2 className="configurator-table-card__title">{title}</h2> : null}
        </div>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="configurator-table__search"
          placeholder="Search components"
        />
      </div>

      <div className="configurator-table-wrap">
        <table className="configurator-table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="configurator-table__sort-button"
                  onClick={() => setSortField('id')}
                >
                  ID
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="configurator-table__sort-button"
                  onClick={() => setSortField('name')}
                >
                  Name
                </button>
              </th>
              {showTypeColumn ? (
                <th>
                  <button
                    type="button"
                    className="configurator-table__sort-button"
                    onClick={() => setSortField('type')}
                  >
                    Type
                  </button>
                </th>
              ) : null}
              {showStatusColumn ? (
                <th>
                  <button
                    type="button"
                    className="configurator-table__sort-button"
                    onClick={() => setSortField('isActive')}
                  >
                    Is Active
                  </button>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columnCount} className="configurator-table__feedback">
                  Loading components...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td
                  colSpan={columnCount}
                  className="configurator-table__feedback configurator-table__feedback--error"
                >
                  {error}
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              hasRows &&
              paginatedItems.map((component) => (
                <tr key={component.id}>
                  <td>{component.id}</td>
                  <td>{component.name}</td>
                  {showTypeColumn ? (
                    <td className="capitalize">
                      {componentTypeOptions.includes(component.type)
                        ? component.type
                        : 'Unknown'}
                    </td>
                  ) : null}
                  {showStatusColumn ? (
                    <td>
                      <span
                        className={
                          component.isActive
                            ? 'configurator-status configurator-status--active'
                            : 'configurator-status configurator-status--inactive'
                        }
                      >
                        {formatStatus(component.isActive)}
                      </span>
                    </td>
                  ) : null}
                </tr>
              ))}

            {!isLoading && !error && !hasRows && (
              <tr>
                <td colSpan={columnCount} className="configurator-table__feedback">
                  No components found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !error && hasRows && (
        <div className="configurator-table__pagination">
          <button
            type="button"
            className="configurator-pagination-button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="configurator-table__page-indicator">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            className="configurator-pagination-button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  )
}
