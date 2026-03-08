import { useMemo, useState } from "react";
import useTablePagination, {
  DEFAULT_PAGE_SIZE,
} from "../hooks/useTablePagination.js";

function formatStatus(isActive) {
  return isActive ? "Yes" : "No";
}

function compareComponents(left, right, sortField) {
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

export default function ComponentTable({
  components,
  title,
  isLoading = false,
  error = "",
}) {
  const [searchValue, setSearchValue] = useState("");
  const [sortField, setSortField] = useState("id");

  const filteredComponents = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const nextComponents = components.filter((component) => {
      const status = component.isActive ? "yes active" : "no inactive";
      const matchesQuery =
        !query ||
        [component.id, component.name, status].some((value) =>
          String(value).toLowerCase().includes(query),
        );

      return matchesQuery;
    });

    return [...nextComponents].sort((left, right) =>
      compareComponents(left, right, sortField),
    );
  }, [components, searchValue, sortField]);
  const hasRows = filteredComponents.length > 0;
  const { currentPage, setCurrentPage, totalPages, paginatedItems } =
    useTablePagination(filteredComponents, DEFAULT_PAGE_SIZE);

  return (
    <section className="overflow-hidden border border-white/10 bg-slate-950/40 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          {title ? (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          ) : null}
        </div>
        <input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-full max-w-56 border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/70"
          placeholder="Search components"
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
              <th className="px-5 py-3 font-bold text-right">
                <button
                  type="button"
                  className="w-full text-left font-bold text-slate-400 transition-colors duration-150 hover:text-white focus:outline-none"
                  onClick={() => setSortField("isActive")}
                >
                  Is Active
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && (
              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-6 text-center text-sm text-slate-400"
                >
                  Loading components...
                </td>
              </tr>
            )}

            {!isLoading && error && (
              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-6 text-center text-sm text-rose-300"
                >
                  {error}
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              hasRows &&
              paginatedItems.map((component) => (
                <tr key={component.id} className="bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium text-white">
                    {component.id}
                  </td>
                  <td className="px-5 py-3">{component.name}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={
                        component.isActive
                          ? "inline-flex border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                          : "inline-flex border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] border-slate-300/15 bg-slate-300/10 text-slate-300"
                      }
                    >
                      {formatStatus(component.isActive)}
                    </span>
                  </td>
                </tr>
              ))}

            {!isLoading && !error && !hasRows && (
              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-6 text-center text-sm text-slate-400"
                >
                  No components found.
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
  );
}
