import loginPageIcon from '../assets/loginpageicon.png'
import { useNavigate } from 'react-router-dom'

const landingCards = [
  {
    role: 'admin',
    title: 'Login as Admin',
  },
  {
    role: 'user',
    title: 'Login as User',
  },
]

const destinationByRole = {
  admin: '/configurator',
  user: '/recommendation',
}

export default function RoleSelectionPage({ activeRole, onSelectRole }) {
  const navigate = useNavigate()

  function handleSelectRole(role) {
    onSelectRole(role)
    navigate(destinationByRole[role], { replace: true })
  }

  return (
    <section className="role-gate">
      <div className="role-gate__shell">
        <div className="role-gate__visual">
          <div className="role-gate__visual-copy">
            <span className="role-gate__kicker">Flight Operations</span>
            <h1 className="role-gate__title">Login</h1>
            <p className="role-gate__subtitle">
              Open the control surface that matches this session.
            </p>
          </div>
          <div className="role-gate__visual-icon" aria-hidden="true">
            <img
              src={loginPageIcon}
              alt=""
              className="role-gate__visual-image"
            />
          </div>
          <div className="role-gate__route role-gate__route--one" />
          <div className="role-gate__route role-gate__route--two" />
        </div>

        <div className="role-gate__panel">
          <div className="role-gate__panel-card">
            <h2 className="role-gate__panel-title">Workspace Access</h2>

            {activeRole ? (
              <p className="role-gate__status">
                Current role: <span>{activeRole}</span>
              </p>
            ) : null}

            <div className="role-gate__actions">
              {landingCards.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  className="role-gate__button"
                  onClick={() => handleSelectRole(card.role)}
                >
                  <span className="role-gate__button-title">{card.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
