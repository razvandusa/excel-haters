import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useTablePagination, {
  DEFAULT_PAGE_SIZE,
} from "../hooks/useTablePagination.js";
import {
  deleteTerminal,
  fetchTerminals,
  updateTerminalStatus,
} from "../../api/terminals.js";

const CONFIGURATOR_VIEW_BASE_URL = "http://10.1.0.171:5173/configurator";

function formatStatus(isActive) {
  return isActive ? "Yes" : "No";
}

function getTerminalNameTokens(name) {
  const normalizedName = String(name).toLowerCase();
  const letterMatches = normalizedName.match(/[a-z]/g) || [];
  return [normalizedName, ...letterMatches];
}

function compareTerminals(left, right, sortField) {
  if (sortField === "id") {
    return String(left.id).localeCompare(String(right.id), undefined, {
      numeric: true,
    });
  }
  if (sortField === "isActive") {
    return Number(right.isActive) - Number(left.isActive);
  }
  return String(left[sortField]).localeCompare(String(right[sortField]));
}

export default function TerminalTable({
  terminals,
  title,
  isLoading = false,
  error = "",
  showIsActive = true,
  setTerminals, // Pass this from parent if you want to update state after delete
}) {
  const [searchValue, setSearchValue] = useState("");
  const [sortField, setSortField] = useState("id");
  const [showModal, setShowModal] = useState(false);
  const [terminalToDelete, setTerminalToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const filteredTerminals = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const nextTerminals = terminals.filter((terminal) => {
      const status = terminal.isActive ? "yes active" : "no inactive";
      const nameTokens = getTerminalNameTokens(terminal.name);
      const queryValues = [terminal.id];
      if (showIsActive) queryValues.push(status);
      const matchesQuery =
        !query ||
        queryValues.some((value) =>
          String(value).toLowerCase().includes(query),
        ) ||
        nameTokens.some((value) => value.includes(query));
      return matchesQuery;
    });
    return [...nextTerminals].sort((left, right) =>
      compareTerminals(left, right, sortField),
    );
  }, [searchValue, showIsActive, sortField, terminals]);
  const hasRows = filteredTerminals.length > 0;
  const { currentPage, setCurrentPage, totalPages, paginatedItems } =
    useTablePagination(filteredTerminals, DEFAULT_PAGE_SIZE);
  const columnCount = 2 + Number(showIsActive) + 1;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTerminal(terminalToDelete.id);
      // Refetch terminals from backend
      const updatedTerminals = await fetchTerminals();
      setTerminals(updatedTerminals);
      setShowModal(false);
      setTerminalToDelete(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (terminal) => {
    setToggling(true);
    try {
      await updateTerminalStatus(terminal.id, !terminal.isActive);
      const updatedTerminals = await fetchTerminals();
      setTerminals(updatedTerminals);
    } catch (err) {
      alert(err.message);
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden border border-white/10 bg-slate-950/40 shadow-xl shadow-black/10">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-full max-w-56 border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
            placeholder="Search terminals"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-sm uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-5 py-3 font-bold">
                  <button
                    type="button"
                    className="w-full text-left font-bold text-slate-400 transition-colors duration-150 hover:text-white focus:outline-none"
                    onClick={() => setSortField("id")}
                  >
                    ID
                  </button>
                </th>
                <th className="px-5 py-3 font-bold">
                  <button
                    type="button"
                    className="w-full text-left font-bold text-slate-400 transition-colors duration-150 hover:text-white focus:outline-none"
                    onClick={() => setSortField("name")}
                  >
                    Name
                  </button>
                </th>
                {showIsActive ? (
                  <th className="px-5 py-3 font-bold text-right">
                    <button
                      type="button"
                      className="w-full text-right font-bold text-slate-400 transition-colors duration-150 hover:text-white focus:outline-none"
                      onClick={() => setSortField("isActive")}
                    >
                      Is Active
                    </button>
                  </th>
                ) : null}
                <th className="px-5 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="px-5 py-6 text-center text-sm text-slate-400"
                  >
                    Loading terminals...
                  </td>
                </tr>
              )}
              {!isLoading && error && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="px-5 py-6 text-center text-sm text-rose-300"
                  >
                    {error}
                  </td>
                </tr>
              )}
              {!isLoading &&
                !error &&
                hasRows &&
                paginatedItems.map((terminal) => (
                  <tr key={terminal.id} className="bg-white/[0.02]">
                    <td className="px-5 py-3 font-medium text-white">
                      {terminal.id}
                    </td>
                    <td className="px-5 py-3">{terminal.name}</td>
                    {showIsActive ? (
                      <td className="px-5 py-3 text-right">
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
                      </td>
                    ) : null}
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/configurator/${encodeURIComponent(terminal.name)}`}
                        className="inline-flex border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition-colors duration-150 hover:bg-cyan-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                      >
                        View
                      </Link>
                      <button
                        className="ml-2 inline-flex border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-100 transition-colors duration-150 hover:bg-rose-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                        onClick={() => {
                          setShowModal(true);
                          setTerminalToDelete(terminal);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              {!isLoading && !error && !hasRows && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="px-5 py-6 text-center text-sm text-slate-400"
                  >
                    No terminals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && hasRows && (
          <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
            <button
              type="button"
              className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="text-sm font-medium text-slate-300">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              className="inline-flex border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/[0.03] disabled:text-slate-500"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-md border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-black/40">
            <h2 className="text-lg font-semibold text-white mb-4">
              Confirm Delete
            </h2>
            <p className="mb-4 text-slate-200">
              Are you sure you want to delete terminal{" "}
              <span className="font-bold">{terminalToDelete?.name}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-100"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
