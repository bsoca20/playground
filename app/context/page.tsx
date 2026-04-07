import { Button } from "@/components/ui/button";

export default function ContextPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-grid-soft opacity-15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(127,29,29,0.18),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">Contexto del caso</p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-6xl">
              ¿Lanzas o no lanzas?
            </h1>
          </div>
          <div className="flex gap-3">
            <Button href="/" variant="ghost" className="rounded-xl border border-white/10 px-5">
              Volver
            </Button>
            <Button href="/student/demo-session" className="rounded-xl px-6">
              Ir al simulador
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Tu punto de partida</p>
            <p className="mt-5 text-lg leading-8 text-zinc-300">
              Eres Eva, responsable de la unidad de negocio de Cefalix en España. Arrancas con una historia potente:
              ventaja de entrada, ambición amplia y la sensación de que todavía puedes influir en el mercado antes que
              LenovoBio y TeraHead. El problema es que esa ventana se irá estrechando.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-6">
              <div className="text-sm font-bold uppercase tracking-[0.18em] text-red-400">Contexto de mercado</div>
              <div className="mt-4 space-y-4 text-sm leading-7 text-zinc-300">
                <p>
                  La migraña se ha banalizado durante años. Muchos pacientes se automedican, tardan en llegar al médico
                  y a menudo reciben preventivos que no fueron diseñados específicamente para esta enfermedad.
                </p>
                <p>
                  Cefalix pertenece a una nueva generación de fármacos diseñados específicamente para la prevención de la
                  migraña. Eso puede ser revolucionario, pero no garantiza éxito: el ecosistema todavía no está preparado.
                </p>
                <p>
                  En España hay unos 2800 neurólogos, pero el foco real del caso se concentra aproximadamente en 1500
                  médicos. El mercado también se concentra en unos 250 hospitales, con los top 50 explicando una gran
                  parte del potencial.
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-brand-red p-8 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-100">Core dilemma</p>
              <h2 className="mt-3 text-3xl font-black uppercase">¿Lanzar o no lanzar?</h2>
              <p className="mt-4 text-base leading-8 text-red-50/90">
                El equipo debe decidir si merece la pena lanzar Cefalix bajo presión de precio, retraso y competidores
                que también quieren llegar rápido.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Marco del caso</p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
                <div>• La ambición inicial es defender una indicación amplia, alineada con Europa, con cuatro días de migraña al mes.</div>
                <div>• España suele restringir pools, pedir rebajas de precio fuertes y elevar barreras a la prescripción.</div>
                <div>• Tu trabajo será decidir cuánto de esa ambición merece seguir defendiéndose y en qué condiciones.</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Competidores</p>
                <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-300">
                  <div><span className="font-bold text-white">Cefalix</span> · tu producto</div>
                  <div><span className="font-bold text-white">LenovoBio</span> · competidor principal</div>
                  <div><span className="font-bold text-white">TeraHead</span> · competidor principal con potencial agresividad en precio y comunicación</div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">Pricing y acceso</p>
                <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-300">
                  <div><span className="font-bold text-white">Precio target de partida</span> · 500 €/mes</div>
                  <div><span className="font-bold text-white">TeraHead podría salir</span> · 5–10% por debajo</div>
                  <div>En España las negociaciones son duras. Las reducciones pueden moverse con facilidad entre 30% y 60%, y es frecuente que la primera negociación no termine en aprobación.</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Objetivos del ejercicio</p>
              <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
                <div>• Superar a la competencia en el lanzamiento.</div>
                <div>• Si lanzan dos productos, objetivo de referencia: 51% de cuota. Si lanzan tres, lograr la mayor cuota posible.</div>
                <div>• Buscar margen positivo en el segundo año completo post-launch.</div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Timeline del caso</p>
              <div className="mt-6 grid gap-3 md:grid-cols-4">
                {[
                  { year: "2017", note: "Best case todavía imaginable" },
                  { year: "2018", note: "Acceso se endurece" },
                  { year: "2019", note: "Decisión real de launch" },
                  { year: "2020", note: "Lanzamiento base del ejercicio" }
                ].map((item) => (
                  <div key={item.year} className="rounded-3xl border border-white/10 bg-black/30 p-5">
                    <div className="text-2xl font-black">{item.year}</div>
                    <div className="mt-2 text-sm text-zinc-300">{item.note}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
