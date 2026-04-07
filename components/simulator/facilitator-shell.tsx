"use client";

import { useEffect, useMemo, useState } from "react";
import { Flag, MessageSquare, Sparkles, Trophy, Users, Wallet } from "lucide-react";
import { applySelections } from "@/lib/engine";
import { YEARS, YEAR_LABELS } from "@/lib/constants";
import { YearSelections } from "@/lib/types";



const TEAM_COLORS: Record<string, string> = {
  orlando: "bg-emerald-400",
  atlas: "bg-amber-400",
  blue: "bg-sky-400"
};

const STORAGE_PREFIX = "cefalix:v2";

function formatMoneyM(value: number) {
  return `€${(value / 1000000).toFixed(1)}M`;
}

function timelineIndexForYear(year: number) {
  if (year <= 2017) return 0;
  if (year === 2018) return 1;
  if (year === 2019) return 2;
  return 3;
}

function emptySelections(): YearSelections {
  return { 2017: [], 2018: [], 2019: [], 2020: [] };
}

export function FacilitatorShell({ sessionCode }: { sessionCode: string }) {
  type TeamRow = {
    id: string;
    team: string;
    timestamp: string;
    pnl2020: number;
    pnl2021: number;
    finalPrice: number;
    pool2020: number;
    timeline: Array<{
      yearLabel: string;
      budget: string;
      readiness: string;
      patients: string;
      share: string;
      actions: string;
      notes: string[];
    }>;
    currentYear: number;
    activeReadiness: number;
    activeShare: number;
    activePatients: number;
    activeActions: number;
    decision2019Pop: string | null;
    decision2019Price: string | null;
    decision2019ProposedPrice: string | null;
  };
  type StudentMessage = {
    target: string;
    note: string;
    year: number;
    team?: string;
    teamId?: string;
    timestamp?: string;
  };
  const [unlockedYear, setUnlockedYear] = useState(2017);
  const [activeEvents, setActiveEvents] = useState<string[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageTarget, setMessageTarget] = useState("Enviar a todo el grupo");
  const [messageYear, setMessageYear] = useState("2019");
  const [sentStatus, setSentStatus] = useState("");
  const [messages, setMessages] = useState<{ title: string; target: string; body: string; meta: string }[]>([]);
  const [studentMessages, setStudentMessages] = useState<StudentMessage[]>([]);
  const [caseClosed, setCaseClosed] = useState(false);
  const [teamRows, setTeamRows] = useState<TeamRow[]>([]);
  const storageKey = (...parts: string[]) => `${STORAGE_PREFIX}:${sessionCode}:${parts.join(":")}`;

  const selectedTeam = teamRows.find((team) => team.id === selectedTeamId) || teamRows[0] || {
    id: "empty",
    team: "Sin datos",
    timestamp: "",
    pnl2020: 0,
    pnl2021: 0,
    finalPrice: 0,
    pool2020: 0,
    timeline: [],
    currentYear: unlockedYear,
    activeReadiness: 0,
    activeShare: 0,
    activePatients: 0,
    activeActions: 0
  };
  const leader = useMemo(
    () => [...teamRows].sort((a, b) => b.activeShare - a.activeShare)[0],
    [teamRows]
  );
  const bestMargin = useMemo(
    () => [...teamRows].sort((a, b) => b.pnl2021 - a.pnl2021)[0],
    [teamRows]
  );
  const groupedStudentMessages = useMemo(() => {
    const groups = new Map<string, StudentMessage[]>();
    studentMessages.forEach((message) => {
      const key = message.teamId || "unknown";
      const existing = groups.get(key) || [];
      existing.push(message);
      groups.set(key, existing);
    });
    return Array.from(groups.entries());
  }, [studentMessages]);

  useEffect(() => {
    function buildTeamRows(year: number): TeamRow[] {
      const activeIndex = timelineIndexForYear(year);
      const prefix = storageKey("teamName") + ":";
      const teamIds: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          teamIds.push(key.slice(prefix.length));
        }
      }
      return teamIds.map((teamId) => {
        const rawSelections = window.localStorage.getItem(storageKey("selections", teamId));
        const selections: YearSelections = rawSelections ? JSON.parse(rawSelections) : emptySelections();
        const teamName = window.localStorage.getItem(storageKey("teamName", teamId)) || teamId;
        const finalSim = applySelections(selections);
        const timeline = YEARS.map((timelineYear) => {
          const partialSelections = YEARS.reduce<YearSelections>((acc, currentYear) => {
            acc[currentYear] = currentYear <= timelineYear ? selections[currentYear] || [] : [];
            return acc;
          }, emptySelections());
          const partialSim = applySelections(partialSelections);
          return {
            yearLabel: YEAR_LABELS[timelineYear],
            budget: `€${partialSim.summaries[timelineYear].totalCost.toLocaleString("es-ES")}`,
            readiness: `${partialSim.launchReadiness}/100`,
            patients: String(partialSim.newPatients2020),
            share: `${partialSim.share2020}%`,
            actions: String(partialSim.summaries[timelineYear].selections.length),
            notes: partialSim.summaries[timelineYear].notes
          };
        });
        const activeTimeline = timeline[activeIndex];
        return {
          id: teamId,
          team: teamName,
          timestamp: new Date().toLocaleString("es-ES"),
          pnl2020: finalSim.pnl[2020].grossMargin,
          pnl2021: finalSim.pnl[2021].grossMargin,
          finalPrice: finalSim.priceOutcome,
          pool2020: finalSim.patientPoolAccessed,
          timeline,
          currentYear: year,
          activeReadiness: Number(activeTimeline.readiness.split("/")[0]),
          activeShare: Number(activeTimeline.share.replace("%", "")),
          activePatients: Number(activeTimeline.patients),
          activeActions: Number(activeTimeline.actions),
          decision2019Pop: window.localStorage.getItem(storageKey("decision2019pop", teamId)),
          decision2019Price: window.localStorage.getItem(storageKey("decision2019price", teamId)),
          decision2019ProposedPrice: window.localStorage.getItem(storageKey("decision2019proposedprice", teamId))
        };
      });
    }

    function refreshFromStorage() {
      const liveUnlockedYear = Number(window.localStorage.getItem(storageKey("unlockedYear")) || "2017");
      setUnlockedYear(liveUnlockedYear);
      setActiveEvents(JSON.parse(window.localStorage.getItem(storageKey("events")) || "[]"));
      setStudentMessages(JSON.parse(window.localStorage.getItem(storageKey("boardroomMessages")) || "[]"));
      setCaseClosed(window.localStorage.getItem(storageKey("caseClosed")) === "true");
      setTeamRows(buildTeamRows(liveUnlockedYear));
    }

    refreshFromStorage();

    function handleStorage(event: StorageEvent) {
      if (event.key === storageKey("unlockedYear")) {
        refreshFromStorage();
      }
      if (event.key === storageKey("events")) {
        refreshFromStorage();
      }
      if (event.key === storageKey("boardroomMessages")) {
        refreshFromStorage();
      }
      if (event.key === storageKey("caseClosed")) {
        refreshFromStorage();
      }
      if (
        event.key?.startsWith(storageKey("selections")) ||
        event.key?.startsWith(storageKey("teamName"))
      ) {
        refreshFromStorage();
      }
    }

    window.addEventListener("storage", handleStorage);
    const interval = window.setInterval(refreshFromStorage, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(interval);
    };
  }, [sessionCode]);

  function unlockYear(year: number) {
    setUnlockedYear(year);
    window.localStorage.setItem(storageKey("unlockedYear"), String(year));
    if (year < 2020) {
      setCaseClosed(false);
      window.localStorage.setItem(storageKey("caseClosed"), "false");
    }
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey("unlockedYear"), newValue: String(year) }));
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey("caseClosed"), newValue: year < 2020 ? "false" : String(caseClosed) }));
  }

  function toggleEvent(year: string) {
    const nextEvents = activeEvents.includes(year)
      ? activeEvents.filter((item) => item !== year)
      : [...activeEvents, year];
    setActiveEvents(nextEvents);
    window.localStorage.setItem(storageKey("events"), JSON.stringify(nextEvents));
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey("events"), newValue: JSON.stringify(nextEvents) }));
  }

  function resetDecisions2019(teamId: string) {
    const keys = [
      storageKey("decision2019pop", teamId),
      storageKey("decision2019price", teamId),
      storageKey("decision2019proposedprice", teamId),
      storageKey("caseLost", teamId)
    ];
    keys.forEach((key) => {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: null }));
    });
  }

  function sendMessage() {
    if (!messageTitle.trim() && !messageBody.trim()) return;

    const nextMessages = [
      {
        title: messageTitle || "Sin título",
        target: messageTarget === "Enviar a todo el grupo" ? "General" : "Personalizado",
        body: messageBody || "Sin contenido",
        meta: `Año ${messageYear} · 5/4/2026, 18:58:00`
      },
      ...messages
    ];
    setMessages(nextMessages);
    const facilitatorPayload = nextMessages.map((message) => ({
      title: message.title,
      body: message.body,
      year: Number(messageYear),
      target: message.target,
      timestamp: new Date().toLocaleString("es-ES")
    }));
    window.localStorage.setItem(storageKey("facilitatorMessages"), JSON.stringify(facilitatorPayload));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: storageKey("facilitatorMessages"),
        newValue: JSON.stringify(facilitatorPayload)
      })
    );
    setSentStatus("Mensaje enviado");
    setMessageTitle("");
    setMessageBody("");
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="absolute inset-0 bg-grid-soft opacity-15" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.14),transparent_28%)]" />

      {/* Nav bar */}
      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-red-500">Facilitador</p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight">Cefalix Launch Simulator</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition-colors">Home</a>
          <a href="/context" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition-colors">Contexto</a>
          <a href="/instructions" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-white/30 hover:text-white transition-colors">Instrucciones</a>
          <a href={`/student/${sessionCode}`} className="rounded-xl border border-red-500/40 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-600/20 transition-colors">Ver como estudiante →</a>
        </div>
      </div>
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-red-500">Facilitator view</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Cefalix Launch Simulator - Barcelona April 2026</h1>
            <p className="mt-4 text-sm text-zinc-400">Año desbloqueado: {unlockedYear}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const keysToRemove: string[] = [];
                for (let index = 0; index < window.localStorage.length; index += 1) {
                  const key = window.localStorage.key(index);
                  if (!key) continue;
                  if (
                    key.startsWith(`${STORAGE_PREFIX}:${sessionCode}:`) ||
                    key === `cefalix:boardroomMessages:${sessionCode}` ||
                    key === `cefalix:facilitatorMessages:${sessionCode}` ||
                    key === `cefalix:events:${sessionCode}` ||
                    key === `cefalix:caseClosed:${sessionCode}` ||
                    key === `cefalix:unlockedYear:${sessionCode}` ||
                    key.startsWith(`cefalix:teamName:${sessionCode}:`) ||
                    key.startsWith(`cefalix:selections:${sessionCode}:`) ||
                    key.startsWith(`cefalix:confirmedYears:${sessionCode}:`)
                  ) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach((key) => window.localStorage.removeItem(key));
                window.localStorage.setItem(storageKey("unlockedYear"), "2017");
                window.dispatchEvent(new StorageEvent("storage", { key: storageKey("unlockedYear"), newValue: "2017" }));
                window.dispatchEvent(new StorageEvent("storage", { key: storageKey("boardroomMessages"), newValue: "[]" }));
                window.dispatchEvent(new StorageEvent("storage", { key: storageKey("facilitatorMessages"), newValue: "[]" }));
                window.dispatchEvent(new StorageEvent("storage", { key: storageKey("events"), newValue: "[]" }));
                window.dispatchEvent(new StorageEvent("storage", { key: storageKey("caseClosed"), newValue: "false" }));
              }}
              className="rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200"
            >
              Reset demo
            </button>
            <button onClick={() => unlockYear(2017)} className="rounded-3xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white">
              Bloquear en 2017
            </button>
            <button onClick={() => unlockYear(2018)} className="rounded-3xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white">
              Desbloquear 2018
            </button>
            <button onClick={() => unlockYear(2019)} className="rounded-3xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white">
              Desbloquear 2019
            </button>
            <button onClick={() => unlockYear(2020)} className="rounded-3xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white">
              Desbloquear 2020
            </button>
            <button onClick={() => toggleEvent("2018")} className="rounded-3xl bg-[#ef2b2b] px-5 py-3 text-sm font-semibold text-white">
              {activeEvents.includes("2018") ? "Quitar evento 2018" : "Activar evento 2018"}
            </button>
            <button onClick={() => toggleEvent("2019-pop")} className={`rounded-3xl px-5 py-3 text-sm font-semibold text-white ${activeEvents.includes("2019-pop") ? "bg-zinc-600" : "bg-[#ef2b2b]"}`}>
              {activeEvents.includes("2019-pop") ? "✓ Población enviado" : "2019 · Evento 1: Restricción población"}
            </button>
            <button onClick={() => toggleEvent("2019-price")} className={`rounded-3xl px-5 py-3 text-sm font-semibold text-white ${activeEvents.includes("2019-price") ? "bg-zinc-600" : "bg-amber-600"}`}>
              {activeEvents.includes("2019-price") ? "✓ Precio enviado" : "2019 · Evento 2: Decisión precio €200"}
            </button>
          </div>
        </div>

        {unlockedYear === 2019 ? (
          <div className="mb-6 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-amber-400">⚡ Checklist facilitador — 2019</div>
            <div className="grid gap-2 text-sm text-amber-200">
              {[
                { key: "step1", done: activeEvents.includes("2019-pop"), label: "Activa Evento 1: Restricción de población → espera a que todos decidan" },
                { key: "step2", done: activeEvents.includes("2019-price"), label: "Activa Evento 2: Decisión de precio €200 → espera respuesta de cada equipo" },
                { key: "step3", done: false, label: "Revisa decisiones por equipo abajo y facilita el debrief" }
              ].map(({ key, done, label }) => (
                <div key={key} className={`flex items-start gap-2 ${done ? "text-emerald-300" : ""}`}>
                  <span className="mt-0.5 shrink-0">{done ? "✓" : "○"}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-8 grid gap-4 lg:grid-cols-4">
          <TopCard title="Equipos activos" value={String(teamRows.length)} sub="" icon={Users} />
          <TopCard title={`Líder cuota ${unlockedYear}`} value={leader ? `${leader.team} · ${leader.activeShare}%` : "Sin datos"} sub="" icon={Trophy} />
          <TopCard title="Mejor margen 2021" value={bestMargin ? formatMoneyM(bestMargin.pnl2021) : "Sin datos"} sub="" icon={Wallet} />
          <TopCard title="Lectura del líder" value={leader ? (caseClosed ? "Caso cerrado por el equipo en 2020." : `${leader.team} lidera por foco y consistencia de ejecución.`) : "Todavía no hay equipos activos."} sub="" compact icon={Sparkles} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-8">
            <Panel title="Panel de equipos">
              <div className="mb-8 grid gap-3 lg:grid-cols-[0.85fr_1.25fr]">
                <div className="text-2xl font-black leading-tight text-white">
                  Lectura rápida del aula
                </div>
                <div className="text-sm leading-7 text-zinc-400">
                  Verde: mejor equipo ahora mismo. Amarillo: zona media. Rojo: necesita atención.
                </div>
              </div>

              <div className="grid grid-cols-6 gap-4 border-b border-white/10 pb-5 text-xs uppercase tracking-[0.24em] text-zinc-400">
                <div>Equipo</div>
                <div>Año</div>
                <div>Readiness</div>
                <div>Share</div>
                <div>Margen 2020</div>
                <div>Margen 2021</div>
              </div>

              <div className="mt-6 space-y-4">
                {teamRows.map((row) => {
                  const selected = row.id === selectedTeamId;
                  return (
                    <button
                      key={row.id}
                      onClick={() => setSelectedTeamId(row.id)}
                      className={`grid w-full grid-cols-6 gap-4 rounded-[1.9rem] border p-6 text-left ${
                        selected
                          ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_0_2px_rgba(52,211,153,0.25)]"
                          : "border-white/10 bg-[#111111]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`h-3 w-3 rounded-full ${TEAM_COLORS[row.id] || "bg-zinc-500"}`} />
                          <div className="text-base font-black text-white">{row.team}</div>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">{row.timestamp}</div>
                      </div>
                      <div className="text-base font-semibold text-zinc-200">{row.currentYear}</div>
                      <div className="text-base font-semibold text-emerald-300">{row.activeReadiness}/100</div>
                      <div className="text-base font-semibold text-emerald-300">{row.activeShare}%</div>
                      <div className="text-base font-semibold text-emerald-300">{formatMoneyM(row.pnl2020)}</div>
                      <div className="text-base font-semibold text-emerald-300">{formatMoneyM(row.pnl2021)}</div>
                    </button>
                  );
                })}
              </div>
            </Panel>

            <Panel title="One-page summary">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="text-2xl font-black text-white">{selectedTeam.team}</div>
                <div className="rounded-full border border-white/10 bg-[#1a1a1a] px-6 py-3 text-base text-zinc-200">
                  Precio final simulado: €{selectedTeam.finalPrice} · Pool 2020: {selectedTeam.pool2020.toLocaleString("es-ES")}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <SummaryMetric title={`Readiness ${unlockedYear}`} value={`${selectedTeam.activeReadiness}/100`} />
                <SummaryMetric title={`Cuota ${unlockedYear}`} value={`${selectedTeam.activeShare}%`} />
                <SummaryMetric title={`Pacientes ${unlockedYear}`} value={String(selectedTeam.activePatients)} />
                <SummaryMetric title="Margen 2021" value={formatMoneyM(selectedTeam.pnl2021)} />
              </div>

              {(selectedTeam.decision2019Pop || selectedTeam.decision2019Price) ? (
                <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-400">Decisiones 2019</div>
                    <button
                      onClick={() => resetDecisions2019(selectedTeam.id)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-zinc-400 hover:border-red-500/40 hover:text-red-400 transition-colors"
                    >
                      ↺ Resetear
                    </button>
                  </div>
                  {selectedTeam.decision2019Pop ? (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-zinc-400">Restricción población:</span>
                      <span className={`font-black ${selectedTeam.decision2019Pop === "accept" ? "text-emerald-400" : "text-red-400"}`}>
                        {selectedTeam.decision2019Pop === "accept" ? "✓ Acepta" : "✗ Rechaza"}
                      </span>
                    </div>
                  ) : null}
                  {selectedTeam.decision2019Price ? (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-zinc-400">Decisión precio:</span>
                      <span className={`font-black ${selectedTeam.decision2019Price === "accept_200" ? "text-emerald-400" : selectedTeam.decision2019Price === "no_launch" ? "text-zinc-500" : "text-red-400"}`}>
                        {selectedTeam.decision2019Price === "accept_200" ? "✓ Acepta €200"
                          : selectedTeam.decision2019Price === "no_launch" ? "— No lanza"
                          : `⚠️ Propone €${selectedTeam.decision2019ProposedPrice} → PIERDE EL CASO`}
                      </span>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                {selectedTeam.timeline.slice(0, timelineIndexForYear(unlockedYear) + 1).map((item) => (
                  <TimelineCard
                    key={item.yearLabel}
                    yearLabel={item.yearLabel}
                    budget={item.budget}
                    readiness={item.readiness}
                    patients={item.patients}
                    share={item.share}
                    actions={item.actions}
                    notes={item.notes}
                  />
                ))}
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel title="Mensajes a alumnos" icon={MessageSquare}>
              <input
                value={messageTitle}
                onChange={(event) => setMessageTitle(event.target.value)}
                placeholder="Título del mensaje"
                className="w-full rounded-[1.3rem] border border-zinc-300 bg-white px-5 py-4 text-xl text-zinc-700 outline-none"
              />
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Escribe aquí el mensaje del ministerio, dirección, pacientes o cualquier stakeholder."
                className="mt-4 min-h-[180px] w-full rounded-[1.3rem] border border-zinc-300 bg-white px-5 py-4 text-lg leading-8 text-zinc-700 outline-none"
              />
              <div className="mt-4 flex gap-4">
                <select
                  value={messageTarget}
                  onChange={(event) => setMessageTarget(event.target.value)}
                  className="w-full rounded-[1.3rem] border border-zinc-300 bg-white px-4 py-4 text-lg text-zinc-700 outline-none"
                >
                  <option>Enviar a todo el grupo</option>
                  <option>Enviar al equipo seleccionado</option>
                </select>
                <select
                  value={messageYear}
                  onChange={(event) => setMessageYear(event.target.value)}
                  className="w-full rounded-[1.3rem] border border-zinc-300 bg-white px-4 py-4 text-lg text-zinc-700 outline-none"
                >
                  <option value="2018">2018</option>
                  <option value="2019">2019</option>
                  <option value="2020">2020</option>
                </select>
              </div>
              <button
                onClick={sendMessage}
                className="mt-5 w-full rounded-[1.3rem] bg-[#ef2b2b] px-6 py-4 text-xl font-semibold text-white"
              >
                Enviar mensaje
              </button>
              {sentStatus ? <div className="mt-3 text-sm font-semibold text-red-400">{sentStatus}</div> : null}
            </Panel>

            <Panel title="Eventos activos" icon={Flag}>
              <div className="space-y-4">
                {activeEvents.length ? activeEvents.map((year) => (
                  <EventCard key={year} year={year} body={`Evento competitivo ${year}`} />
                )) : <div className="rounded-[1.6rem] bg-[#171717] p-5 text-sm text-zinc-400">No hay eventos activos.</div>}
              </div>
            </Panel>

            <Panel title="Últimos mensajes" icon={MessageSquare}>
              <div className="space-y-4">
                {groupedStudentMessages.map(([teamId, teamMessages]) => (
                  <div key={teamId} className="rounded-[1.6rem] bg-[#171717] p-5">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${TEAM_COLORS[teamId] || "bg-zinc-500"}`} />
                      <div className="text-base font-black text-white">
                        {teamMessages[teamMessages.length - 1]?.team || "Equipo sin nombre"}
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {teamMessages
                        .slice()
                        .reverse()
                        .map((message, index) => (
                          <div key={`${teamId}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">
                              {message.target} · Año {message.year} {message.timestamp ? `· ${message.timestamp}` : ""}
                            </div>
                            <div className="mt-2 text-sm leading-7 text-zinc-300">{message.note}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
                {messages.map((message) => (
                  <div key={`${message.title}-${message.meta}`} className="rounded-[1.6rem] bg-[#171717] p-5">
                    <div className="text-base font-black text-white">{message.title}</div>
                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400">{message.target}</div>
                    <div className="mt-3 text-sm leading-7 text-zinc-300">{message.body}</div>
                    <div className="mt-3 text-sm text-zinc-500">{message.meta}</div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Atajos de lectura">
              <div className="space-y-4 text-base leading-8 text-zinc-300">
                <div>Usa los colores del ranking para detectar rápido quién va mejor y quién necesita apoyo.</div>
                <div>Desde aquí ya puedes mandar mensajes generales o personalizados para alterar el contexto del caso.</div>
                <div>El histórico por equipo te enseña qué decisiones hizo cada año y cómo evolucionó su rendimiento.</div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </main>
  );
}

function TopCard({
  title,
  value,
  sub,
  compact = false,
  icon: Icon
}: {
  title: string;
  value: string;
  sub: string;
  compact?: boolean;
  icon?: any;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-zinc-400">
        {Icon ? <Icon className="h-4 w-4 text-red-400" /> : null}
        <span>{title}</span>
      </div>
      <div className={`mt-6 font-black text-white ${compact ? "text-xl leading-8" : "text-3xl"}`}>{value}</div>
      {sub ? <div className="mt-3 text-sm text-zinc-300">{sub}</div> : null}
    </div>
  );
}

function Panel({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#111111] p-8">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-red-500">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span>{title}</span>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function SummaryMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.8rem] bg-[#171717] p-6">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-400">{title}</div>
      <div className="mt-4 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function TimelineCard({
  yearLabel,
  budget,
  readiness,
  patients,
  share,
  actions,
  notes
}: {
  yearLabel: string;
  budget: string;
  readiness: string;
  patients: string;
  share: string;
  actions: string;
  notes: string[];
}) {
  return (
    <div className="rounded-[1.8rem] bg-[#171717] p-6">
      <div className="text-base font-black text-white">{yearLabel}</div>
      <div className="mt-4 space-y-4 text-sm text-zinc-300">
        <ProgressRow label={`Budget gastado: ${budget}`} value={99} color="red" />
        <ProgressRow label={`Readiness: ${readiness}`} value={Number(readiness.split("/")[0])} color={readinessColor(Number(readiness.split("/")[0]))} />
        <ProgressRow label={`Pacientes estimados: ${patients}`} value={Math.min(Math.round(Number(patients) / 40), 100)} color="red" />
        <ProgressRow label={`Cuota estimada: ${share}`} value={Number(share.replace("%", ""))} color={shareColor(Number(share.replace("%", "")))} />
        <div>Acciones activas: {actions}</div>
      </div>
      {notes.length ? (
        <div className="mt-4 space-y-2 text-sm leading-7 text-zinc-400">
          {notes.map((note) => (
            <div key={note}>{note}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProgressRow({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: "red" | "amber" | "green";
}) {
  const barColor =
    color === "green" ? "bg-emerald-400" : color === "amber" ? "bg-amber-400" : "bg-red-500";

  return (
    <div>
      <div className="mb-2">{label}</div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-700">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.max(8, Math.min(value, 100))}%` }} />
      </div>
    </div>
  );
}

function readinessColor(value: number) {
  if (value < 50) return "red";
  if (value <= 70) return "amber";
  return "green";
}

function shareColor(value: number) {
  if (value < 40) return "red";
  if (value <= 49) return "amber";
  return "green";
}

function EventCard({ year, body }: { year: string; body: string }) {
  return (
    <div className="rounded-[1.6rem] bg-[#171717] p-5">
      <div className="text-4xl font-black text-white">{year}</div>
      <div className="mt-2 text-lg text-zinc-300">{body}</div>
    </div>
  );
}
