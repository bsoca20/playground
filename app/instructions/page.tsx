import { Button } from "@/components/ui/button";

const RULES = [
  "Construye el lanzamiento año por año.",
  "No puedes superar el presupuesto anual.",
  "Algunas inversiones arrastran coste y capacidad al año siguiente.",
  "El personal activado no puede reducirse en el año siguiente.",
  "Los estudios clínicos duran 3 años: 100% el primer año, 50% el segundo y 25% el tercero.",
  "El tutor puede enviarte mensajes durante la simulación y cambiar el contexto del caso.",
  "Puedes enviar mensajes al Boardroom y al facilitador, y también ver un one-page summary de tus acciones."
];

export default function InstructionsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-grid-soft opacity-15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(127,29,29,0.18),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">Instrucciones del simulador</p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-6xl">
              Cómo jugar este caso
            </h1>
          </div>
          <div className="flex gap-3">
            <Button href="/" variant="ghost" className="rounded-xl border border-white/10 px-5">
              Home
            </Button>
            <Button href="/context" variant="ghost" className="rounded-xl border border-white/10 px-5">
              Contexto
            </Button>
            <Button href="/student/demo-session" className="rounded-xl px-6">
              Ir al simulador
            </Button>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Instrucciones del simulador</p>
            <p className="mt-5 text-lg leading-8 text-zinc-300">
              Eres Eva, directora de la unidad de negocio de Cefalix en España. El caso avanza año a año y no muestra
              el futuro por adelantado. Primero entiendes el contexto del año, luego revisas los key data, eliges
              actividades y cierras con Boardroom. Tu éxito no se medirá solo por cuota: también importan acceso,
              sostenibilidad, confianza, preparación y atractivo del launch.
            </p>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">Cómo funciona el ejercicio</p>
            <div className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
              {RULES.map((rule, index) => (
                <div key={rule}>
                  {index + 1}. {rule}
                </div>
              ))}
              <div>
                No verás una respuesta explícita correcta o incorrecta. Tendrás que interpretar los datos, los mensajes
                del facilitador, el mercado y la lógica del caso.
              </div>
              <div>Recuerda: no se trata solo de ganar, sino de aprender a través del camino.</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
