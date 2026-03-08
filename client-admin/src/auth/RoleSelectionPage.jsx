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
      <div className="role-gate__panel">
        <h1 className="role-gate__title">Choose a workspace</h1>

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
    </section>
  )
}
