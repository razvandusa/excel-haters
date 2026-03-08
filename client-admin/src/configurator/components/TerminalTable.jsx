import { useMemo, useState } from 'react'
import useTablePagination, {
  DEFAULT_PAGE_SIZE,
} from '../hooks/useTablePagination.js'
import terminalTypeOptions from '../config/terminalTypeOptions.js'

const CONFIGURATOR_VIEW_BASE_URL = 'http://10.1.0.171:5173/configurator'

function formatStatus(isActive) {
  return isActive ? 'Yes' : 'No'
}

function getTerminalNameTokens(name) {
  const normalizedName = String(name).toLowerCase()
  const letterMatches = normalizedName.match(/[a-z]/g) || []

  return [normalizedName, ...letterMatches]
}

function compareTerminals(left, right, sortField) {
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

export default function TerminalTable({
  terminals,
  title,
  isLoading = false,
  error = '',
  showType = true,
  showIsActive = true,
}) {
  const [searchValue, setSearchValue] = useState('')
  const [sortField, setSortField] = useState('id')
  const [typeFilter, setTypeFilter] = useState('all')
  const filteredTerminals = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    const nextTerminals = terminals.filter((terminal) => {
      const status = terminal.isActive ? 'yes active' : 'no inactive'
      const nameTokens = getTerminalNameTokens(terminal.name)
      const matchesType =
        showType && typeFilter !== 'all' ? terminal.type === typeFilter : true
      const queryValues = [terminal.id]

      if (showType) {
        queryValues.push(terminal.type)
      }

      if (showIsActive) {
        queryValues.push(status)
      }

      const matchesQuery =
        !query ||
        queryValues.some((value) => String(value).toLowerCase().includes(query)) ||
        nameTokens.some((value) => value.includes(query))

      return matchesType && matchesQuery
    })

    return [...nextTerminals].sort((left, right) =>
      compareTerminals(left, right, sortField),
    )
  }, [searchValue, showIsActive, showType, sortField, terminals, typeFilter])
  const hasRows = filteredTerminals.length > 0
  const { currentPage, setCurrentPage, totalPages, paginatedItems } =
    useTablePagination(filteredTerminals, DEFAULT_PAGE_SIZE)
  const columnCount = 2 + Number(showType) + Number(showIsActive) + 1

  return (
    <section className="configurator-table-card">
      <div className="configurator-table-card__header">
        <div>
          <h2 className="configurator-table-card__title">{title}</h2>
        </div>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="configurator-table__search"
          placeholder="Search terminals"
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
              {showType ? (
                <th>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="configurator-table__header-select"
                  >
                    <option value="all">Type</option>
                    {terminalTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </th>
              ) : null}
              {showIsActive ? (
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
              <th className="configurator-table__actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columnCount} className="configurator-table__feedback">
                  Loading terminals...
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
              paginatedItems.map((terminal) => (
                <tr key={terminal.id}>
                  <td>{terminal.id}</td>
                  <td>{terminal.name}</td>
                  {showType ? (
                    <td className="capitalize">
                      {terminalTypeOptions.includes(terminal.type)
                        ? terminal.type
                        : 'Unknown'}
                    </td>
<<<<<<< Updated upstream
                  ) : null}
                  {showIsActive ? (
                    <td>
                      <span
                        className={
                          terminal.isActive
                            ? 'configurator-status configurator-status--active'
                            : 'configurator-status configurator-status--inactive'
                        }
=======
                    <td className="px-5 py-3">{terminal.name}</td>
                    {showIsActive ? (
                      <td className="px-5 py-3 text-right">
                        <button
                          className={
                            terminal.isActive
                              ? "inline-flex border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                              : "inline-flex border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] border-slate-300/15 bg-slate-300/10 text-slate-300"
                          }
                          disabled={toggling}
                          onClick={() => handleToggleActive(terminal)}
                          title="Toggle Active"
                        >
                          {terminal.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                    ) : null}
                    <td className="px-5 py-3 text-right">
                      <a
                        href={`${CONFIGURATOR_VIEW_BASE_URL}/${encodeURIComponent(terminal.name)}`}
                        className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
>>>>>>> Stashed changes
                      >
                        {formatStatus(terminal.isActive)}
                      </span>
                    </td>
                  ) : null}
                  <td className="configurator-table__actions-cell">
                    <a
                      href={`${CONFIGURATOR_VIEW_BASE_URL}/${encodeURIComponent(terminal.name)}`}
                      className="configurator-action-link"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}

            {!isLoading && !error && !hasRows && (
              <tr>
                <td colSpan={columnCount} className="configurator-table__feedback">
                  No terminals found.
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
