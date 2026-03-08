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

function AirplaneMark() {
  return (
    <div className="role-gate__plane-mark" aria-hidden="true">
      <svg viewBox="0 0 640 520" className="role-gate__plane-svg">
        <defs>
          <pattern
            id="role-gate-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path d="M28 0H0V28" className="role-gate__plane-grid" />
          </pattern>
        </defs>

        <rect
          x="0"
          y="0"
          width="640"
          height="520"
          fill="url(#role-gate-grid)"
          opacity="0.22"
        />

        <g transform="rotate(-28 315 255)">
          <path
            className="role-gate__plane-outline"
            d="M132 250
               C158 232 190 224 220 225
               L430 225
               C447 225 466 229 486 238
               L550 268
               L550 284
               L486 280
               C463 279 446 282 430 286
               L221 286
               C191 286 159 278 132 260
               L108 246
               Z"
          />
          <path
            className="role-gate__plane-outline"
            d="M98 247
               C94 243 94 237 98 233
               L128 220
               L148 238
               L148 272
               L128 290
               L98 277
               C94 273 94 267 98 263
               Z"
          />
          <path
            className="role-gate__plane-outline"
            d="M240 224
               L198 126
               L164 122
               L150 131
               L176 146
               L198 228"
          />
          <path
            className="role-gate__plane-outline"
            d="M242 287
               L196 384
               L164 388
               L150 379
               L176 364
               L198 282"
          />
          <path
            className="role-gate__plane-outline"
            d="M408 224
               L372 140
               L552 114
               L562 126
               L428 234"
          />
          <path
            className="role-gate__plane-outline"
            d="M408 286
               L372 370
               L552 396
               L562 384
               L428 276"
          />
          <path
            className="role-gate__plane-outline"
            d="M472 232
               L488 188
               L598 160
               L604 168
               L522 238"
          />
          <path
            className="role-gate__plane-outline"
            d="M472 278
               L488 322
               L598 350
               L604 342
               L522 272"
          />

          {Array.from({ length: 16 }).map((_, index) => {
            const x = 160 + index * 18
            return (
              <line
                key={`rib-${x}`}
                x1={x}
                y1="227"
                x2={x}
                y2="284"
                className="role-gate__plane-detail"
              />
            )
          })}

          {Array.from({ length: 10 }).map((_, index) => {
            const x = 204 + index * 17
            return (
              <ellipse
                key={`frame-${x}`}
                cx={x}
                cy="255"
                rx="16"
                ry="31"
                className="role-gate__plane-detail"
              />
            )
          })}

          <ellipse
            cx="131"
            cy="255"
            rx="22"
            ry="25"
            className="role-gate__plane-detail"
          />
          <path
            className="role-gate__plane-detail"
            d="M138 236C156 236 173 241 185 252"
          />
          <path
            className="role-gate__plane-detail"
            d="M138 274C156 274 173 269 185 258"
          />

          <g className="role-gate__plane-engine">
            <ellipse cx="240" cy="154" rx="16" ry="24" />
            <ellipse cx="240" cy="357" rx="16" ry="24" />
            <ellipse cx="425" cy="170" rx="18" ry="26" />
            <ellipse cx="425" cy="341" rx="18" ry="26" />
          </g>

          {[
            [188, 150, 238, 224],
            [191, 356, 238, 286],
            [392, 149, 428, 227],
            [392, 362, 428, 283],
            [486, 189, 524, 233],
            [486, 321, 524, 277],
          ].map(([x1, y1, x2, y2]) => (
            <line
              key={`${x1}-${y1}-${x2}-${y2}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className="role-gate__plane-detail"
            />
          ))}
        </g>

        <g className="role-gate__plane-annotation">
          <line x1="72" y1="134" x2="176" y2="134" className="role-gate__plane-guide" />
          <line x1="176" y1="134" x2="176" y2="174" className="role-gate__plane-guide" />
          <text x="72" y="126" className="role-gate__plane-label">wing</text>

          <line x1="84" y1="346" x2="180" y2="346" className="role-gate__plane-guide" />
          <line x1="180" y1="346" x2="180" y2="306" className="role-gate__plane-guide" />
          <text x="84" y="338" className="role-gate__plane-label">cockpit</text>

          <line x1="260" y1="74" x2="352" y2="74" className="role-gate__plane-guide" />
          <line x1="352" y1="74" x2="352" y2="128" className="role-gate__plane-guide" />
          <text x="260" y="66" className="role-gate__plane-label">vertical stabilizer</text>

          <line x1="470" y1="138" x2="558" y2="138" className="role-gate__plane-guide" />
          <line x1="470" y1="138" x2="470" y2="190" className="role-gate__plane-guide" />
          <text x="474" y="130" className="role-gate__plane-label">rudder</text>

          <line x1="440" y1="230" x2="538" y2="230" className="role-gate__plane-guide" />
          <line x1="440" y1="230" x2="440" y2="272" className="role-gate__plane-guide" />
          <text x="444" y="222" className="role-gate__plane-label">frame</text>

          <line x1="476" y1="318" x2="574" y2="318" className="role-gate__plane-guide" />
          <line x1="476" y1="318" x2="476" y2="278" className="role-gate__plane-guide" />
          <text x="480" y="310" className="role-gate__plane-label">turbofan engine</text>

          <line x1="222" y1="430" x2="346" y2="430" className="role-gate__plane-guide" />
          <line x1="346" y1="430" x2="346" y2="374" className="role-gate__plane-guide" />
          <text x="226" y="422" className="role-gate__plane-label">fuselage</text>

          <line x1="520" y1="396" x2="606" y2="396" className="role-gate__plane-guide" />
          <line x1="606" y1="396" x2="606" y2="342" className="role-gate__plane-guide" />
          <text x="522" y="388" className="role-gate__plane-label">winglet</text>
        </g>
      </svg>
    </div>
  )
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
            <h1 className="role-gate__title">Choose a workspace</h1>
            <p className="role-gate__subtitle">
              Open the control surface that matches this session.
            </p>
          </div>
          <AirplaneMark />
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
