"use client";

import { useEffect, useMemo, useState } from "react";
import { EcosystemMap } from "@/components/simulator/ecosystem-map";
import { BarChart2, Building2, CheckSquare, Lock, MessageSquare, Target, TrendingUp } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
  ACCESS_SCENARIOS,
  ACTIONS,
  ASSUMPTIONS,
  BUDGETS,
  CASE_NARRATIVE,
  MARKET_BASELINE,
  SCENARIO_EVOLUTION,
  YEAR_LABELS,
  YEARS
} from "@/lib/constants";
import { applySelections, selectionCost } from "@/lib/engine";
import { Action, Level, Phase, YearSelections } from "@/lib/types";
import { ActionCard } from "@/components/simulator/action-card";
import { ShareBars } from "@/components/simulator/share-bars";
import { getSessionState, upsertStudentState } from "@/lib/session-state";
import { subscribeToSessionState } from "@/lib/session-realtime";

const GENERAL_INSTRUCTIONS = [
  "Eres Eva, directora de la unidad de negocio de Cefalix en España.",
  "El caso avanza año a año y no muestra el futuro por adelantado.",
  "Primero entiendes el contexto del año, luego revisas los key data, eliges actividades y cierras con Boardroom.",
  "Tu éxito no se medirá solo por cuota: también importan acceso, sostenibilidad, confianza, preparación y atractivo del launch."
];

const YEAR_STARTING_SETUP: Record<number, { access: string; pool: string; note: string }> = {
  2017: {
    access: "La ambición es amplia: reembolso finales 2019 y una indicación >4MMD.",
    pool: "Se trabaja con una visión de mercado amplia, todavía sin una restricción severa del pool.",
    note: "Se cree en una ventaja competitiva clara, una posición first mover y un escenario 100% especialista con opción remota de GP."
  },
  2018: {
    access: "Europa aprueba, pero España se mueve ya a un mercado 100% especialista y aparecen señales de >8MMD.",
    pool: "Todavía no cae del todo el volumen, pero el equipo entiende que la lectura inicial era demasiado optimista.",
    note: "La hipótesis de GP cae. El acceso sigue vivo, pero mucho más condicionado que en 2017."
  },
  2019: {
    access: "La negociación se vuelve extrema: >8MMD, 100% neurólogos y decisión dura sobre precio.",
    pool: "El potencial del mercado se estrecha drásticamente y el volumen cambia de orden de magnitud.",
    note: "Este es el año de verdad: lanzar o no lanzar se convierte en la decisión central."
  },
  2020: {
    access: "El acceso ya está fijado. En 2020 solo queda ejecutar el launch bajo las condiciones cerradas.",
    pool: "El punto de partida ya es el mercado real que el equipo consiguió preservar en la negociación previa.",
    note: "En 2020 ya no se modifica acceso; solo se ejecuta y se protege el launch."
  }
};

const FACILITATOR_MESSAGES: Partial<Record<number, string>> = {
  2018:
    "Europa aprueba en junio de 2018. España mantiene la aspiración amplia, pero ya cae la hipótesis de GP y el mercado apunta a un enfoque 100% especialista. Global autoriza bajar hasta un 40%, mientras el Ministerio parece querer ir más lejos.",
  2019:
    "España restringe el producto a >8MMD +3TF, la negociación se vuelve a tres bandas y el Ministerio pide una reducción del 60%. El equipo debe decidir si solicita más concesión a Global o si no lanza."
};

const YEAR_SCENARIO_SUMMARY: Record<
  number,
  { launchTiming: string; label: string; price: string; channel: string; prescriber: string }
> = {
  2017: {
    launchTiming: "Reembolso finales 2019",
    label: ">4MMD",
    price: "500€ → 350€",
    channel: "GP o Hospital",
    prescriber: "Neuro 100% como base de trabajo"
  },
  2018: {
    launchTiming: "Reembolso finales 2019",
    label: ">8MMD",
    price: "500€ → 300€",
    channel: "Hospital",
    prescriber: "Neuro 100%"
  },
  2019: {
    launchTiming: "Reembolso enero 2020",
    label: ">8MMD",
    price: "500€ → 300€ →X",
    channel: "Hospital",
    prescriber: "Neuro 100%"
  },
  2020: {
    launchTiming: "Lanzamiento enero 2020",
    label: ">8MMD",
    price: "Precio ya cerrado",
    channel: "Hospital",
    prescriber: "Neuro 100%"
  }
};

const YEAR_PRICE_GUARDRAILS: Record<number, { target: number; authorized: number; ministryAsk?: number; note: string }> = {
  2017: {
    target: 500,
    authorized: 350,
    note: "En 2017 el objetivo sigue siendo 500€, pero Global solo autoriza defender hasta 350€."
  },
  2018: {
    target: 500,
    authorized: 300,
    note: "En 2018 Global amplía la autorización hasta un 40% de descuento para acelerar acceso."
  },
  2019: {
    target: 500,
    authorized: 300,
    ministryAsk: 200,
    note: "En 2019 el Ministerio pide un 60% de descuento. Ese nivel no está aprobado todavía."
  },
  2020: {
    target: 500,
    authorized: 300,
    ministryAsk: 200,
    note: "El launch 2020 dependerá del precio que el equipo haya sido capaz de defender o aceptar."
  }
};

const STORAGE_PREFIX = "cefalix:v2";

function normalizePhase(value?: string): Phase {
  if (value === "context" || value === "preread" || value === "simulator" || value === "summary" || value === "review" || value === "ecosystem") {
    return value;
  }
  return "context";
}

function findSelection(selections: YearSelections, year: number, actionId: string) {
  return (selections[year] || []).find((selection) => selection.actionId === actionId) || null;
}

function inheritedSelection(
  selections: YearSelections,
  confirmedYears: number[],
  year: number,
  action: Action
) {
  const yearIndex = YEARS.indexOf(year as (typeof YEARS)[number]);
  for (let index = yearIndex - 1; index >= 0; index -= 1) {
    const previousYear = YEARS[index];
    if (!confirmedYears.includes(previousYear)) continue;
    const previousSelection = findSelection(selections, previousYear, action.id);
    if (previousSelection) return previousSelection;
  }
  return null;
}

function effectiveSelection(
  selections: YearSelections,
  confirmedYears: number[],
  year: number,
  action: Action
) {
  const current = findSelection(selections, year, action.id);
  if (current) return { selection: current, inherited: false };
  if (action.kind === "persistent_team" || action.kind === "persistent_program") {
    const inherited = inheritedSelection(selections, confirmedYears, year, action);
    if (inherited) return { selection: inherited, inherited: true };
  }
  return { selection: null, inherited: false };
}

export function StudentShell({
  sessionCode,
  initialPhase,
  initialTeam
}: {
  sessionCode: string;
  initialPhase?: string;
  initialTeam?: string;
}) {
  type StudentMessage = {
    target: string;
    note: string;
    year: number;
    team?: string;
    teamId?: string;
    timestamp?: string;
  };
  type FacilitatorMessage = {
    title: string;
    body: string;
    year: number;
    target: string;
    timestamp?: string;
  };

  const [phase, setPhase] = useState<Phase>(normalizePhase(initialPhase));
  const [teamName, setTeamName] = useState(
    initialTeam === "atlas" ? "ATLAS" : initialTeam === "blue" ? "BLUE" : initialTeam === "orlando" ? "ORLANDO" : ""
  );
  const [currentYearIndex, setCurrentYearIndex] = useState(0);
  const [unlockedYearIndex, setUnlockedYearIndex] = useState(0);
  const [discountSlider, setDiscountSlider] = useState(0);
  const [openAction, setOpenAction] = useState<Action | null>(null);
  const [boardroomNotes, setBoardroomNotes] = useState("");
  const [boardroomStatus, setBoardroomStatus] = useState("");
  const [launchClosed, setLaunchClosed] = useState(false);
  const [facilitatorEvents, setFacilitatorEvents] = useState<string[]>([]);
  const [boardroomMessages, setBoardroomMessages] = useState<StudentMessage[]>([]);
  const [facilitatorMessages, setFacilitatorMessages] = useState<FacilitatorMessage[]>([]);
  const [showFacilitatorMessages, setShowFacilitatorMessages] = useState(false);
  const [decision2019Pop, setDecision2019Pop] = useState<"accept" | "reject" | null>(null);
  const [decision2019Price, setDecision2019Price] = useState<"accept_200" | "propose" | "no_launch" | null>(null);
  const [decision2019ProposedPrice, setDecision2019ProposedPrice] = useState("");
  const [caseLost, setCaseLost] = useState(false);
  const [confirmedYears, setConfirmedYears] = useState<number[]>([]);
  const [teamKey, setTeamKey] = useState("");
  const [registrationState, setRegistrationState] = useState<"loading" | "done" | "pending">("loading");
  const [registrationInput, setRegistrationInput] = useState("");
  const [isHydratingFromSupabase, setIsHydratingFromSupabase] = useState(true);
  const [syncError, setSyncError] = useState("");
  const [selections, setSelections] = useState<YearSelections>({
    2017: [],
    2018: [],
    2019: [],
    2020: []
  });
  const storageBase = `${STORAGE_PREFIX}:${sessionCode}`;
  const myTeamKeyStorageKey = `${storageBase}:myTeamKey`;
  const teamNameKey = `${storageBase}:teamName:${teamKey}`;
  const selectionsKey = `${storageBase}:selections:${teamKey}`;
  const confirmedYearsKey = `${storageBase}:confirmedYears:${teamKey}`;
  const unlockedYearKey = `${storageBase}:unlockedYear`;
  const eventsKey = `${storageBase}:events`;
  const boardroomMessagesKey = `${storageBase}:boardroomMessages`;
  const facilitatorMessagesKey = `${storageBase}:facilitatorMessages`;
  const caseClosedKey = `${storageBase}:caseClosed`;
  const decision2019PopKey = `${storageBase}:decision2019pop:${teamKey}`;
  const decision2019PriceKey = `${storageBase}:decision2019price:${teamKey}`;
  const decision2019ProposedPriceKey = `${storageBase}:decision2019proposedprice:${teamKey}`;
  const caseLostKey = `${storageBase}:caseLost:${teamKey}`;

  const currentYear = YEARS[currentYearIndex];
  const sim = useMemo(() => applySelections(selections), [selections]);
  const currentSummary = sim.summaries[currentYear];
  const remainingBudget = BUDGETS[currentYear] - currentSummary.totalCost;
  const currentNarrative = CASE_NARRATIVE[currentYear];
  const baselineYear = currentYear < 2019 ? 2019 : currentYear;
  const baselineMarket = MARKET_BASELINE[baselineYear as keyof typeof MARKET_BASELINE];
  const accessScenario = ACCESS_SCENARIOS[SCENARIO_EVOLUTION[currentYear]];
  const currentProjection = accessScenario.timeline[baselineYear as keyof typeof accessScenario.timeline];
  const phaseOrder: Phase[] = ["context", "preread", "simulator", "review", "ecosystem"];
  const phaseIndex = phaseOrder.indexOf(phase);
  const yearIsConfirmed = confirmedYears.includes(currentYear);
  const priceGuardrail = YEAR_PRICE_GUARDRAILS[currentYear];
  const maxDiscount = currentYear === 2017 ? 30 : currentYear === 2018 ? 40 : 60;

  const pendingDecision2019 =
    currentYear === 2019 &&
    ((facilitatorEvents.includes("2019-pop") && !decision2019Pop) ||
      (facilitatorEvents.includes("2019-price") && !decision2019Price));

  const simulatedDiscountPrice = Math.round(ASSUMPTIONS.targetPrice * (1 - discountSlider / 100));
  const illustrativeShareShift = Math.round((discountSlider / 30) * 3);
  const illustrativeRevenueFactor = simulatedDiscountPrice / ASSUMPTIONS.targetPrice;
  const keyDataScenario = currentYear === 2017 ? ACCESS_SCENARIOS.broad_4MMD_GP_SPEC : ACCESS_SCENARIOS.restricted_8MMD_3TF;
  const keyDataTimeline = [2019, 2020, 2021, 2022, 2023].map((year) => {
    const market = MARKET_BASELINE[year as keyof typeof MARKET_BASELINE];
    const scenarioRow = keyDataScenario.timeline[year as keyof typeof keyDataScenario.timeline];
    return {
      year,
      population: market.population_18_65,
      prevalence: market.prevalence,
      consultingPatients: market.consultingPatients,
      diagnosedPatients: market.diagnosedPatients,
      visitedByNeurologists: market.visitedByNeurologists,
      prophylacticTreated: market.prophylacticTreated,
      scenarioPatients: scenarioRow.eligiblePatients,
      dynamicPatients: scenarioRow.dynamicPatients,
      patientsOnACGRP: scenarioRow.patientsOnACGRP,
      acgrpCount:
        currentYear === 2017
          ? year === 2019 ? 2 : year === 2020 ? 3 : year === 2021 ? 4 : year === 2022 ? 5 : 6
          : year === 2019 ? 3 : year === 2020 ? 3 : year === 2021 ? 4 : year === 2022 ? 5 : 6,
      expectedShare: scenarioRow.expectedShare,
      cefalixNewPatients: scenarioRow.cefalixNewPatients,
      cefalixTotalPatients: scenarioRow.cefalixTotalPatients,
      dosage: year === 2019 ? 2 : 7,
      netPrice: simulatedDiscountPrice,
      netSales: Math.round(scenarioRow.netSales * (simulatedDiscountPrice / 350))
    };
  });
  const studentTimeline = YEARS.filter((year) => year <= currentYear).map((year) => {
    const partialSelections = YEARS.reduce<YearSelections>((acc, current) => {
      acc[current] = current <= year ? selections[current] || [] : [];
      return acc;
    }, { 2017: [], 2018: [], 2019: [], 2020: [] });
    const partialSim = applySelections(partialSelections);
    const summary = partialSim.summaries[year];
    return {
      year,
      yearLabel: YEAR_LABELS[year],
      budget: summary.totalCost,
      readiness: partialSim.launchReadiness,
      patients: partialSim.newPatients2020,
      share: partialSim.share2020,
      actions: summary.selections.length,
      notes: summary.notes,
      priceLabel: YEAR_SCENARIO_SUMMARY[year].price
    };
  });

  useEffect(() => {
    // Registro de equipo
    const storedTeamKey = window.localStorage.getItem(myTeamKeyStorageKey);
    if (storedTeamKey) {
      setTeamKey(storedTeamKey);
      setRegistrationState("done");
    } else if (initialTeam) {
      // compatibilidad con URLs que pasan team param
      const key = initialTeam.toLowerCase().replace(/[^a-z0-9]/g, "-");
      window.localStorage.setItem(myTeamKeyStorageKey, key);
      setTeamKey(key);
      setRegistrationState("done");
    } else {
      setRegistrationState("pending");
      return; // no cargues nada más hasta que se registre
    }

    const storedTeamName = window.localStorage.getItem(teamNameKey);
    if (storedTeamName) setTeamName(storedTeamName);
    const storedSelections = window.localStorage.getItem(selectionsKey);
    if (storedSelections) setSelections(JSON.parse(storedSelections));
    const storedConfirmedYears = window.localStorage.getItem(confirmedYearsKey);
    if (storedConfirmedYears) setConfirmedYears(JSON.parse(storedConfirmedYears));

    const unlockedYear = Number(window.localStorage.getItem(unlockedYearKey) || "2017");
    const nextUnlockedIndex = Math.max(0, YEARS.indexOf(unlockedYear as (typeof YEARS)[number]));
    setUnlockedYearIndex(nextUnlockedIndex);
    if (currentYearIndex > nextUnlockedIndex) {
      setCurrentYearIndex(nextUnlockedIndex);
      setPhase("context");
    }

    const storedEvents = JSON.parse(window.localStorage.getItem(eventsKey) || "[]") as string[];
    setFacilitatorEvents(storedEvents);

    const storedMessages = JSON.parse(window.localStorage.getItem(boardroomMessagesKey) || "[]") as StudentMessage[];
    setBoardroomMessages(storedMessages);
    setLaunchClosed(window.localStorage.getItem(caseClosedKey) === "true");
    const storedFacilitatorMessages = JSON.parse(
      window.localStorage.getItem(facilitatorMessagesKey) || "[]"
    ) as FacilitatorMessage[];
    setFacilitatorMessages(storedFacilitatorMessages);

    const storedDecision2019Pop = window.localStorage.getItem(decision2019PopKey);
    if (storedDecision2019Pop) setDecision2019Pop(storedDecision2019Pop as "accept" | "reject");
    const storedDecision2019Price = window.localStorage.getItem(decision2019PriceKey);
    if (storedDecision2019Price) setDecision2019Price(storedDecision2019Price as "accept_200" | "propose" | "no_launch");
    const storedDecision2019ProposedPrice = window.localStorage.getItem(decision2019ProposedPriceKey);
    if (storedDecision2019ProposedPrice) setDecision2019ProposedPrice(storedDecision2019ProposedPrice);
    if (window.localStorage.getItem(caseLostKey) === "true") setCaseLost(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === unlockedYearKey) {
        const updatedYear = Number(event.newValue || "2017");
        const updatedIndex = Math.max(0, YEARS.indexOf(updatedYear as (typeof YEARS)[number]));
        setUnlockedYearIndex(updatedIndex);
        setCurrentYearIndex((current) => {
          if (current > updatedIndex) {
            setPhase("context");
            return updatedIndex;
          }
          return current;
        });
      }

      if (event.key === eventsKey) {
        setFacilitatorEvents(JSON.parse(event.newValue || "[]"));
      }

      if (event.key === boardroomMessagesKey) {
        setBoardroomMessages(JSON.parse(event.newValue || "[]"));
      }

      if (event.key === facilitatorMessagesKey) {
        setFacilitatorMessages(JSON.parse(event.newValue || "[]"));
      }

      if (event.key === caseClosedKey) {
        setLaunchClosed(event.newValue === "true");
      }

      if (event.key === confirmedYearsKey) {
        const nextValue = JSON.parse(event.newValue || "[]") as number[];
        setConfirmedYears((current) =>
          JSON.stringify(current) === JSON.stringify(nextValue) ? current : nextValue
        );
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [
    boardroomMessagesKey,
    caseClosedKey,
    caseLostKey,
    confirmedYearsKey,
    currentYearIndex,
    decision2019PopKey,
    decision2019PriceKey,
    decision2019ProposedPriceKey,
    eventsKey,
    facilitatorMessagesKey,
    initialTeam,
    myTeamKeyStorageKey,
    selectionsKey,
    sessionCode,
    teamNameKey,
    teamKey,
    unlockedYearKey
  ]);

 
  useEffect(() => {
    if (registrationState !== "done" || !teamKey) return;

    let cancelled = false;

    async function hydrateFromSupabase() {
      try {
        const rows = await getSessionState(sessionCode);
        const mine = rows.find(
  (row: any) => row.user_role === "student" && row.user_name === teamKey
);

        if (!cancelled && mine?.payload) {
          const payload = mine.payload as {
            teamName?: string;
            selections?: YearSelections;
            confirmedYears?: number[];
            currentYearIndex?: number;
            unlockedYearIndex?: number;
            boardroomNotes?: string;
            boardroomMessages?: StudentMessage[];
            facilitatorMessages?: FacilitatorMessage[];
            facilitatorEvents?: string[];
            launchClosed?: boolean;
            decision2019Pop?: "accept" | "reject" | null;
            decision2019Price?: "accept_200" | "propose" | "no_launch" | null;
            decision2019ProposedPrice?: string;
            caseLost?: boolean;
          };

          if (payload.teamName) setTeamName(payload.teamName);
          if (payload.selections) setSelections(payload.selections);
          if (payload.confirmedYears) setConfirmedYears(payload.confirmedYears);
          if (typeof payload.currentYearIndex === "number") setCurrentYearIndex(payload.currentYearIndex);
          if (typeof payload.unlockedYearIndex === "number") setUnlockedYearIndex(payload.unlockedYearIndex);
          if (typeof payload.boardroomNotes === "string") setBoardroomNotes(payload.boardroomNotes);
          if (payload.boardroomMessages) setBoardroomMessages(payload.boardroomMessages);
          if (payload.facilitatorMessages) setFacilitatorMessages(payload.facilitatorMessages);
          if (payload.facilitatorEvents) setFacilitatorEvents(payload.facilitatorEvents);
          if (typeof payload.launchClosed === "boolean") setLaunchClosed(payload.launchClosed);
          if (payload.decision2019Pop !== undefined) setDecision2019Pop(payload.decision2019Pop);
          if (payload.decision2019Price !== undefined) setDecision2019Price(payload.decision2019Price);
          if (typeof payload.decision2019ProposedPrice === "string") {
            setDecision2019ProposedPrice(payload.decision2019ProposedPrice);
          }
          if (typeof payload.caseLost === "boolean") setCaseLost(payload.caseLost);
        }
      } catch (error) {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : "Error syncing with Supabase");
        }
      } finally {
        if (!cancelled) setIsHydratingFromSupabase(false);
      }
    }

    hydrateFromSupabase();

    return () => {
      cancelled = true;
    };
  }, [registrationState, teamKey, sessionCode]);

  useEffect(() => {
    if (registrationState !== "done" || !teamKey || isHydratingFromSupabase) return;

    async function syncToSupabase() {
      try {
        setSyncError("");
        await upsertStudentState(sessionCode, teamKey, {
          teamName,
          selections,
          confirmedYears,
          currentYearIndex,
          unlockedYearIndex,
          boardroomNotes,
          boardroomMessages,
          facilitatorMessages,
          facilitatorEvents,
          launchClosed,
          decision2019Pop,
          decision2019Price,
          decision2019ProposedPrice,
          caseLost,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Error saving to Supabase");
      }
console.log("SYNC TO SUPABASE", {
  sessionCode,
  teamKey,
  selections,
});
    }

    syncToSupabase();
  }, [
    registrationState,
    teamKey,
    isHydratingFromSupabase,
    sessionCode,
    teamName,
    selections,
    confirmedYears,
    currentYearIndex,
    unlockedYearIndex,
    boardroomNotes,
    boardroomMessages,
    facilitatorMessages,
    facilitatorEvents,
    launchClosed,
    decision2019Pop,
    decision2019Price,
    decision2019ProposedPrice,
    caseLost,
  ]);

  useEffect(() => {
    if (registrationState !== "done" || !teamKey) return;

    const unsubscribe = subscribeToSessionState(sessionCode, async () => {
      try {
        const rows = await getSessionState(sessionCode);
        const mine = rows.find(
  (row: any) => row.user_role === "student" && row.user_name === teamKey
);

        if (mine?.payload) {
          const payload = mine.payload as {
            teamName?: string;
            selections?: YearSelections;
            confirmedYears?: number[];
            currentYearIndex?: number;
            unlockedYearIndex?: number;
            boardroomNotes?: string;
          };

          if (payload.teamName) setTeamName(payload.teamName);
          if (payload.selections) setSelections(payload.selections);
          if (payload.confirmedYears) setConfirmedYears(payload.confirmedYears);
          if (typeof payload.currentYearIndex === "number") setCurrentYearIndex(payload.currentYearIndex);
          if (typeof payload.unlockedYearIndex === "number") setUnlockedYearIndex(payload.unlockedYearIndex);
          if (typeof payload.boardroomNotes === "string") setBoardroomNotes(payload.boardroomNotes);
        }
      } catch (error) {
        setSyncError(error instanceof Error ? error.message : "Realtime sync error");
      }
    });

    return unsubscribe;
  }, [registrationState, teamKey, sessionCode]);

  useEffect(() => {
    window.localStorage.setItem(teamNameKey, teamName || "Equipo sin nombre");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: teamNameKey,
        newValue: teamName || "Equipo sin nombre"
      })
    );
  }, [teamName, teamNameKey]);

  useEffect(() => {
    window.localStorage.setItem(selectionsKey, JSON.stringify(selections));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: selectionsKey,
        newValue: JSON.stringify(selections)
      })
    );
  }, [selections, selectionsKey]);

  useEffect(() => {
    window.localStorage.setItem(confirmedYearsKey, JSON.stringify(confirmedYears));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: confirmedYearsKey,
        newValue: JSON.stringify(confirmedYears)
      })
    );
  }, [confirmedYears, confirmedYearsKey]);

  useEffect(() => {
    if (!decision2019Pop) return;
    window.localStorage.setItem(decision2019PopKey, decision2019Pop);
    window.dispatchEvent(new StorageEvent("storage", { key: decision2019PopKey, newValue: decision2019Pop }));
  }, [decision2019Pop, decision2019PopKey]);

  useEffect(() => {
    if (!decision2019Price) return;
    window.localStorage.setItem(decision2019PriceKey, decision2019Price);
    window.dispatchEvent(new StorageEvent("storage", { key: decision2019PriceKey, newValue: decision2019Price }));
  }, [decision2019Price, decision2019PriceKey]);

  useEffect(() => {
    if (!decision2019ProposedPrice) return;
    window.localStorage.setItem(decision2019ProposedPriceKey, decision2019ProposedPrice);
    window.dispatchEvent(new StorageEvent("storage", { key: decision2019ProposedPriceKey, newValue: decision2019ProposedPrice }));
  }, [decision2019ProposedPrice, decision2019ProposedPriceKey]);

  useEffect(() => {
    if (caseLost) {
      window.localStorage.setItem(caseLostKey, "true");
      window.dispatchEvent(new StorageEvent("storage", { key: caseLostKey, newValue: "true" }));
    }
  }, [caseLost, caseLostKey]);

  // Escucha reset externo del facilitador
  useEffect(() => {
    function handleCaseLostReset(event: StorageEvent) {
      if (event.key === caseLostKey && !event.newValue) {
        setCaseLost(false);
        setDecision2019Price(null);
        setDecision2019ProposedPrice("");
      }
      if (event.key === decision2019PriceKey && !event.newValue) {
        setDecision2019Price(null);
      }
      if (event.key === decision2019PopKey && !event.newValue) {
        setDecision2019Pop(null);
      }
    }
    window.addEventListener("storage", handleCaseLostReset);
    return () => window.removeEventListener("storage", handleCaseLostReset);
  }, [caseLostKey, decision2019PriceKey, decision2019PopKey]);

  function selectLevel(action: Action, level: Exclude<Level, "none">) {
    if (yearIsConfirmed) {
      setBoardroomStatus("Este año ya está confirmado y no se puede modificar.");
      return;
    }

    if (action.kind === "persistent_team" || action.kind === "persistent_program") {
      const previousConfirmed = inheritedSelection(selections, confirmedYears, currentYear, action);
      if (previousConfirmed) {
        const LEVEL_ORDER = ["low", "medium", "high"];
        const inheritedIndex = LEVEL_ORDER.indexOf(previousConfirmed.level as string);
        const newIndex = LEVEL_ORDER.indexOf(level as string);
        if (newIndex <= inheritedIndex) {
          setBoardroomStatus("El personal puede subir de nivel pero no bajar ni eliminarse.");
          return;
        }
      }
    }

    const nextSelections = {
      ...selections,
      [currentYear]: [
        ...(selections[currentYear] || []).filter((selection) => selection.actionId !== action.id),
        { actionId: action.id, level }
      ]
    };
    const nextSim = applySelections(nextSelections);
    if (nextSim.summaries[currentYear].totalCost <= BUDGETS[currentYear]) {
      setSelections(nextSelections);
      setOpenAction(action);
    }
  }

  function removeAction(actionId: string) {
    if (yearIsConfirmed) {
      setBoardroomStatus("Este año ya está confirmado y no se puede modificar.");
      return;
    }
    const action = ACTIONS.find((item) => item.id === actionId);
    if (action?.kind === "persistent_team" || action?.kind === "persistent_program") {
      setBoardroomStatus("Las acciones de personal son permanentes y no se pueden quitar.");
      return;
    }
    setSelections((current) => ({
      ...current,
      [currentYear]: (current[currentYear] || []).filter((selection) => selection.actionId !== actionId)
    }));
  }

  function goToPreviousPhase() {
    if (phaseIndex > 0) setPhase(phaseOrder[phaseIndex - 1]);
  }

  function goToNextPhase() {
    if (phaseIndex < phaseOrder.length - 1) setPhase(phaseOrder[phaseIndex + 1]);
  }

  function confirmYear() {
    if (yearIsConfirmed) {
      setBoardroomStatus("Este año ya estaba confirmado.");
      return;
    }
    const nextSelections: YearSelections = {
      2017: [...(selections[2017] || [])],
      2018: [...(selections[2018] || [])],
      2019: [...(selections[2019] || [])],
      2020: [...(selections[2020] || [])]
    };

    ACTIONS.forEach((action) => {
      if (action.kind !== "persistent_team" && action.kind !== "persistent_program") return;
      const confirmedSelection = findSelection(selections, currentYear, action.id);
      if (!confirmedSelection) return;

      YEARS.filter((year) => year > currentYear).forEach((futureYear) => {
        const futureSelection = findSelection(nextSelections, futureYear, action.id);
        if (!futureSelection) {
          nextSelections[futureYear] = [
            ...(nextSelections[futureYear] || []),
            { actionId: action.id, level: confirmedSelection.level }
          ];
        }
      });
    });

    setSelections(nextSelections);
    setConfirmedYears((current) => [...new Set([...current, currentYear])].sort());
    setBoardroomStatus(`Año ${currentYear} confirmado.`);
  }

  const executiveSummary = useMemo(() => {
    const selections = currentSummary.selections;
    if (!selections.length) return "";
    const investmentLines = selections
      .map((s) => `• ${s.title} (${s.levelLabel}) — €${s.cost.toLocaleString("es-ES")}`)
      .join("\n");
    const priceNote =
      discountSlider > 0
        ? `El equipo ha analizado un descuento del ${discountSlider}% sobre precio objetivo (€500), situando el precio simulado en €${simulatedDiscountPrice}.`
        : "El equipo mantiene el precio objetivo de €500.";
    const ministryNote = priceGuardrail.ministryAsk
      ? ` El Ministerio exige €${priceGuardrail.ministryAsk}. Precio autorizado por Global: €${priceGuardrail.authorized}.`
      : "";

    // Bloque de decisiones 2019 (solo aparece si hay eventos activos ese año)
    let events2019Block = "";
    if (currentYear === 2019) {
      const popLine = facilitatorEvents.includes("2019-pop")
        ? `• Restricción de población: ${
            decision2019Pop === "accept"
              ? "ACEPTA la restricción (>8MMD + 3TF)"
              : decision2019Pop === "reject"
                ? "RECHAZA / negocia condiciones"
                : "PENDIENTE DE DECISIÓN"
          }`
        : null;
      const priceLine = facilitatorEvents.includes("2019-price")
        ? `• Decisión de precio: ${
            decision2019Price === "accept_200"
              ? "ACEPTA €200 (posición Ministerio)"
              : decision2019Price === "no_launch"
                ? "DECIDE NO LANZAR el producto"
                : decision2019Price === "propose"
                  ? `PROPONE €${decision2019ProposedPrice} al Ministerio${caseLost ? " → PRECIO RECHAZADO" : ""}`
                  : "PENDIENTE DE DECISIÓN"
          }`
        : null;
      const lines = [popLine, priceLine].filter(Boolean).join("\n");
      if (lines) events2019Block = `\n\nDECISIONES CLAVE 2019\n${lines}`;
    }

    return `EQUIPO: ${teamName || "Equipo sin nombre"} — AÑO ${currentYear}\n\nINVERSIONES SELECCIONADAS\n${investmentLines}\n\nTOTAL INVERTIDO: €${currentSummary.totalCost.toLocaleString("es-ES")}\n\nPOSICIÓN DE PRECIO\n${priceNote}${ministryNote}${events2019Block}\n\nPROYECCIÓN\nReadiness: ${sim.launchReadiness}/100 · Cuota estimada: ${sim.share2020}% · Stakeholder trust: ${sim.stakeholderTrust}/100`;
  }, [currentSummary, discountSlider, simulatedDiscountPrice, priceGuardrail, teamName, currentYear, sim, facilitatorEvents, decision2019Pop, decision2019Price, decision2019ProposedPrice, caseLost]);

  function registerTeam() {
    if (!registrationInput.trim()) return;
    const name = registrationInput.trim();
    const slug = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20);
    const uniqueKey = slug + "-" + Math.random().toString(36).slice(2, 6);
    window.localStorage.setItem(myTeamKeyStorageKey, uniqueKey);
    window.localStorage.setItem(`${storageBase}:teamName:${uniqueKey}`, name);
    window.dispatchEvent(new StorageEvent("storage", { key: `${storageBase}:teamName:${uniqueKey}`, newValue: name }));
    setTeamKey(uniqueKey);
    setTeamName(name);
    setRegistrationState("done");
  }

  if (registrationState === "loading") {
    return <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500 text-sm">Cargando...</div>;
  }

  if (registrationState === "pending") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.22),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.15),transparent_35%)]" />
        <div className="relative w-full max-w-md">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Cefalix Launch Simulator</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-tight">¿Quién<br />eres?</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400">
            Escribe el nombre de tu equipo. Lo usaremos para identificaros durante toda la sesión.
          </p>
          <input
            autoFocus
            value={registrationInput}
            onChange={(e) => setRegistrationInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") registerTeam(); }}
            placeholder="Nombre del equipo"
            className="mt-8 w-full rounded-[1.5rem] border border-white/10 bg-white/5 px-6 py-5 text-2xl font-black text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50 focus:bg-white/8 transition-colors"
          />
          <button
            onClick={registerTeam}
            disabled={!registrationInput.trim()}
            className="mt-4 w-full rounded-[1.5rem] bg-brand-red px-6 py-5 text-lg font-black text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Entrar al simulador →
          </button>
          <p className="mt-4 text-center text-xs text-zinc-600">
            Sesión: {sessionCode}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <section className="relative overflow-hidden bg-black px-6 pb-10 pt-8 text-white">
        <div className="absolute inset-0 bg-grid-soft opacity-15" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.28),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(127,29,29,0.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-red-400">Student environment</p>
              <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">Cefalix Launch Simulator</h1>
              <p className="mt-2 text-sm text-zinc-300">{YEAR_LABELS[currentYear]}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button href="/context" variant="ghost" className="rounded-xl border border-white/10">
                Contexto
              </Button>
              <Button href="/instructions" variant="ghost" className="rounded-xl border border-white/10">
                Instrucciones
              </Button>
              <Button href="/preread" variant="ghost" className="rounded-xl border border-white/10">
                Pre-read
              </Button>
              <Button href="/" variant="ghost" className="rounded-xl border border-white/10">
                Home
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">Equipo</div>
              <input
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                placeholder="Nombre del equipo"
                className="mt-3 w-full max-w-xl rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-2xl font-black text-white outline-none placeholder:text-zinc-600"
              />
            </div>
            <div className="flex flex-wrap gap-4 pb-1 text-sm text-zinc-400">
              <span className="text-white font-bold">{currentYear}</span>
              <span>·</span>
              <span>{YEAR_LABELS[currentYear]}</span>
              <span>·</span>
              <span>Budget restante: <span className={`font-black ${remainingBudget < 0 ? "text-red-400" : "text-emerald-400"}`}>€{remainingBudget.toLocaleString("es-ES")}</span></span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-red-500">Year navigation</div>
              <div className="mt-2 text-2xl font-black text-white">Año activo: {currentYear}</div>
              <div className="mt-1 text-sm text-zinc-400">{YEAR_LABELS[currentYear]}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              {YEARS.map((year, index) => {
                const isLocked = index > unlockedYearIndex;
                const isActive = currentYear === year;
                return (
                  <button
                    key={year}
                    disabled={isLocked}
                    onClick={() => {
                      setCurrentYearIndex(index);
                      setPhase("context");
                    }}
                    className={`rounded-[1.5rem] border px-4 py-3 text-left transition-all ${
                      isActive
                        ? "border-red-600 bg-red-600 text-white shadow-lg shadow-red-900/40"
                        : isLocked
                          ? "cursor-not-allowed border-zinc-700 bg-zinc-900 text-zinc-600"
                          : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-sm font-black">{year}</div>
                    <div className={`mt-1 text-xs ${isActive ? "text-red-200" : isLocked ? "text-zinc-600" : "text-zinc-400"}`}>
                      {isLocked ? "Bloqueado" : YEAR_LABELS[year]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {phaseOrder.map((item) => (
            <button
              key={item}
              onClick={() => setPhase(item)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                phase === item
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
              }`}
            >
              {phaseLabel(item)}
            </button>
          ))}
          {facilitatorMessages.filter((m) => m.year <= currentYear).length ? (
            <button
              onClick={() => setShowFacilitatorMessages((v) => !v)}
              className={`ml-auto flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                showFacilitatorMessages
                  ? "border-zinc-700 bg-zinc-950 text-white"
                  : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {facilitatorMessages.filter((m) => m.year <= currentYear).length} mensaje{facilitatorMessages.filter((m) => m.year <= currentYear).length > 1 ? "s" : ""}
              {facilitatorMessages.filter((m) => m.year <= currentYear && m.target === "Personalizado").length ? (
                <span className="rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-black text-zinc-900">personal</span>
              ) : null}
            </button>
          ) : null}
        </div>

        {showFacilitatorMessages && facilitatorMessages.filter((m) => m.year <= currentYear).length ? (
          <div className="mb-4 space-y-2">
            {facilitatorMessages.filter((m) => m.year <= currentYear).map((m, i) => {
              const isPersonal = m.target === "Personalizado";
              return (
                <div key={i} className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${isPersonal ? "border-amber-500/40 bg-amber-500/10" : "border-zinc-200 bg-zinc-50"}`}>
                  <MessageSquare className={`mt-0.5 h-4 w-4 shrink-0 ${isPersonal ? "text-amber-500" : "text-zinc-400"}`} />
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-[0.16em] ${isPersonal ? "text-amber-600" : "text-zinc-400"}`}>
                      {isPersonal ? "Mensaje personal · " : "General · "}{m.year}
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-zinc-900">{m.title}</div>
                    <div className="mt-1 text-sm leading-6 text-zinc-600">{m.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {phase === "context" ? (
          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600/20">
                  <Target className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-red-500">Detalles del año {currentYear}</div>
                  <h3 className="mt-0.5 text-xl font-black text-white">{currentNarrative.title}</h3>
                </div>
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <p className="text-sm leading-8 text-zinc-300">{currentNarrative.message}</p>
                  <div className="mt-4 rounded-2xl border-l-4 border-l-red-500 border border-white/10 bg-white/5 p-4 text-sm leading-7 text-zinc-400">
                    {YEAR_STARTING_SETUP[currentYear].note}
                  </div>
                </div>
                <div className="grid gap-3 content-start">
                  <DarkInfoPanel label="Situación de acceso" value={YEAR_STARTING_SETUP[currentYear].access} />
                  <DarkInfoPanel label="Lectura del pool" value={YEAR_STARTING_SETUP[currentYear].pool} />
                  <DarkInfoPanel label="Escenario dominante" value={accessScenario.label} highlight />
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              <DarkInfoStat label="Launch" value={YEAR_SCENARIO_SUMMARY[currentYear].launchTiming} />
              <DarkInfoStat label="Label" value={YEAR_SCENARIO_SUMMARY[currentYear].label} />
              <DarkInfoStat label="Price" value={YEAR_SCENARIO_SUMMARY[currentYear].price} highlight />
              <DarkInfoStat label="Canal" value={YEAR_SCENARIO_SUMMARY[currentYear].channel} />
              <DarkInfoStat label="Prescripción" value={YEAR_SCENARIO_SUMMARY[currentYear].prescriber} />
            </div>
          </div>
        ) : null}

        {phase === "preread" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
            <SectionCard title={`Key Data ${currentYear}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <MetricCard label="Population 18–65" value={formatMillions(baselineMarket.population_18_65)} />
                <MetricCard label="Consulting patients" value={formatMillions(baselineMarket.consultingPatients)} />
                <MetricCard label="Visited by neurologists" value={baselineMarket.visitedByNeurologists.toLocaleString("es-ES")} />
                <MetricCard label="Prophylactic treated" value={baselineMarket.prophylacticTreated.toLocaleString("es-ES")} />
              </div>
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-brand-red">Al año de lanzamiento</div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <InfoStat label="Pool elegible" value={currentProjection.eligiblePatients.toLocaleString("es-ES")} />
                  <InfoStat label="Dynamic patients" value={currentProjection.dynamicPatients.toLocaleString("es-ES")} />
                  <InfoStat label="Pacientes en aCGRP" value={currentProjection.patientsOnACGRP.toLocaleString("es-ES")} />
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-brand-red">Price sensitivity</div>
                    <div className="mt-2 text-lg font-black">Precio objetivo de trabajo: {priceGuardrail.target}€</div>
                    <p className="mt-2 text-sm leading-7 text-zinc-600">
                      {priceGuardrail.note}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Descuento simulado</div>
                    <div className="mt-1 text-3xl font-black">{discountSlider}%</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxDiscount}
                  step="10"
                  value={discountSlider}
                  onChange={(event) => setDiscountSlider(Number(event.target.value))}
                  className="mt-5 h-2 w-full"
                />
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <InfoStat label="Precio simulado" value={`${simulatedDiscountPrice}€`} />
                  <InfoStat label="Impacto cuota" value={`+${illustrativeShareShift}% máx.`} />
                  <InfoStat label="Impacto ventas" value={`${Math.round(illustrativeRevenueFactor * 100)}% del baseline`} />
                </div>
              </div>
            </SectionCard>

            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <BarChart2 className="h-5 w-5 text-zinc-300" />
                </div>
                <h2 className="text-xl font-black text-white">Population to sales model</h2>
              </div>
              <div className="mb-5 grid gap-3 md:grid-cols-5">
                {[
                  { label: "Launch timing", desc: "Fecha estimada de reembolso", value: YEAR_SCENARIO_SUMMARY[currentYear].launchTiming },
                  { label: "Label restriction", desc: "Indicación aprobada", value: YEAR_SCENARIO_SUMMARY[currentYear].label },
                  { label: "Price range", desc: "Objetivo → autorizado", value: YEAR_SCENARIO_SUMMARY[currentYear].price },
                  { label: "Canal de distribución", desc: "Acceso por canal", value: YEAR_SCENARIO_SUMMARY[currentYear].channel },
                  { label: "Prescriptor", desc: "Perfil prescriptor clave", value: YEAR_SCENARIO_SUMMARY[currentYear].prescriber },
                ].map(({ label, desc, value }) => (
                  <div key={label} className="rounded-2xl bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                    <div className="mt-1 text-xs text-zinc-600">{desc}</div>
                    <div className="mt-2 text-sm font-black text-white">{value}</div>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Métrica</th>
                      {keyDataTimeline.map((row) => (
                        <th key={row.year} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{row.year}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      { label: "Prevalence (in 000s)", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => formatThousands(row.prevalence) },
                      { label: "Diagnosed Patients (in 000s)", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => formatThousands(row.diagnosedPatients) },
                      { label: "Prophylactic treated", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => formatNum(row.prophylacticTreated) },
                      { label: currentYear === 2017 ? "Patients >4MMD (GP + Spec)" : "Total patients >8MMD", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => row.scenarioPatients.toLocaleString("es-ES") },
                      { label: "Dynamic Patients", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => formatNum(row.dynamicPatients) },
                      { label: "Patients on aCGRP", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => formatNum(row.patientsOnACGRP) },
                      { label: "# of aCGRP in the market", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => String(row.acgrpCount) },
                      { label: "Market Share Cefalix (New Patients)", kind: "highlight", getValue: (row: (typeof keyDataTimeline)[number]) => `${row.expectedShare}%` },
                      { label: "Cefalix new patients", kind: "highlight", getValue: (row: (typeof keyDataTimeline)[number]) => row.cefalixNewPatients.toLocaleString("es-ES") },
                      { label: "Total Patients on Cefalix", kind: "highlight", getValue: (row: (typeof keyDataTimeline)[number]) => row.cefalixTotalPatients.toLocaleString("es-ES") },
                      { label: "Dosage per patient", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => String(row.dosage) },
                      { label: "Net price", kind: "normal", getValue: (row: (typeof keyDataTimeline)[number]) => `€${row.netPrice}` },
                      { label: "Net sales ($mn)", kind: "hero", getValue: (row: (typeof keyDataTimeline)[number]) => `€ ${row.netSales.toLocaleString("es-ES")}` }
                    ] as { label: string; kind: "normal" | "highlight" | "hero"; getValue: (row: (typeof keyDataTimeline)[number]) => string }[]).map((metric, rowIndex) => (
                      <tr
                        key={metric.label}
                        className={
                          metric.kind === "hero"
                            ? "border-t-2 border-red-500/40 bg-red-600/15"
                            : metric.kind === "highlight"
                              ? "bg-white/5"
                              : rowIndex % 2 === 0 ? "" : "bg-white/[0.02]"
                        }
                      >
                        <td className={`px-4 py-3 ${metric.kind === "hero" ? "font-black text-white" : metric.kind === "highlight" ? "font-semibold text-zinc-200" : "text-zinc-400"}`}>
                          {metric.label}
                        </td>
                        {keyDataTimeline.map((row) => (
                          <td
                            key={`${metric.label}-${row.year}`}
                            className={`px-4 py-3 text-right tabular-nums ${metric.kind === "hero" ? "font-black text-red-300" : metric.kind === "highlight" ? "font-semibold text-zinc-200" : "text-zinc-400"}`}
                          >
                            {metric.getValue(row)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "simulator" ? (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="Key Actions and Investment">
              {/* P&L sintético 5 años */}
              <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-950 overflow-hidden">
                <div className="grid grid-cols-[1fr_repeat(7,auto)] text-xs">
                  <div className="px-4 py-3 text-zinc-500 uppercase tracking-[0.18em]">Proyección</div>
                  {[2017, 2018, 2019, 2020, 2021, 2022, 2023].map((y) => (
                    <div key={y} className={`px-3 py-3 text-right font-black ${y === 2020 ? "text-red-400" : y > 2021 ? "text-zinc-600" : "text-zinc-400"}`}>
                      {y}{y > 2021 ? <span className="ml-0.5 text-[9px] text-zinc-700">*</span> : null}
                    </div>
                  ))}
                  {[
                    {
                      label: "Pacientes",
                      values: [2017, 2018, 2019, 2020, 2021, 2022, 2023].map((y) =>
                        y < 2020 ? "—" : y === 2020 ? String(sim.newPatients2020)
                          : y === 2021 ? String(sim.newPatients2020)
                          : y === 2022 ? String(Math.round(sim.newPatients2020 * 1.15))
                          : String(Math.round(sim.newPatients2020 * 1.28))
                      )
                    },
                    {
                      label: "Market share",
                      values: [2017, 2018, 2019, 2020, 2021, 2022, 2023].map((y) => {
                        const shift = discountSlider > 0 ? illustrativeShareShift : 0;
                        if (y < 2020) return "—";
                        if (y === 2020) return `${Math.round(sim.share2020 + shift)}%`;
                        if (y === 2021) return `${Math.round(sim.share2021 + shift)}%`;
                        if (y === 2022) return `${Math.min(Math.round(sim.share2021 + shift + 3), 80)}%`;
                        return `${Math.min(Math.round(sim.share2021 + shift + 5), 80)}%`;
                      })
                    },
                    {
                      label: "Ventas netas",
                      values: [2017, 2018, 2019, 2020, 2021, 2022, 2023].map((y) => {
                        const f = illustrativeRevenueFactor;
                        if (y <= 2021) return `€${Math.round(sim.pnl[y as 2017|2018|2019|2020|2021].revenue / 1e6 * f)}M`;
                        if (y === 2022) return `€${Math.round(sim.pnl[2021].revenue / 1e6 * f * 1.12)}M`;
                        return `€${Math.round(sim.pnl[2021].revenue / 1e6 * f * 1.22)}M`;
                      })
                    },
                    {
                      label: "Margen bruto",
                      values: [2017, 2018, 2019, 2020, 2021, 2022, 2023].map((y) => {
                        const f = illustrativeRevenueFactor;
                        if (y <= 2021) return `€${Math.round(sim.pnl[y as 2017|2018|2019|2020|2021].grossMargin / 1e6 * f)}M`;
                        if (y === 2022) return `€${Math.round(sim.pnl[2021].grossMargin / 1e6 * f * 1.12)}M`;
                        return `€${Math.round(sim.pnl[2021].grossMargin / 1e6 * f * 1.22)}M`;
                      })
                    }
                  ].map(({ label, values }) => (
                    <div key={label} className="contents">
                      <div className={`px-4 py-2.5 text-xs font-semibold border-t border-white/5 ${label === "Margen bruto" ? "text-white" : "text-zinc-400"}`}>{label}</div>
                      {values.map((v, i) => (
                        <div key={i} className={`px-3 py-2.5 text-right tabular-nums border-t border-white/5 text-xs ${i === 3 ? "font-black text-red-300" : i > 4 ? "text-zinc-600" : label === "Margen bruto" ? "font-bold text-zinc-200" : "text-zinc-500"}`}>{v}</div>
                      ))}
                    </div>
                  ))}
                  <div className="col-span-8 px-4 py-2 text-[10px] text-zinc-700 border-t border-white/5">* 2022–2023 son proyecciones estimadas (+12%/+22% sobre 2021)</div>
                  {/* Slider de precio */}
                  <div className="col-span-8 border-t border-white/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Price sensitivity</div>
                        <div className="mt-0.5 text-xs text-zinc-400">{priceGuardrail.note}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-zinc-500">Descuento</div>
                        <div className="text-lg font-black text-white">{discountSlider}% <span className="text-sm text-zinc-400">→ €{simulatedDiscountPrice}</span></div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={maxDiscount}
                      step="10"
                      value={discountSlider}
                      onChange={(e) => setDiscountSlider(Number(e.target.value))}
                      className="mt-3 h-1.5 w-full accent-red-500"
                    />
                    <div className="mt-2 flex justify-between text-xs text-zinc-600">
                      <span>€500 (objetivo)</span>
                      <span>€{Math.round(ASSUMPTIONS.targetPrice * (1 - maxDiscount / 100))} (máx. autorizado)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key areas */}
              <div className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-brand-red">Key areas of investment</div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {[
                    ["Medical", sim.areas.medical],
                    ["Access", sim.areas.access],
                    ["Commercial", sim.areas.commercial],
                    ["Market shaping", sim.areas.marketShaping],
                    ["Confidence", sim.areas.confidence],
                    ["Capacity", sim.areas.capacity]
                  ].map(([label, value]) => (
                    <div key={String(label)}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-zinc-600">{label}</span>
                        <span className="font-bold text-zinc-950">{Math.round(Number(value))}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
                        <div className="h-full rounded-full bg-brand-red transition-all" style={{ width: `${Math.min(Number(value), 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {ACTIONS.map((action, index) => {
                  const effective = effectiveSelection(selections, confirmedYears, currentYear, action);
                  const selected = Boolean(effective.selection);
                  const selectedLevel = effective.selection?.level;
                  const inherited = effective.inherited;
                  return (
                    <div key={action.id} className={selected ? "rounded-[1.9rem] ring-2 ring-brand-red" : ""}>
                      <ActionCard action={action} index={index + 1}>
                        <>
                      <div className="w-full text-sm font-medium text-zinc-500">
                            {index + 1}. {action.whyItMatters}
                          </div>
                          {(["low", "medium", "high"] as const).map((level) => {
                            const isSelected = selectedLevel === level;
                            const LEVEL_ORDER = ["low", "medium", "high"];
                            const inheritedLevel = inherited
                              ? inheritedSelection(selections, confirmedYears, currentYear, action)?.level
                              : null;
                            const blockedByInherit = inherited && inheritedLevel
                              ? LEVEL_ORDER.indexOf(level) <= LEVEL_ORDER.indexOf(inheritedLevel as string)
                              : false;
                            const isDisabled = yearIsConfirmed || blockedByInherit;
                            return (
                              <button
                                key={level}
                                disabled={isDisabled}
                                className={`rounded-xl border px-3 py-2 text-sm ${
                                  isSelected
                                    ? "border-brand-red bg-red-50 font-bold text-brand-red"
                                    : "border-zinc-200 bg-white"
                                } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
                                onClick={() => selectLevel(action, level)}
                                onMouseEnter={() => setOpenAction(action)}
                              >
                                {action.levels[level].label} · €{selectionCost(action, level).toLocaleString("es-ES")}
                              </button>
                            );
                          })}
                          {selected && action.kind !== "persistent_team" && action.kind !== "persistent_program" ? (
                            <button
                              disabled={yearIsConfirmed || inherited}
                              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800"
                              onClick={() => removeAction(action.id)}
                            >
                              Quitar
                            </button>
                          ) : null}
                          {selected && (action.kind === "persistent_team" || action.kind === "persistent_program") ? (
                            <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-700">
                              <Lock className="h-4 w-4" />
                              {inherited ? "Arrastrado de años previos" : "Personal permanente"}
                            </div>
                          ) : null}
                        </>
                      </ActionCard>
                    </div>
                  );
                })}
              </div>
            </SectionCard>

            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              {/* Budget pill siempre visible */}
              <div className={`rounded-2xl border px-5 py-3 flex items-center justify-between ${remainingBudget < 0 ? "border-red-500/60 bg-red-950" : "border-emerald-400/40 bg-black"}`}>
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Budget restante</div>
                  <div className={`text-xl font-black ${remainingBudget < 0 ? "text-red-400" : "text-emerald-400"}`} style={remainingBudget >= 0 ? { textShadow: "0 0 12px rgba(52,211,153,0.6)" } : {}}>
                    €{remainingBudget.toLocaleString("es-ES")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-600">Total año</div>
                  <div className="text-sm font-bold text-zinc-400">€{BUDGETS[currentYear].toLocaleString("es-ES")}</div>
                </div>
              </div>
              <DarkSideCard title="Selecciones del año" icon={<CheckSquare className="h-4 w-4 text-red-400" />}>
                {currentSummary.selections.length ? (
                  <div className="space-y-2">
                    {currentSummary.selections.map((selection) => (
                      <div key={`${selection.title}-${selection.levelLabel}`} className="flex items-start justify-between gap-3 rounded-2xl border border-white/8 bg-white/5 p-4">
                        <div>
                          <div className="text-sm font-bold text-white">{selection.title}</div>
                          <div className="mt-0.5 text-xs text-zinc-500">{selection.levelLabel}</div>
                        </div>
                        <div className="shrink-0 rounded-xl bg-red-600/20 px-3 py-1.5 text-xs font-black text-red-300">
                          €{selection.cost.toLocaleString("es-ES")}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
                    Sin actividades seleccionadas aún.
                  </div>
                )}
              </DarkSideCard>

              <DarkSideCard title="Resumen de año" icon={<BarChart2 className="h-4 w-4 text-zinc-400" />}>
                <div className="grid gap-2">
                  <EconomicRow label="Budget restante" value={`€${remainingBudget.toLocaleString("es-ES")}`} dark />
                  <EconomicRow label="Coste total" value={`€${currentSummary.totalCost.toLocaleString("es-ES")}`} dark />
                  <EconomicRow label="Hospitales tocados" value={String(currentSummary.hospitalsTouched)} dark />
                  <EconomicRow label="Personas activadas" value={String(currentSummary.peopleActivated)} dark />
                </div>
              </DarkSideCard>

              <DarkSideCard title="Indicadores" icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}>
                <div className="space-y-2">
                  {[
                    { label: "Stakeholder trust", value: sim.stakeholderTrust },
                    { label: "Competitive position", value: sim.competitivePosition },
                    { label: "Org. readiness", value: sim.organizationalReadiness },
                    { label: "Launch attractiveness", value: sim.launchAttractiveness }
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-zinc-400">{label}</span>
                        <span className="font-black text-white">{value}<span className="text-zinc-600">/100</span></span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full transition-all ${value >= 80 ? "bg-emerald-400" : value >= 50 ? "bg-amber-400" : "bg-red-500"}`}
                          style={{ width: `${Math.min(value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {facilitatorMessages.filter((m) => m.year <= currentYear).length ? (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">Del facilitador</div>
                    {facilitatorMessages.filter((m) => m.year <= currentYear).slice(0, 2).map((m, i) => (
                      <div key={i} className="rounded-xl border border-red-500/20 bg-red-600/10 p-3">
                        <div className="text-xs font-bold text-red-400">{m.title}</div>
                        <div className="mt-0.5 text-xs text-zinc-300">{m.body}</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </DarkSideCard>


              {openAction ? (
                <DarkSideCard title="Actividad activa" icon={<Target className="h-4 w-4 text-red-400" />}>
                  <h3 className="text-base font-black text-white">{openAction.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{openAction.whyItMatters}</p>
                </DarkSideCard>
              ) : null}
            </div>
          </div>
        ) : null}

        {phase === "summary" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <SectionCard title="One-page summary">
              <div className="mb-4 text-4xl font-black text-zinc-950">{teamName || "Equipo sin nombre"}</div>

              <div className="grid gap-4 md:grid-cols-4">
                <SummaryMetric title="Readiness final" value={`${sim.launchReadiness}/100`} />
                <SummaryMetric title="Cuota 2020" value={`${sim.share2020}%`} />
                <SummaryMetric title="Pacientes 2020" value={String(sim.newPatients2020)} />
                <SummaryMetric title="Margen 2021" value={`€${Math.round(sim.pnl[2021].grossMargin / 1000000)}M`} />
              </div>

              <div className="mt-6 space-y-4">
                {studentTimeline.map((item) => (
                  <StudentTimelineCard
                    key={item.year}
                    yearLabel={item.yearLabel}
                    budget={item.budget}
                    readiness={item.readiness}
                    patients={item.patients}
                    share={item.share}
                    actions={item.actions}
                    notes={item.notes}
                    priceLabel={item.priceLabel}
                  />
                ))}
              </div>
            </SectionCard>

            <DarkSideCard title="Indicadores rápidos">
              <div className="grid gap-3">
                <EconomicRow label="Equipo" value={teamName || "Equipo sin nombre"} dark />
                <EconomicRow label="Stakeholder trust" value={`${sim.stakeholderTrust}/100`} dark />
                <EconomicRow label="Competitive position" value={`${sim.competitivePosition}/100`} dark />
                <EconomicRow label="Financial sustainability" value={`${sim.financialSustainability}/100`} dark />
                <EconomicRow label="Launch attractiveness" value={`${sim.launchAttractiveness}/100`} dark />
                <EconomicRow
                  label="Mensajes enviados"
                  value={String(boardroomMessages.filter((message) => message.year === currentYear).length)}
                  dark
                />
                <EconomicRow
                  label="Mensajes recibidos"
                  value={String(facilitatorMessages.filter((message) => message.year <= currentYear).length)}
                  dark
                />
                <EconomicRow
                  label="Eventos ocurridos"
                  value={
                    facilitatorEvents.filter((eventYear) => Number(eventYear) <= currentYear).length
                      ? facilitatorEvents
                          .filter((eventYear) => Number(eventYear) <= currentYear)
                          .join(", ")
                      : "Sin eventos activos"
                  }
                  dark
                />
              </div>
            </DarkSideCard>
          </div>
        ) : null}

        {phase === "review" ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4">

              {/* ── CASO PERDIDO ─────────────────────────────────────────── */}
              {caseLost ? (
                <div className="rounded-[2rem] border-2 border-red-500 bg-red-950 p-8 text-center">
                  <div className="mb-3 text-5xl font-black text-red-400">⚠️ CASO PERDIDO</div>
                  <p className="mb-2 text-lg text-zinc-300">
                    El equipo ha propuesto un precio superior a €200.
                  </p>
                  <p className="text-sm text-zinc-400">
                    El Ministerio ha rechazado la negociación y Cefalix no obtiene el reembolso en España.
                    El caso se cierra con lanzamiento fallido.
                  </p>
                  <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-900/40 px-6 py-4">
                    <div className="mb-1 text-xs uppercase tracking-[0.16em] text-red-400">Precio propuesto por el equipo</div>
                    <div className="text-4xl font-black text-red-300">€{decision2019ProposedPrice}</div>
                    <div className="mt-1 text-sm text-zinc-400">vs. máximo exigido por el Ministerio: €200</div>
                  </div>
                  <button
                    onClick={() => {
                      setCaseLost(false);
                      setDecision2019Price(null);
                      setDecision2019ProposedPrice("");
                      window.localStorage.removeItem(caseLostKey);
                      window.localStorage.removeItem(decision2019PriceKey);
                      window.localStorage.removeItem(decision2019ProposedPriceKey);
                      window.dispatchEvent(new StorageEvent("storage", { key: caseLostKey, newValue: null }));
                      window.dispatchEvent(new StorageEvent("storage", { key: decision2019PriceKey, newValue: null }));
                    }}
                    className="mt-4 rounded-2xl border border-red-500/40 bg-red-900/30 px-6 py-3 text-sm font-semibold text-red-300 hover:bg-red-900/50 transition-colors"
                  >
                    ↺ Volver a intentar la decisión de precio
                  </button>
                </div>
              ) : null}

              {/* ── EVENTO 2019 · DECISIÓN 1: Restricción de población ──── */}
              {currentYear === 2019 && facilitatorEvents.includes("2019-pop") ? (
                <div className="rounded-[2rem] border border-amber-500/40 bg-amber-50 p-6">
                  <div className="mb-5 flex items-center gap-3 border-b border-amber-200 pb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/30 text-xl">⚡</div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-amber-600">Evento 2019 · Decisión 1</div>
                      <h3 className="mt-0.5 text-xl font-black text-zinc-900">Restricción de población</h3>
                    </div>
                  </div>
                  <p className="mb-5 text-sm leading-7 text-zinc-700">
                    El Ministerio de Sanidad solicita restringir la indicación de Cefalix a pacientes con{" "}
                    <strong>más de 8 días de migraña al mes (8MMD) y al menos 3 fallos de tratamiento (TF)</strong>.
                    Esto reduce significativamente el pool de pacientes elegibles.
                  </p>
                  {!decision2019Pop ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDecision2019Pop("accept")}
                        className="flex-1 rounded-2xl bg-zinc-950 px-5 py-4 text-sm font-black text-white transition-colors hover:bg-zinc-800"
                      >
                        ✓ Acepto la restricción
                      </button>
                      <button
                        onClick={() => setDecision2019Pop("reject")}
                        className="flex-1 rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-sm font-black text-zinc-700 transition-colors hover:border-zinc-500"
                      >
                        ✗ Rechazo / Negocio condiciones
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${decision2019Pop === "accept" ? "border-emerald-400/50 bg-emerald-50" : "border-zinc-200 bg-white"}`}>
                      <div className={`text-sm font-black ${decision2019Pop === "accept" ? "text-emerald-700" : "text-zinc-700"}`}>
                        {decision2019Pop === "accept" ? "✓ Restricción aceptada" : "✗ Condiciones en negociación"}
                      </div>
                      <button onClick={() => setDecision2019Pop(null)} className="text-xs text-zinc-400 underline hover:text-zinc-600">
                        Cambiar
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* ── EVENTO 2019 · DECISIÓN 2: Precio €200 ──────────────── */}
              {currentYear === 2019 && facilitatorEvents.includes("2019-price") ? (
                <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6">
                  <div className="mb-5 flex items-center gap-3 border-b border-red-100 pb-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-xl">💶</div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-red-500">Evento 2019 · Decisión 2</div>
                      <h3 className="mt-0.5 text-xl font-black text-zinc-900">Decisión de precio</h3>
                    </div>
                  </div>
                  <p className="mb-1 text-sm leading-7 text-zinc-700">
                    El Ministerio exige un precio máximo de <strong>€200</strong> (descuento del 60% sobre objetivo).
                    Global ha autorizado bajar hasta <strong>€300</strong> (40%).
                  </p>
                  <p className="mb-5 text-sm text-zinc-500">¿Cuál es la posición del equipo?</p>

                  {!decision2019Price ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setDecision2019Price("accept_200")}
                        className="w-full rounded-2xl bg-zinc-950 px-5 py-4 text-left text-sm font-black text-white transition-colors hover:bg-zinc-800"
                      >
                        ✓ Acepto €200
                        <div className="mt-0.5 text-xs font-normal text-zinc-400">
                          Acepto la posición del Ministerio y lanzo a €200
                        </div>
                      </button>

                      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                        <div className="mb-3 text-sm font-black text-zinc-900">↗ Propongo otro precio al Ministerio</div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">€</span>
                            <input
                              type="number"
                              min="1"
                              max="500"
                              placeholder="ej. 250"
                              value={decision2019ProposedPrice}
                              onChange={(e) => setDecision2019ProposedPrice(e.target.value)}
                              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-7 pr-3 text-sm font-bold outline-none focus:border-zinc-400"
                            />
                          </div>
                          <button
                            disabled={!decision2019ProposedPrice}
                            onClick={() => {
                              const p = Number(decision2019ProposedPrice);
                              setDecision2019Price("propose");
                              if (p > 200) setCaseLost(true);
                            }}
                            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 disabled:opacity-40"
                          >
                            Proponer
                          </button>
                        </div>
                        {decision2019ProposedPrice && Number(decision2019ProposedPrice) > 200 ? (
                          <p className="mt-2 text-xs font-semibold text-red-500">
                            ⚠️ Precio superior a €200 — si confirmas, el caso quedará perdido
                          </p>
                        ) : null}
                      </div>

                      <button
                        onClick={() => setDecision2019Price("no_launch")}
                        className="w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-left text-sm font-black text-zinc-700 transition-colors hover:border-zinc-500"
                      >
                        ✗ No lanzo el producto
                        <div className="mt-0.5 text-xs font-normal text-zinc-400">
                          Decisión estratégica de no lanzar en España bajo estas condiciones
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className={`flex items-center justify-between rounded-2xl border px-5 py-4 ${caseLost ? "border-red-400/50 bg-red-100" : decision2019Price === "accept_200" ? "border-emerald-400/50 bg-emerald-50" : "border-zinc-200 bg-zinc-50"}`}>
                      <div className={`text-sm font-black ${caseLost ? "text-red-700" : decision2019Price === "accept_200" ? "text-emerald-700" : "text-zinc-700"}`}>
                        {caseLost
                          ? `⚠️ Propuse €${decision2019ProposedPrice} — precio rechazado`
                          : decision2019Price === "accept_200"
                            ? "✓ Acepto €200"
                            : decision2019Price === "no_launch"
                              ? "✗ Decisión de no lanzar"
                              : `↗ Propongo €${decision2019ProposedPrice} al Ministerio`}
                      </div>
                      {!caseLost ? (
                        <button onClick={() => setDecision2019Price(null)} className="text-xs text-zinc-400 underline hover:text-zinc-600">
                          Cambiar
                        </button>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}

              {/* ── BOARDROOM ─────────────────────────────────────────────── */}
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600/20">
                    <Building2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-red-500">Boardroom</div>
                    <h3 className="mt-0.5 text-xl font-black text-white">Presentación al comité</h3>
                  </div>
                </div>

                {FACILITATOR_MESSAGES[currentYear] ? (
                  <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-600/10 p-4">
                    <div className="text-xs uppercase tracking-[0.16em] text-red-400">Mensaje del facilitador</div>
                    <p className="mt-2 text-sm leading-7 text-zinc-300">{FACILITATOR_MESSAGES[currentYear]}</p>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-2 md:grid-cols-2">
                  {[
                    { label: "Readiness", value: `${sim.launchReadiness}/100`, ok: sim.launchReadiness >= 60 },
                    { label: "Stakeholder trust", value: `${sim.stakeholderTrust}/100`, ok: sim.stakeholderTrust >= 60 },
                    { label: "Fin. sustainability", value: `${sim.financialSustainability}/100`, ok: sim.financialSustainability >= 60 },
                    { label: "Launch attractiveness", value: `${sim.launchAttractiveness}/100`, ok: sim.launchAttractiveness >= 60 }
                  ].map(({ label, value, ok }) => (
                    <div key={label} className={`flex items-center justify-between rounded-2xl border p-3 ${ok ? "border-emerald-500/20 bg-emerald-500/10" : "border-white/10 bg-white/5"}`}>
                      <span className="text-xs text-zinc-400">{label}</span>
                      <span className={`text-sm font-black ${ok ? "text-emerald-300" : "text-white"}`}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <div className="text-xs text-zinc-500">Precio objetivo</div>
                    <div className="mt-1 text-lg font-black text-white">€{priceGuardrail.target}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
                    <div className="text-xs text-zinc-500">Autorizado Global</div>
                    <div className="mt-1 text-lg font-black text-amber-300">€{priceGuardrail.authorized}</div>
                  </div>
                  {priceGuardrail.ministryAsk ? (
                    <div className="rounded-2xl border border-red-500/30 bg-red-600/10 p-3 text-center">
                      <div className="text-xs text-red-400">Exige Ministerio</div>
                      <div className="mt-1 text-lg font-black text-red-300">€{priceGuardrail.ministryAsk}</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                {executiveSummary ? (
                  <div className="mb-5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Resumen ejecutivo generado</div>
                      <button
                        className="text-xs font-semibold text-brand-red hover:underline"
                        onClick={() => setBoardroomNotes(executiveSummary)}
                      >
                        Precargar en mensaje ↓
                      </button>
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-zinc-100 bg-zinc-50 p-4 text-xs leading-6 text-zinc-600 font-sans">
                      {executiveSummary}
                    </pre>
                  </div>
                ) : null}

                <div className="text-xs uppercase tracking-[0.18em] text-brand-red">Mensaje al Boardroom</div>
                <textarea
                  value={boardroomNotes}
                  onChange={(event) => setBoardroomNotes(event.target.value)}
                  placeholder="Escribe la recomendación del equipo, dudas, riesgos o mensaje que queréis elevar al facilitador / board."
                  className="mt-3 min-h-[140px] w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-7 text-zinc-700 outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => {
                      const timestamp = new Date().toLocaleString("es-ES");
                      const nextMessages = [
                        ...boardroomMessages,
                        {
                          target: "facilitador",
                          note: boardroomNotes || "Sin contenido",
                          year: currentYear,
                          team: teamName || "Equipo sin nombre",
                          teamId: teamKey,
                          timestamp
                        }
                      ];
                      setBoardroomMessages(nextMessages);
                      window.localStorage.setItem(boardroomMessagesKey, JSON.stringify(nextMessages));
                      window.dispatchEvent(new StorageEvent("storage", { key: boardroomMessagesKey, newValue: JSON.stringify(nextMessages) }));
                      setBoardroomNotes("");
                      setBoardroomStatus("Mensaje enviado al facilitador.");
                    }}
                  >
                    Enviar al facilitador
                  </button>
                  <button
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:border-zinc-400 transition-colors"
                    onClick={() => {
                      const timestamp = new Date().toLocaleString("es-ES");
                      const nextMessages = [
                        ...boardroomMessages,
                        {
                          target: "boardroom",
                          note: boardroomNotes || "Sin contenido",
                          year: currentYear,
                          team: teamName || "Equipo sin nombre",
                          teamId: teamKey,
                          timestamp
                        }
                      ];
                      setBoardroomMessages(nextMessages);
                      window.localStorage.setItem(boardroomMessagesKey, JSON.stringify(nextMessages));
                      window.dispatchEvent(new StorageEvent("storage", { key: boardroomMessagesKey, newValue: JSON.stringify(nextMessages) }));
                      setBoardroomNotes("");
                      setBoardroomStatus("Mensaje guardado para el Boardroom.");
                    }}
                  >
                    Guardar para Boardroom
                  </button>
                  <button
                    disabled={pendingDecision2019}
                    title={pendingDecision2019 ? "Debes responder los eventos del año antes de confirmar" : ""}
                    className="rounded-xl border border-zinc-950 bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={confirmYear}
                  >
                    {pendingDecision2019 ? "⚠️ Decisiones pendientes" : "Confirmar año ✓"}
                  </button>
                </div>
                {boardroomStatus ? (
                  <div className="mt-3 text-sm font-semibold text-brand-red">{boardroomStatus}</div>
                ) : null}
              </div>

              {/* Timeline one-page summary */}
              <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="mb-1 text-xs uppercase tracking-[0.22em] text-zinc-400">One-Page Boardroom</div>
                <div className="mb-5 text-3xl font-black text-zinc-950">{teamName || "Equipo sin nombre"}</div>
                <div className="mb-5 grid gap-3 md:grid-cols-4">
                  <SummaryMetric title="Readiness" value={`${sim.launchReadiness}/100`} />
                  <SummaryMetric title="Cuota 2020" value={`${sim.share2020}%`} />
                  <SummaryMetric title="Pacientes 2020" value={String(sim.newPatients2020)} />
                  <SummaryMetric title="Margen 2021" value={`€${Math.round(sim.pnl[2021].grossMargin / 1000000)}M`} />
                </div>
                <div className="space-y-3">
                  {studentTimeline.map((item) => (
                    <StudentTimelineCard
                      key={item.year}
                      yearLabel={item.yearLabel}
                      budget={item.budget}
                      readiness={item.readiness}
                      patients={item.patients}
                      share={item.share}
                      actions={item.actions}
                      notes={item.notes}
                      priceLabel={item.priceLabel}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Gráfico P&L hasta 2023 */}
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                    <BarChart2 className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.12em]">P&L proyectado 2017–2023</h3>
                    <p className="text-xs text-zinc-500">Ventas netas · Margen bruto · Market share</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <ComposedChart
                    data={[
                      { year: "2017", ventas: Math.round(sim.pnl[2017].revenue / 1e6), margen: Math.round(sim.pnl[2017].grossMargin / 1e6), share: null },
                      { year: "2018", ventas: Math.round(sim.pnl[2018].revenue / 1e6), margen: Math.round(sim.pnl[2018].grossMargin / 1e6), share: null },
                      { year: "2019", ventas: Math.round(sim.pnl[2019].revenue / 1e6), margen: Math.round(sim.pnl[2019].grossMargin / 1e6), share: null },
                      { year: "2020", ventas: Math.round(sim.pnl[2020].revenue / 1e6), margen: Math.round(sim.pnl[2020].grossMargin / 1e6), share: sim.share2020 },
                      { year: "2021", ventas: Math.round(sim.pnl[2021].revenue / 1e6), margen: Math.round(sim.pnl[2021].grossMargin / 1e6), share: sim.share2021 },
                      { year: "2022", ventas: Math.round(sim.pnl[2021].revenue / 1e6 * 1.12), margen: Math.round(sim.pnl[2021].grossMargin / 1e6 * 1.12), share: Math.min(sim.share2021 + 3, 80), personas: currentSummary.peopleActivated },
                      { year: "2023", ventas: Math.round(sim.pnl[2021].revenue / 1e6 * 1.22), margen: Math.round(sim.pnl[2021].grossMargin / 1e6 * 1.22), share: Math.min(sim.share2021 + 5, 80), personas: currentSummary.peopleActivated }
                    ]}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="year" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}M`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#a1a1aa", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 80]} />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff", fontSize: 12 }}
                      formatter={(value, name) => {
                        if (name === "share") return [`${value}%`, "Market share"];
                        if (name === "ventas") return [`€${value}M`, "Ventas netas"];
                        if (name === "margen") return [`€${value}M`, "Margen bruto"];
                        return [value, name];
                      }}
                    />
                    <Bar yAxisId="left" dataKey="ventas" fill="#3f3f46" radius={[4, 4, 0, 0]} name="ventas" />
                    <Bar yAxisId="left" dataKey="margen" fill="#dc2626" radius={[4, 4, 0, 0]} name="margen" />
                    <Line yAxisId="right" type="monotone" dataKey="share" stroke="#ffffff" strokeWidth={2} dot={{ fill: "#ffffff", r: 4 }} name="share" connectNulls={false} />
                  </ComposedChart>
                </ResponsiveContainer>
                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-zinc-600" />Ventas netas</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-600" />Margen bruto</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-white" />Market share</span>
                </div>
              </div>

              {currentYear === 2020 && !launchClosed ? (
                <SectionCard title="Siguiente paso">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                    Estás en el cierre del caso. Si el equipo está listo, puede cerrar el ejercicio y lanzar Cefalix.
                  </div>
                  <button
                    className="mt-4 w-full rounded-2xl bg-brand-red px-6 py-4 text-base font-black text-white hover:bg-red-700 transition-colors"
                    onClick={() => {
                      setLaunchClosed(true);
                      window.localStorage.setItem(caseClosedKey, "true");
                      window.dispatchEvent(new StorageEvent("storage", { key: caseClosedKey, newValue: "true" }));
                    }}
                  >
                    🚀 Launch CEFALIX!
                  </button>
                </SectionCard>
              ) : null}

              {currentYear === 2020 && launchClosed ? (
                <div className="rounded-[2rem] overflow-hidden border border-red-800 bg-black">
                  {/* Cabecera roja */}
                  <div className="relative overflow-hidden bg-brand-red px-8 py-10 text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_60%)]" />
                    <div className="relative">
                      <div className="text-xs font-bold uppercase tracking-[0.3em] text-red-200">1 de enero de 2020 · Día del lanzamiento</div>
                      <h2 className="mt-3 text-4xl font-black uppercase leading-tight">Cefalix<br />está en el mercado.</h2>
                    </div>
                  </div>

                  {/* Carta */}
                  <div className="px-8 py-8 text-zinc-300">
                    <p className="text-sm leading-8">
                      Estimado equipo <span className="font-black text-white">{teamName || "sin nombre"}</span>,
                    </p>
                    <p className="mt-5 text-sm leading-8 text-zinc-300">
                      Hoy es el primer día del lanzamiento de Cefalix en España. Tras cuatro años de trabajo, negociaciones difíciles y decisiones valientes, hemos llegado hasta aquí.
                    </p>
                    <p className="mt-4 text-sm leading-8 text-zinc-300">
                      Este no es el final — es el comienzo de algo importante. Hay pacientes que llevan años esperando una opción como esta, y hoy empieza nuestra oportunidad de llegar a ellos. Estamos seguros de que así será.
                    </p>
                    <p className="mt-4 text-sm leading-8 text-zinc-300">
                      Un trabajo de equipo bien coordinado, con criterio y ambición, nos da confianza de que conseguiremos los resultados que esperamos:
                    </p>

                    {/* Métricas del resultado */}
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {[
                        { label: "Pacientes en tratamiento", value: String(sim.newPatients2020), sub: "nuevos pacientes en 2020" },
                        { label: "Cuota de mercado", value: `${sim.share2020}%`, sub: "en el año de lanzamiento" },
                        { label: "Ventas netas 2020", value: `€${Math.round(sim.pnl[2020].revenue / 1e6)}M`, sub: "primer año completo" },
                        { label: "Margen bruto 2021", value: `€${Math.round(sim.pnl[2021].grossMargin / 1e6)}M`, sub: "segundo año proyectado" }
                      ].map(({ label, value, sub }) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                          <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</div>
                          <div className="mt-1 text-2xl font-black text-white">{value}</div>
                          <div className="mt-0.5 text-xs text-zinc-600">{sub}</div>
                        </div>
                      ))}
                    </div>

                    <p className="mt-8 text-sm leading-8 text-zinc-400">
                      Gracias por el trabajo de estos cuatro años. Hoy empieza lo más importante.
                    </p>
                    <p className="mt-6 border-t border-white/10 pt-6 text-sm font-black text-white">
                      Con orgullo,<br />
                      <span className="text-red-400">{teamName || "Equipo sin nombre"}</span>
                    </p>
                  </div>
                </div>
              ) : null}

              {currentYear !== 2020 ? (
                <SectionCard title="Siguiente paso">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                    El siguiente año debe abrirlo el facilitador. El equipo no puede avanzar por su cuenta.
                  </div>
                  <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                    Estado del Board: pendiente de aprobación.
                  </div>
                </SectionCard>
              ) : null}
            </div>
          </div>
        ) : null}

        {phase === "ecosystem" ? (
          <div className="mt-4 space-y-6">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.28em]" style={{ color: "#FF3030" }}>Ecosystem Map</div>
              <p className="mt-1 text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>
                Red neural de lanzamiento — cada nodo refleja el nivel de activación de tu equipo en tiempo real.
              </p>
            </div>
            <EcosystemMap sim={sim} currentYear={currentYear} launchClosed={launchClosed} />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-between gap-3 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <button
            onClick={goToPreviousPhase}
            disabled={phaseIndex === 0}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Paso anterior
          </button>
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Paso actual</div>
            <div className="mt-1 text-sm font-black text-zinc-950">{phaseLabel(phase)}</div>
          </div>
          <button
            onClick={goToNextPhase}
            disabled={phaseIndex === phaseOrder.length - 1}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente paso →
          </button>
        </div>
      </div>
    </main>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-zinc-950">{value}</div>
    </div>
  );
}

function DarkMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">{label}</div>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
    </div>
  );
}

function EconomicRow({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl p-3 ${dark ? "border border-white/10 bg-black/30" : "border border-zinc-200"}`}>
      <div className={`text-sm ${dark ? "text-zinc-400" : "text-zinc-600"}`}>{label}</div>
      <div className={`text-sm font-black ${dark ? "text-white" : "text-zinc-950"}`}>{value}</div>
    </div>
  );
}

function DarkSideCard({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        {icon ? <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10">{icon}</span> : null}
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-zinc-300">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function DarkInfoPanel({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-red-500/30 bg-red-600/10" : "border-white/10 bg-white/5"}`}>
      <div className={`text-xs uppercase tracking-[0.18em] ${highlight ? "text-red-400" : "text-zinc-500"}`}>{label}</div>
      <div className={`mt-2 text-sm leading-6 ${highlight ? "font-bold text-white" : "text-zinc-300"}`}>{value}</div>
    </div>
  );
}

function DarkInfoStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-red-700 bg-red-600" : "border-zinc-800 bg-zinc-900"}`}>
      <div className={`text-xs uppercase tracking-[0.18em] ${highlight ? "text-red-200" : "text-zinc-500"}`}>{label}</div>
      <div className={`mt-2 text-xl font-black ${highlight ? "text-white" : "text-white"}`}>{value}</div>
    </div>
  );
}

function InfoPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm leading-7 text-zinc-700">{value}</div>
    </div>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-zinc-950">{value}</div>
    </div>
  );
}

function ScenarioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/30 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">{label}</div>
      <div className="mt-2 text-sm font-black text-white">{value}</div>
    </div>
  );
}

function phaseLabel(phase: Phase) {
  const labels: Record<Phase, string> = {
    home: "Home",
    context: "Contexto",
    instructions: "Instrucciones",
    preread: "Key Data",
    simulator: "Your Key Actions",
    summary: "One-page summary",
    review: "One-Page Boardroom",
    ecosystem: "Ecosystem Map"
  };

  return labels[phase];
}

function formatMillions(value: number) {
  return `${(value / 1_000_000).toFixed(1)}M`;
}

function formatThousands(value: number) {
  return Math.round(value / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatNum(value: number) {
  return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function SummaryMetric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.8rem] bg-zinc-950 p-6 text-white">
      <div className="text-xs uppercase tracking-[0.28em] text-zinc-400">{title}</div>
      <div className="mt-4 text-3xl font-black">{value}</div>
    </div>
  );
}

function StudentTimelineCard({
  yearLabel,
  budget,
  readiness,
  patients,
  share,
  actions,
  notes,
  priceLabel
}: {
  yearLabel: string;
  budget: number;
  readiness: number;
  patients: number;
  share: number;
  actions: number;
  notes: string[];
  priceLabel: string;
}) {
  return (
    <div className="rounded-[1.8rem] bg-zinc-950 p-6 text-white">
      <div className="text-base font-black">{yearLabel}</div>
      <div className="mt-2 text-sm font-semibold text-zinc-400">Precio simulado: {priceLabel}</div>
      <div className="mt-4 space-y-4 text-sm text-zinc-300">
        <StudentProgressRow label={`Budget gastado: €${budget.toLocaleString("es-ES")}`} value={Math.min(Math.round(budget / 160000), 100)} color="red" />
        <StudentProgressRow label={`Readiness: ${readiness}/100`} value={readiness} color={readinessColor(readiness)} />
        <StudentProgressRow label={`Pacientes estimados: ${patients.toLocaleString("es-ES")}`} value={Math.min(Math.round(patients / 40), 100)} color="red" />
        <StudentProgressRow label={`Cuota estimada: ${share}%`} value={share} color={shareColor(share)} />
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

function StudentProgressRow({
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
