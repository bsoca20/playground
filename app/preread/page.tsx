import { Button } from "@/components/ui/button";

const SECTIONS = [
  {
    title: "Sección 1",
    heading: "Intro",
    body:
      "Era 2017. Eva Moreno, Business Director en NeuroPharma, estaba sentada sola en la sala de juntas mirando una pizarra todavía en blanco. Sobre la mesa tenía un reto inmenso: preparar el lanzamiento de Cefalix en España. No era una categoría más. Era una apuesta nueva para la compañía. El equipo conocía la neurología, pero no dominaba todavía la migraña como área específica. Y eso podía ser, al mismo tiempo, una ventaja y un riesgo. Eva sabía que el reto no iba solo de lanzar un producto. Iba de entender una enfermedad infravalorada, preparar una organización sin experiencia directa en la categoría, anticiparse a competidores agresivos y leer correctamente a pagadores y autoridades."
  },
  {
    title: "Sección 2",
    heading: "Por qué la migraña importa más de lo que parece",
    body:
      "Durante años, la migraña ha sido banalizada. Muchos pacientes se automedican, tardan mucho en llegar al médico y reciben tratamientos preventivos que no fueron diseñados específicamente para esta enfermedad. En ese contexto aparecen terapias de nueva generación basadas en anticuerpos monoclonales dirigidos al eje CGRP, diseñadas específicamente para la prevención de la migraña. Eso cambia la conversación: ya no estamos ante más de lo mismo, sino ante la posibilidad de redefinir el estándar de prevención."
  },
  {
    title: "Sección 3",
    heading: "Mercado y funnel",
    body:
      "En España hay aproximadamente 2.800 neurólogos. De ellos, unos 1.500 están más directamente expuestos al manejo de migraña. El mercado relevante se concentra aproximadamente en 250 hospitales y los 50 principales explican una parte desproporcionadamente alta del potencial. El pool ampliado si la indicación se mantiene en población más amplia podría llegar a 280.000 pacientes. El gran error sería confundir población con enfermedad con población realmente accesible."
  },
  {
    title: "Sección 4",
    heading: "Precio, acceso y margen",
    body:
      "Para la simulación, el equipo trabajará inicialmente con un precio target de 500 €/mes para Cefalix. En España las negociaciones de precio suelen ser duras. Las reducciones pueden moverse con facilidad entre 30% y 60%, y es frecuente que un producto no sea aprobado en la primera negociación. Además, cada paciente recibe 12 administraciones al año y Cefalix soporta una carga de royalties del 30%."
  }
];

export default function PreReadPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-grid-soft opacity-15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(220,38,38,0.28),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(127,29,29,0.18),transparent_30%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">
              Innovative Launches in Pharma · Leadership House · Bluebarna Ecosystems
            </p>
            <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-6xl">
              Cefalix
              <span className="block text-red-500">Pre-read</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/" variant="ghost" className="rounded-xl border border-white/10 px-5">
              Volver
            </Button>
            <a
              href="/preread/cefalix-preread.pdf"
              download
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white hover:bg-white/15 transition-colors"
            >
              ↓ Descargar PDF
            </a>
            <Button href="/student/demo-session" className="rounded-xl px-6">
              Ir al simulador
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-8 text-zinc-300 shadow-2xl backdrop-blur-sm">
          <p className="text-lg leading-8">
            Este documento no contiene la respuesta correcta del caso. Su objetivo es darte el contexto suficiente para
            entrar en la simulación con criterio, lenguaje común y una primera lectura estratégica del reto.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {SECTIONS.map((section) => (
            <section key={section.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">{section.title}</p>
              <h2 className="mt-3 text-3xl font-black text-white">{section.heading}</h2>
              <p className="mt-5 text-base leading-8 text-zinc-300">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
