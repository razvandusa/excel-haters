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
    <section className="flex min-h-screen items-center justify-center py-6">
      <div className="grid min-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden border border-white/10 bg-slate-950/50 shadow-2xl shadow-black/40 backdrop-blur lg:grid-cols-[1.05fr_0.95fr]">
        <div
          className="relative flex min-h-[320px] flex-col justify-between overflow-hidden bg-slate-900 px-8 py-10 sm:px-12 sm:py-14"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 18%, rgba(34, 211, 238, 0.18), transparent 30%), linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(2, 6, 23, 0.98) 100%)',
          }}
        >
          <div className="relative z-10 max-w-md">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">Flight Operations</span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Sky Track</h1>
            <p className="mt-4 max-w-sm text-sm text-slate-300 sm:text-base">
              Open the control surface that matches this session.
            </p>
          </div>
          <div className="relative z-10 mt-10 flex justify-center lg:justify-start" aria-hidden="true">
            <img
              src={loginPageIcon}
              alt=""
              className="h-auto w-full max-w-[34rem] object-contain"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-28 -left-14 h-56 w-56 rounded-full border border-cyan-300/20" />
          <div className="pointer-events-none absolute -bottom-16 left-12 h-72 w-72 rounded-full border border-cyan-300/20" />
        </div>

        <div
          className="relative flex items-center justify-center overflow-hidden px-6 py-10 before:pointer-events-none before:absolute before:-bottom-32 before:-right-20 before:h-72 before:w-72 before:border before:border-white/30 before:content-[''] after:pointer-events-none after:absolute after:-bottom-44 after:-right-4 after:h-[26rem] after:w-[26rem] after:border after:border-white/30 after:content-[''] sm:px-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at top right, rgba(186, 230, 253, 0.12), transparent 24%), radial-gradient(circle at bottom left, rgba(34, 211, 238, 0.12), transparent 32%), linear-gradient(180deg, #0f172a 0%, #111827 55%, #020617 100%)',
          }}
        >
          <div
            className="relative z-10 w-full max-w-md border border-cyan-200/10 bg-slate-900/88 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10"
            style={{
              boxShadow:
                '0 24px 60px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white">Login</h2>

            {activeRole ? (
              <p className="mt-6 inline-flex border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                Current role: <span className="ml-2 text-white">{activeRole}</span>
              </p>
            ) : null}

            <div className="mt-8 grid gap-4">
              {landingCards.map((card) => (
                <button
                  key={card.role}
                  type="button"
                  className="inline-flex min-h-16 items-center justify-center border border-cyan-300/25 bg-cyan-300/10 px-6 py-4 text-center transition-[transform,border-color,background-color,box-shadow] duration-150 hover:-translate-y-1 hover:border-cyan-200/40 hover:bg-cyan-300/20 hover:shadow-xl hover:shadow-cyan-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  onClick={() => handleSelectRole(card.role)}
                >
                  <span className="text-lg font-semibold tracking-tight text-white">{card.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
