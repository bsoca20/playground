export default function ProgramPage() {
  const DAYS = [
    {
      day: "Day 1",
      date: "08 April 2026",
      theme: "Why Launches Fail & The Need for a New Model",
      sessions: [
        {
          time: "12:00–12:30",
          title: "Welcome & Strategic Framing",
          items: [
            "Program overview",
            "Expectations, outcomes and participant presentation",
            "Why launches are underperforming globally"
          ]
        },
        {
          time: "12:30–13:45",
          title: "Session 1 · The End of the Traditional Launch Model",
          items: [
            "Launch readiness as we know it",
            "The risk of organizational silos and fragmented accountability",
            "Internal & external misalignment"
          ],
          deck: "/pharma_launch_deck_LH.html"
        },
        {
          time: "13:45–14:45",
          title: "Lunch & Networking",
          items: []
        },
        {
          time: "14:45–16:15",
          title: "Session 2 · The Real Value Creation in Pharma",
          items: [
            "Evolution of HCP engagement",
            "Health system pressure",
            "Digital expectations",
            "Patient empowerment",
            "External speaker on patient engagement"
          ]
        },
        {
          time: "16:15–17:00",
          title: "Session 3 · From Ego-System to Ecosystem Mindset",
          items: [
            "What a real pharma ecosystem means",
            "Stakeholders vs interdependencies",
            "From control mindset to orchestration leadership"
          ],
          deck: "/ecosystem_launch_deck_LH.html"
        },
        {
          time: "17:00–17:15",
          title: "Coffee Break & Networking",
          items: []
        },
        {
          time: "17:15–18:00",
          title: "Session 4 · Ecosystem Mapping Lab",
          items: [
            "Patient · HCP · Hospitals",
            "Payers · Regulators · Digital platforms"
          ]
        },
        {
          time: "18:00–18:15",
          title: "Reflection of the Day",
          items: []
        }
      ]
    },
    {
      day: "Day 2",
      date: "09 April 2026",
      theme: "Building Value & Designing a Winning Ecosystem Launch",
      sessions: [
        {
          time: "09:00–09:30",
          title: "Recap · Key Takeaways",
          items: []
        },
        {
          time: "09:30–11:00",
          title: "Session 5 · Value Creation Beyond Product",
          items: [
            "Business case: Launch an Innovative Value Proposition in Medical Devices",
            "Innovative value proposition design"
          ]
        },
        {
          time: "11:00–11:15",
          title: "Coffee Break & Networking",
          items: []
        },
        {
          time: "11:15–13:00",
          title: "Session 6 · Value Creation in Rare Disease",
          items: [
            "Business case: Launching in a Rare Disease Market",
            "Compelling story for an access fast launch"
          ]
        },
        {
          time: "13:00–14:00",
          title: "Lunch & Networking",
          items: []
        },
        {
          time: "14:00–15:30",
          title: "Session 7 · Disrupting The Market Before The Launch",
          items: [
            "Building the Ecosystem Launch Blueprint",
            "Governance model & roles",
            "Timeline orchestration",
            "Strategic KPI architecture",
            "Preparing the market for successful launch"
          ]
        },
        {
          time: "15:30–15:45",
          title: "Coffee Break & Networking",
          items: []
        },
        {
          time: "15:45–17:00",
          title: "Session 8 · Customer Experience & Engagement Design",
          items: [
            "Omnichannel orchestration",
            "Experience journey vs tactical campaigns",
            "Medical + Marketing integration"
          ]
        },
        {
          time: "17:00–17:30",
          title: "Reflection of the Day",
          items: []
        },
        {
          time: "18:00",
          title: "Evening Networking Reception",
          items: []
        }
      ]
    },
    {
      day: "Day 3",
      date: "10 April 2026",
      theme: "Orchestrating High-Impact Launches",
      sessions: [
        {
          time: "09:00–09:30",
          title: "Recap · Key Takeaways",
          items: []
        },
        {
          time: "09:30–11:00",
          title: "Session 9 · Transforming a Business Unit into a Launch Machine",
          items: [
            "Launch prioritization & resource orchestration",
            "Ecosystem trade-offs & stakeholder risk",
            "Handling multiple launches in a short period",
            "Becoming a launch machine organization"
          ]
        },
        {
          time: "11:00–11:15",
          title: "Coffee Break & Networking",
          items: []
        },
        {
          time: "11:15–12:15",
          title: "Session 10 · Leading Ecosystem Transformation",
          items: [
            "Strategic influence & cross-functional leadership",
            "Positioning as launch leader",
            "Mobilizing stakeholders"
          ]
        },
        {
          time: "12:15–12:30",
          title: "Closing Session & Reflection",
          items: []
        }
      ]
    }
  ];

  const DAY_COLORS = [
    { border: "border-red-500/40", bg: "bg-red-600/10", text: "text-red-400", accent: "bg-red-600" },
    { border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400", accent: "bg-amber-500" },
    { border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", accent: "bg-emerald-500" }
  ];

  const isBreak = (title: string) =>
    title.includes("Networking") || title.includes("Lunch") || title.includes("Coffee") || title.includes("Recap") || title.includes("Reflection") || title.includes("Closing") || title.includes("Evening");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-grid-soft opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.2),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.12),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-[#dc2626] px-3 py-1 text-xs font-black tracking-[0.18em]">
                LEADERSHIP HOUSE
              </div>
              <span className="text-xs font-semibold tracking-[0.2em] text-zinc-500">× BLUEBARNA ECOSYSTEMS</span>
            </div>
            <h1 className="mt-5 text-5xl font-black uppercase leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Innovative<br />
              <span className="text-[#dc2626]">Launches</span><br />
              in Pharma
            </h1>
            <p className="mt-4 max-w-xl text-base leading-8 text-zinc-400">
              A three-day executive program designed to reframe how pharma leaders think about, plan and execute product launches in complex ecosystems.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>📍 Barcelona</span>
              <span>·</span>
              <span>📅 8–10 April 2026</span>
              <span>·</span>
              <span>3 Days · 10 Sessions</span>
            </div>
          </div>

          {/* CTA Simulador */}
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm w-full max-w-sm">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#dc2626]">Day 3 · Live Simulation</div>
            <h2 className="mt-3 text-2xl font-black uppercase">Cefalix Launch Simulator</h2>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Sesión inmersiva de lanzamiento estratégico en migraña. Decisiones reales, presión de precio, acceso y boardroom ejecutivo.
            </p>
            <div className="mt-5 grid gap-2">
              <a
                href="/student/demo-session"
                className="flex w-full items-center justify-center rounded-xl bg-[#dc2626] px-5 py-3.5 text-sm font-black text-white transition-colors hover:bg-red-700"
              >
                Entrar al simulador →
              </a>
              <a
                href="/elm"
                className="flex w-full items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-3.5 text-sm font-black text-amber-400 transition-colors hover:bg-amber-500/15"
              >
                ELM Survey · Ecosystem Leaders Mindset →
              </a>
              <a
                href="/context"
                className="flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
              >
                Ver contexto del caso
              </a>
              <a
                href="/facilitator/demo-session"
                className="flex w-full items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-500 transition-colors hover:border-white/20 hover:text-zinc-300"
              >
                Acceso facilitador
              </a>
            </div>
          </div>
        </div>

        {/* Agenda */}
        <div className="mt-12">
          <div className="mb-8 text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Agenda completa</div>
          <div className="grid gap-8 lg:grid-cols-3">
            {DAYS.map((day, dayIndex) => {
              const color = DAY_COLORS[dayIndex];
              return (
                <div key={day.day} className={`rounded-[2rem] border ${color.border} ${color.bg} p-6`}>
                  {/* Day header */}
                  <div className="mb-6 border-b border-white/10 pb-5">
                    <div className={`text-xs font-black uppercase tracking-[0.28em] ${color.text}`}>{day.day}</div>
                    <div className="mt-1 text-lg font-black text-white">{day.date}</div>
                    <div className="mt-2 text-sm leading-6 text-zinc-400">{day.theme}</div>
                  </div>

                  {/* Sessions */}
                  <div className="space-y-3">
                    {day.sessions.map((session, i) => (
                      <div key={i} className={`rounded-2xl px-4 py-3 ${isBreak(session.title) ? "bg-white/3 opacity-50" : "bg-black/30"}`}>
                        <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${color.text}`}>{session.time}</div>
                        <div className={`mt-0.5 text-sm font-black ${isBreak(session.title) ? "text-zinc-500" : "text-white"}`}>
                          {session.title}
                        </div>
                        {session.items.length > 0 ? (
                          <ul className="mt-2 space-y-0.5">
                            {session.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs leading-5 text-zinc-500">
                                <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${color.accent}`} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        {"deck" in session && session.deck ? (
                          <a
                            href={session.deck}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] opacity-60 transition-opacity hover:opacity-100 ${color.text} ${color.border}`}
                          >
                            <span>▶</span> Ver presentación
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-zinc-600">
          <span>© 2026 Leadership House · Bluebarna Ecosystems</span>
          <div className="flex gap-6">
            <a href="/preread" className="hover:text-zinc-400 transition-colors">Pre-read</a>
            <a href="/instructions" className="hover:text-zinc-400 transition-colors">Instrucciones</a>
            <a href="/student/demo-session" className="hover:text-zinc-400 transition-colors">Simulador</a>
          </div>
        </div>
      </div>
    </main>
  );
}
