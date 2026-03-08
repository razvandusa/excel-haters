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
    <div className="top-bar">
      <div className="top-bar__tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              isActive ? 'tab-link tab-link--active' : 'tab-link'
            }
          >
            {tabIcons[tab.id] ? (
              <>
                <span className="material-symbols-outlined tab-link__icon">
                  {tabIcons[tab.id]}
                </span>
                <span className="tab-link__label">{tab.label}</span>
              </>
            ) : (
              <span className="tab-link__label">{tab.label}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="top-bar__meta">
        <span className="top-bar__date">{dateTime.date}</span>
        <span className="top-bar__time">{dateTime.time}</span>
        <button
          type="button"
          className="top-bar__logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
