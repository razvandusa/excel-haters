import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'

const tabIcons = {
  configurator: 'hardware',
  timetables: 'calendar_month',
  flights: 'flight_takeoff',
  recommendation: 'editor_choice',
}

function formatDateTime(now) {
  return {
    date: new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(now),
    time: new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      hour12: false,
      minute: '2-digit',
      second: '2-digit',
    }).format(now),
  }
}

export default function TabNav({ onLogout, tabs }) {
  const [dateTime, setDateTime] = useState(() => formatDateTime(new Date()))

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDateTime(formatDateTime(new Date()))
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="sticky top-0 z-50 flex w-full flex-col gap-2 border border-white/10 bg-slate-900/90 p-2 shadow-2xl shadow-black/30 backdrop-blur sm:flex-row sm:items-start sm:justify-between">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              isActive
                ? "relative inline-flex min-h-16 w-full flex-col items-center justify-center gap-1 overflow-hidden border border-transparent bg-cyan-300 px-3 py-3 text-center text-xs font-medium text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] shadow-lg shadow-cyan-500/20 transition-[transform,background-color,color,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-lg hover:shadow-black/20 active:translate-y-px active:scale-[0.98] active:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-h-0 sm:w-auto sm:flex-row sm:justify-start sm:gap-2 sm:px-4 sm:py-2 sm:text-sm after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(120deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.14)_50%,rgba(255,255,255,0)_80%)] after:opacity-0 after:transition-opacity after:duration-150 active:after:opacity-100"
                : "relative inline-flex min-h-16 w-full flex-col items-center justify-center gap-1 overflow-hidden border border-white/10 bg-white/5 px-3 py-3 text-center text-xs font-medium text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[transform,background-color,color,border-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-lg hover:shadow-black/20 active:translate-y-px active:scale-[0.97] active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-h-0 sm:w-auto sm:flex-row sm:justify-start sm:gap-2 sm:px-4 sm:py-2 sm:text-sm after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(120deg,rgba(255,255,255,0)_20%,rgba(255,255,255,0.14)_50%,rgba(255,255,255,0)_80%)] after:opacity-0 after:transition-opacity after:duration-150 active:after:opacity-100"
            }
          >
            {tabIcons[tab.id] ? (
              <>
                <span
                  className="material-symbols-outlined text-[18px] leading-none"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
                >
                  {tabIcons[tab.id]}
                </span>
                <span className="leading-tight sm:leading-normal">{tab.label}</span>
              </>
            ) : (
              <span className="leading-tight sm:leading-normal">{tab.label}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300 sm:ml-auto sm:min-w-[250px] sm:justify-end">
        <span className="text-slate-400">{dateTime.date}</span>
        <span className="text-cyan-100">{dateTime.time}</span>
        <button
          type="button"
          className="inline-flex items-center border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-100 transition-colors duration-150 hover:bg-rose-300/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
