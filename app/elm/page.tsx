"use client";

import { useMemo, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const PERSONAL_QUESTIONS = [
  { q: "Toma de decisiones en incertidumbre", a: "Espero hasta tener certeza sobre los resultados.", b: "Acepto los riesgos y aprendo del proceso." },
  { q: "Percepción del error", a: "Lo veo como una amenaza a mi reputación.", b: "Lo veo como una oportunidad para aprender." },
  { q: "Mentalidad de ensayo y error", a: "Prefiero seguir procesos seguros y establecidos.", b: "Experimento y me adapto rápidamente." },
  { q: "Autocuidado", a: "No hablo de mis emociones para no parecer débil.", b: "Reconozco y comparto mis emociones." },
  { q: "Pide ayuda", a: "Resuelvo mis problemas solo para demostrar mis habilidades.", b: "Busco apoyo; el liderazgo implica colaboración." },
  { q: "Promover bienestar en el equipo", a: "El bienestar es responsabilidad de cada empleado.", b: "Crear un entorno saludable es prioridad de la empresa." },
  { q: "Reacción ante los problemas", a: "Actúo cuando surgen los problemas.", b: "Me anticipo a los desafíos antes de que surjan." },
  { q: "Explorando nuevas ideas", a: "Me atengo a lo conocido para minimizar riesgos.", b: "Veo la incertidumbre como oportunidad para innovar." },
  { q: "Autoestima y toma de decisiones", a: "Me baso en mi experiencia personal para decidir.", b: "Confío en el conocimiento colectivo para decidir." },
  { q: "Confianza en el equipo", a: "Mantengo el control para asegurar la calidad.", b: "Confío en que el equipo logrará sus resultados." },
  { q: "Colaboración interfuncional", a: "Solo comparto información cuando me la piden.", b: "Comparto información de manera proactiva." },
  { q: "Aprendizaje constante", a: "Ya tengo los conocimientos necesarios para mi puesto.", b: "Busco siempre oportunidades para aprender." },
  { q: "Tutoría y apoyo", a: "Me centro en mi propio desarrollo primero.", b: "Ayudar a los demás es esencial para el éxito colectivo." },
  { q: "Gestión de recursos", a: "Conservo los recursos para necesidades futuras.", b: "Comparto recursos para maximizar su uso." },
  { q: "Competencia vs. Colaboración", a: "Mi equipo alcanza sus objetivos antes de compartir.", b: "Busco sinergias con otros equipos." },
  { q: "Percepción de los recursos", a: "Los recursos son limitados y deben ser conquistados.", b: "Hay recursos suficientes para todos." },
  { q: "Enfoque de la actividad", a: "Me centro en los objetivos internos de mi equipo.", b: "Considero el impacto externo de mis acciones." },
  { q: "Análisis del problema", a: "Analizo primero los factores internos.", b: "Considero factores internos y externos a la vez." },
  { q: "Definición de éxito", a: "Mido el éxito por el logro de objetivos internos.", b: "Mido el éxito por el impacto en clientes y stakeholders." },
  { q: "Retroalimentación externa", a: "Me baso en información interna para decidir.", b: "Incorporo opiniones externas en nuestras estrategias." },
  { q: "Toma de decisiones estratégicas", a: "Las decisiones estratégicas las toma la dirección.", b: "Es importante involucrar a diferentes niveles." },
  { q: "Definición de roles", a: "Cada persona tiene un rol definido por la gerencia.", b: "Los roles son flexibles según las necesidades del proyecto." },
  { q: "Gestión de proyectos", a: "Prefiero estructuras jerárquicas claras.", b: "Prefiero enfoques ágiles y colaborativos." },
  { q: "Relaciones con otros equipos", a: "Mi equipo logra sus objetivos antes de colaborar.", b: "Creo valor interfuncional de forma continua." },
  { q: "Colaboración con competidores", a: "Lo hago todo internamente con mis socios.", b: "Estoy abierto a colaborar con la competencia." },
  { q: "Reacción ante problemas (proactividad)", a: "Actúo cuando el problema ya se ha manifestado.", b: "Anticipo problemas y tomo medidas preventivas." },
  { q: "Identificación de oportunidades", a: "Dedico mi tiempo a resolver problemas internos.", b: "Dedico mi tiempo a explorar el mercado objetivo." },
];

const ORG_QUESTIONS = [
  "La organización promueve el liderazgo basado en el reconocimiento colectivo.",
  "La organización fomenta la participación colaborativa en la toma de decisiones.",
  "La organización promueve la innovación y el intraemprendimiento.",
  "Se fomenta la colaboración y el intercambio de recursos entre equipos.",
  "Los procesos internos están orientados a crear valor en el mercado.",
  "Se valoran y utilizan las opiniones de clientes y partes interesadas.",
  "La organización promueve una estructura flexible y colaborativa.",
  "Las personas pueden tomar decisiones fuera de su ámbito de especialización.",
  "Existe una cultura de colaboración interfuncional en la organización.",
  "La organización está abierta a cooperar con otras empresas del sector.",
  "La organización anticipa los desafíos y toma medidas proactivas.",
  "La organización dedica esfuerzos continuos a explorar nuevas oportunidades de mercado.",
];

// ─── Profile logic — sin connotación bueno/malo ───────────────────────────

const PERSONAL_PROFILES = [
  { min: 0.72, label: "Ecosystem Mindset", desc: "Tu centro de gravedad está claramente orientado al ecosistema. Colaboras, compartes, te anticipas y confías en el colectivo como motor de impacto." },
  { min: 0.45, label: "Mindset in Motion", desc: "Tu perfil integra elementos de ambos extremos del espectro. Hay tensiones productivas en ti que, bien gestionadas, generan liderazgo robusto." },
  { min: 0,    label: "Individual Mindset", desc: "Tu centro de gravedad es más individual y jerárquico. No es mejor ni peor — es un punto de partida claro desde el que crecer en complejidad sistémica." },
];

const ORG_PROFILES = [
  { min: 0.72, label: "Ecosystem Organization", desc: "Tu organización opera desde una lógica de ecosistema: promueve la colaboración, la autonomía y la orientación continua al mercado." },
  { min: 0.45, label: "Organization in Transition", desc: "Tu organización tiene impulsos hacia el ecosistema, pero convive con estructuras más tradicionales. Es un momento de transformación activa." },
  { min: 0,    label: "Traditional Organization", desc: "Tu organización opera desde un modelo más controlado y jerárquico. Eso define el contexto en el que lideras." },
];

function getProfile(score: number, total: number, profiles: typeof PERSONAL_PROFILES) {
  const pct = score / total;
  return profiles.find((p) => pct >= p.min)!;
}

// ─── Slider component ────────────────────────────────────────────────────────

function SliderQuestion({
  index, label, optionA, optionB, value, max, onChange,
}: {
  index: number; label: string; optionA: string; optionB?: string;
  value: number | null; max: number; onChange: (v: number) => void;
}) {
  const answered = value !== null;
  const pct = answered ? ((value! - 1) / (max - 1)) * 100 : 50;
  const mid = Math.ceil(max / 2);

  return (
    <div
      className="rounded-[1.5rem] border transition-all duration-200"
      style={{
        borderColor: answered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)",
        backgroundColor: answered ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
      }}
    >
      <div className="p-5 pb-4">
        {/* Número + título */}
        <div className="mb-4 flex items-start gap-3">
          <span className="mt-0.5 shrink-0 font-mono text-xs" style={{ color: "#FF3030" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-sm font-black uppercase tracking-wide" style={{ color: "#F0F0F0" }}>
            {label}
          </span>
          {answered && (
            <span className="ml-auto shrink-0 text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
              {value}/{max}
            </span>
          )}
        </div>

        {/* A / B labels */}
        {optionB ? (
          <div className="mb-5 grid grid-cols-2 gap-2">
            {/* A card — brighter when slider is in the left half */}
            <div
              className="rounded-xl p-3 text-xs leading-5 transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                color: answered && pct < 50 ? "#F0F0F0" : "rgba(240,240,240,0.28)",
                backgroundColor: answered && pct < 50 ? "rgba(255,255,255,0.05)" : "transparent",
              }}
            >
              <span className="font-black" style={{ color: "rgba(255,255,255,0.35)" }}>A · </span>{optionA}
            </div>
            {/* B card — brighter when slider is in the right half */}
            <div
              className="rounded-xl p-3 text-xs leading-5 transition-all duration-200"
              style={{
                border: "1px solid rgba(255,255,255,0.06)",
                color: answered && pct >= 50 ? "#F0F0F0" : "rgba(240,240,240,0.28)",
                backgroundColor: answered && pct >= 50 ? "rgba(255,255,255,0.05)" : "transparent",
              }}
            >
              <span className="font-black" style={{ color: "rgba(255,255,255,0.35)" }}>B · </span>{optionB}
            </div>
          </div>
        ) : (
          <div className="mb-3 flex justify-between text-xs" style={{ color: "#52525b" }}>
            <span>En desacuerdo</span>
            <span>Totalmente de acuerdo</span>
          </div>
        )}

        {/* Slider — dial / position meter */}
        <div className="relative px-1">
          {/* Track: flat neutral rail with a centre notch */}
          <div className="relative">
            {/* Rail */}
            <div
              className="absolute left-1 right-1 top-1/2 h-[2px] -translate-y-1/2 rounded-full"
              style={{ backgroundColor: answered ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)" }}
            />
            {/* Centre tick mark */}
            <div
              className="absolute top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2"
              style={{ left: "50%", backgroundColor: "rgba(255,255,255,0.12)" }}
            />
          </div>

          <input
            type="range"
            min={1}
            max={max}
            step={1}
            value={value ?? mid}
            onChange={(e) => onChange(Number(e.target.value))}
            onMouseDown={() => { if (value === null) onChange(mid); }}
            onTouchStart={() => { if (value === null) onChange(mid); }}
            className="relative h-8 w-full cursor-pointer appearance-none bg-transparent
              [&::-webkit-slider-thumb]:h-[22px]
              [&::-webkit-slider-thumb]:w-[22px]
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(255,255,255,0.3),0_0_14px_rgba(255,255,255,0.25),0_2px_6px_rgba(0,0,0,0.6)]
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-100
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:h-[22px]
              [&::-moz-range-thumb]:w-[22px]
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border-0
              [&::-moz-range-thumb]:bg-white"
          />

          {/* Position labels */}
          {optionB ? (
            <div className="mt-0.5 flex justify-between px-0.5 text-[9px] font-black uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.18)" }}>
              <span>← A</span>
              {!answered && <span className="text-center" style={{ color: "rgba(255,255,255,0.1)" }}>mueve el slider</span>}
              <span>B →</span>
            </div>
          ) : (
            <div className="mt-0.5 flex justify-between px-0.5">
              {Array.from({ length: max }, (_, i) => (
                <span
                  key={i}
                  className="text-[9px] font-black transition-colors"
                  style={{ color: value === i + 1 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.1)" }}
                >
                  {i + 1}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────

function ResultsView({
  name, personalScore, personalMax, orgScore, orgMax,
  personalAnswers, onReset,
}: {
  name: string; personalScore: number; personalMax: number;
  orgScore: number; orgMax: number;
  personalAnswers: Record<number, number | null>;
  onReset: () => void;
}) {
  const pProfile = getProfile(personalScore, personalMax, PERSONAL_PROFILES);
  const oProfile = getProfile(orgScore, orgMax, ORG_PROFILES);
  const pPct = Math.round((personalScore / personalMax) * 100);
  const oPct = Math.round((orgScore / orgMax) * 100);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1F1D1D", color: "#F0F0F0" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at top left, rgba(255,48,48,0.12), transparent 45%)" }} />
      <div className="relative mx-auto max-w-3xl px-6 py-14">
        <a href="/" className="text-xs transition-colors" style={{ color: "#52525b" }}>← Volver al programa</a>

        {/* Hero resultado */}
        <div className="mt-10 border-b pb-10" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: "#FF3030" }}>ELM Survey · Tu perfil</div>
          <h1 className="mt-3 text-5xl font-black uppercase leading-tight sm:text-6xl" style={{ fontFamily: "Anton, sans-serif", letterSpacing: "-0.01em" }}>
            {name || "Ecosystem<br/>Leaders<br/>Mindset"}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#52525b" }}>Innovative Launches in Pharma · Barcelona 2026</p>
        </div>

        {/* Dos perfiles */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            { label: "Perfil personal", profile: pProfile, score: personalScore, max: personalMax, pct: pPct },
            { label: "Perfil organizacional", profile: oProfile, score: orgScore, max: orgMax, pct: oPct },
          ].map(({ label, profile, score, max, pct }) => (
            <div key={label} className="rounded-[2rem] p-6" style={{ border: "1px solid rgba(255,48,48,0.25)", backgroundColor: "rgba(255,48,48,0.04)" }}>
              <div className="text-xs font-black uppercase tracking-[0.22em]" style={{ color: "#52525b" }}>{label}</div>
              <div className="mt-2 text-2xl font-black uppercase" style={{ color: "#FF3030", fontFamily: "Anton, sans-serif" }}>{profile.label}</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-black" style={{ color: "#F0F0F0" }}>{score}</span>
                <span className="mb-1.5 text-sm" style={{ color: "#52525b" }}>/ {max}</span>
              </div>
              {/* Spectrum position indicator */}
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-[10px] font-black uppercase tracking-[0.1em]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  <span>Individual</span>
                  <span>Ecosystem</span>
                </div>
                <div className="relative h-5">
                  {/* Rail */}
                  <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                  {/* Marker dot */}
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{
                      left: `${pct}%`,
                      backgroundColor: "#FF3030",
                      boxShadow: "0 0 0 3px rgba(255,48,48,0.2), 0 0 12px rgba(255,48,48,0.4)",
                    }}
                  />
                </div>
                <div className="mt-1 text-center text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                  posición {pct}%
                </div>
              </div>
              <p className="mt-4 text-sm leading-7" style={{ color: "rgba(240,240,240,0.6)" }}>{profile.desc}</p>
            </div>
          ))}
        </div>

        {/* Detalle personal */}
        <div className="mt-6 rounded-[2rem] p-6" style={{ border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <div className="mb-5 text-xs font-black uppercase tracking-[0.22em]" style={{ color: "#52525b" }}>Detalle · 27 preguntas personales</div>
          <div className="space-y-2">
            {PERSONAL_QUESTIONS.map((q, i) => {
              const val = (personalAnswers[i] as number) ?? 0;
              const pct = ((val - 1) / 5) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-right text-xs font-mono" style={{ color: "#FF3030" }}>{i + 1}</span>
                  <span className="flex-1 truncate text-xs" style={{ color: "rgba(240,240,240,0.5)" }}>{q.q}</span>
                  <div className="relative w-20 shrink-0">
                    <div className="h-[2px] rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
                    <div
                      className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{ left: `${pct}%`, backgroundColor: "#FF3030" }}
                    />
                  </div>
                  <span className="w-4 shrink-0 text-right text-xs font-black" style={{ color: "#FF3030" }}>{val}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onReset}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(240,240,240,0.5)" }}
          >
            ↺ Repetir
          </button>
          <a
            href="/"
            className="rounded-xl px-5 py-2.5 text-sm font-black text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "#FF3030" }}
          >
            Volver al programa →
          </a>
        </div>
      </div>
    </main>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ELMPage() {
  const [personalAnswers, setPersonalAnswers] = useState<Record<number, number | null>>({});
  const [orgAnswers, setOrgAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");

  const answeredPersonal = Object.values(personalAnswers).filter((v) => v !== null).length;
  const answeredOrg = Object.values(orgAnswers).filter((v) => v !== null).length;
  const allComplete = answeredPersonal === PERSONAL_QUESTIONS.length && answeredOrg === ORG_QUESTIONS.length;
  const totalProgress = ((answeredPersonal + answeredOrg) / (PERSONAL_QUESTIONS.length + ORG_QUESTIONS.length)) * 100;

  const personalScore = useMemo(() => Object.values(personalAnswers).reduce<number>((a, b) => a + (b ?? 0), 0), [personalAnswers]);
  const orgScore = useMemo(() => Object.values(orgAnswers).reduce<number>((a, b) => a + (b ?? 0), 0), [orgAnswers]);

  if (submitted) {
    return (
      <ResultsView
        name={name}
        personalScore={personalScore}
        personalMax={PERSONAL_QUESTIONS.length * 6}
        orgScore={orgScore}
        orgMax={ORG_QUESTIONS.length * 10}
        personalAnswers={personalAnswers}
        onReset={() => { setSubmitted(false); setPersonalAnswers({}); setOrgAnswers({}); setName(""); }}
      />
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#1F1D1D", color: "#F0F0F0" }}>
      {/* Progress bar fixed top */}
      <div className="fixed left-0 right-0 top-0 z-50 h-[3px]" style={{ backgroundColor: "#2a2a2a" }}>
        <div className="h-full transition-all duration-300" style={{ width: `${totalProgress}%`, backgroundColor: "#FF3030" }} />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-12">
        <a href="/" className="text-xs transition-colors" style={{ color: "#52525b" }}>← Volver al programa</a>

        {/* Header */}
        <div className="mt-6 border-b pb-8" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="text-xs font-black uppercase tracking-[0.3em]" style={{ color: "#FF3030" }}>Leadership House · ELM</div>
          <h1 className="mt-3 text-5xl font-black uppercase leading-tight sm:text-6xl" style={{ fontFamily: "Anton, sans-serif" }}>
            Ecosystem<br />Leaders<br />Mindset
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7" style={{ color: "rgba(240,240,240,0.5)" }}>
            Mueve el slider hacia A o hacia B según con qué opción te identificas más. No hay respuestas correctas ni incorrectas — solo tu posición en el espectro.
          </p>
          <div className="mt-6">
            <label className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: "#52525b" }}>Tu nombre (opcional)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              className="mt-2 w-full max-w-sm rounded-xl px-4 py-2.5 text-sm font-semibold text-white outline-none transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}
            />
          </div>
        </div>

        {/* PARTE 1 */}
        <div className="mt-10">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-[0.12em]" style={{ color: "#FF3030" }}>Parte 1 · Perfil Personal</h2>
            <span className="text-xs font-black" style={{ color: "#52525b" }}>{answeredPersonal}/{PERSONAL_QUESTIONS.length}</span>
          </div>
          <p className="mb-6 text-xs" style={{ color: "#52525b" }}>27 preguntas · escala 1 (más A) → 6 (más B)</p>
          <div className="space-y-3">
            {PERSONAL_QUESTIONS.map((q, i) => (
              <SliderQuestion
                key={i} index={i} label={q.q} optionA={q.a} optionB={q.b}
                value={personalAnswers[i] ?? null} max={6}
                onChange={(v) => setPersonalAnswers((prev) => ({ ...prev, [i]: v }))}
              />
            ))}
          </div>
        </div>

        {/* PARTE 2 */}
        <div className="mt-12">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-[0.12em]" style={{ color: "#FF3030" }}>Parte 2 · Evaluación Organizacional</h2>
            <span className="text-xs font-black" style={{ color: "#52525b" }}>{answeredOrg}/{ORG_QUESTIONS.length}</span>
          </div>
          <p className="mb-6 text-xs" style={{ color: "#52525b" }}>12 preguntas · 1 = totalmente en desacuerdo · 10 = totalmente de acuerdo</p>
          <div className="space-y-3">
            {ORG_QUESTIONS.map((q, i) => (
              <SliderQuestion
                key={i} index={i} label={q} optionA={q}
                value={orgAnswers[i] ?? null} max={10}
                onChange={(v) => setOrgAnswers((prev) => ({ ...prev, [i]: v }))}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-10 rounded-[2rem] p-6" style={{ border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black uppercase" style={{ color: allComplete ? "#F0F0F0" : "rgba(240,240,240,0.4)" }}>
                {allComplete ? "Listo para ver tu perfil" : `${PERSONAL_QUESTIONS.length + ORG_QUESTIONS.length - answeredPersonal - answeredOrg} preguntas pendientes`}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: "#52525b" }}>
                Personal {answeredPersonal}/{PERSONAL_QUESTIONS.length} · Org {answeredOrg}/{ORG_QUESTIONS.length}
              </div>
            </div>
            <button
              disabled={!allComplete}
              onClick={() => setSubmitted(true)}
              className="rounded-xl px-6 py-3 text-sm font-black text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              style={{ backgroundColor: "#FF3030" }}
            >
              Ver mi perfil ELM →
            </button>
          </div>
          <div className="mt-4 h-[3px] overflow-hidden rounded-full" style={{ backgroundColor: "#2a2a2a" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${totalProgress}%`, backgroundColor: "#FF3030" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
