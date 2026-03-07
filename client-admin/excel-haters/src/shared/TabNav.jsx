import { NavLink } from 'react-router-dom'

export default function TabNav({ tabs }) {
  return (
    <div className="top-bar">
      {tabs.map((tab) => (
        <NavLink
          key={tab.id}
          to={tab.path}
          className={({ isActive }) =>
            isActive ? 'tab-link tab-link--active' : 'tab-link'
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  )
}
