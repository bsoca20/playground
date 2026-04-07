import {
  ACCESS_SCENARIOS,
  ACTIONS,
  ASSUMPTIONS,
  BUDGETS,
  INITIAL_AREAS,
  SCENARIO_EVOLUTION,
  YEARS
} from "@/lib/constants";
import { Action, Areas, Selection, SimResult, YearSelections, YearSummary } from "@/lib/types";

function clamp(num: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, num));
}

function findSelection(selections: YearSelections, year: number, actionId: string) {
  return (selections[year] || []).find((selection) => selection.actionId === actionId) || null;
}

function inheritedSelection(selections: YearSelections, year: number, action: Action): Selection | null {
  const yearIndex = YEARS.indexOf(year as (typeof YEARS)[number]);
  for (let index = yearIndex - 1; index >= 0; index -= 1) {
    const previousYear = YEARS[index];
    const previousSelection = findSelection(selections, previousYear, action.id);
    if (previousSelection) return previousSelection;
  }
  return null;
}

function effectiveSelection(selections: YearSelections, year: number, action: Action): Selection | null {
  const current = findSelection(selections, year, action.id);
  if (current) return current;
  if (action.kind === "persistent_team" || action.kind === "persistent_program") {
    return inheritedSelection(selections, year, action);
  }
  return null;
}

export function selectionCost(action: Action, level: Exclude<Selection["level"], "none">) {
  return Math.round(action.baseCost * action.levels[level].multiplier);
}

export function applySelections(selections: YearSelections): SimResult {
  const areas: Areas = { ...INITIAL_AREAS };
  const summaries: Record<number, YearSummary> = {
    2017: { recurringCost: 0, newCost: 0, totalCost: 0, selections: [], notes: [], hospitalsTouched: 0, peopleActivated: 0 },
    2018: { recurringCost: 0, newCost: 0, totalCost: 0, selections: [], notes: [], hospitalsTouched: 0, peopleActivated: 0 },
    2019: { recurringCost: 0, newCost: 0, totalCost: 0, selections: [], notes: [], hospitalsTouched: 0, peopleActivated: 0 },
    2020: { recurringCost: 0, newCost: 0, totalCost: 0, selections: [], notes: [], hospitalsTouched: 0, peopleActivated: 0 }
  };

  YEARS.forEach((year) => {
    ACTIONS.forEach((action) => {
      const current = findSelection(selections, year, action.id);
      const inherited = inheritedSelection(selections, year, action);
      const effective = effectiveSelection(selections, year, action);
      if (!effective) return;

      const cost = selectionCost(action, effective.level);
      const isRecurring =
        !current &&
        Boolean(inherited) &&
        (action.kind === "persistent_team" || action.kind === "persistent_program");

      if (isRecurring) summaries[year].recurringCost += cost;
      else summaries[year].newCost += cost;
      summaries[year].totalCost += cost;

      summaries[year].selections.push({
        title: action.title,
        levelLabel: action.levels[effective.level].label,
        cost,
        inherited: isRecurring
      });

      Object.entries(action.impacts).forEach(([key, value]) => {
        areas[key as keyof Areas] = clamp(areas[key as keyof Areas] + (value || 0) * 0.8);
      });
    });

    if (summaries[year].totalCost > BUDGETS[year]) {
      summaries[year].notes.push("Presupuesto anual superado.");
      areas.risk = clamp(areas.risk + 10);
    }

    if (summaries[year].totalCost > 0) {
      summaries[year].hospitalsTouched = Math.round(areas.access * 2.4 + areas.capacity * 1.4);
      summaries[year].peopleActivated = Math.round(areas.marketShaping * 40 + areas.commercial * 25);
    }

    if (year === 2018) {
      summaries[year].notes.push("Empiezan señales de endurecimiento del acceso y presión presupuestaria.");
      areas.risk = clamp(areas.risk + 3);
    }

    if (year === 2019) {
      summaries[year].notes.push("El caso se mueve a un pool mucho más restringido y sube la presión sobre precio.");
      areas.risk = clamp(areas.risk + 5);
    }
  });

  const launchReadiness = clamp(
    Math.round(
      areas.medical * 0.18 +
        areas.access * 0.22 +
        areas.commercial * 0.18 +
        areas.marketShaping * 0.12 +
        areas.confidence * 0.14 +
        areas.capacity * 0.12 -
        areas.risk * 0.08
    )
  );

  const newPatients2020 = Math.max(
    0,
    Math.round(
      (areas.access * 12 +
        areas.commercial * 11 +
        areas.confidence * 8 +
        areas.capacity * 6 +
        areas.marketShaping * 4 -
        areas.risk * 5) * 1.35
    )
  );

  const share2020 = clamp(
    Math.round(
      14 +
        areas.access * 0.22 +
        areas.commercial * 0.18 +
        areas.confidence * 0.12 -
        areas.risk * 0.1
    ),
    10,
    65
  );

  const share2021 = clamp(
    Math.round(
      18 +
        areas.access * 0.2 +
        areas.commercial * 0.15 +
        areas.confidence * 0.1 -
        areas.risk * 0.08
    ),
    10,
    60
  );

  const priceOutcome: 500 | 350 | 300 | 200 =
    launchReadiness >= 78 && areas.risk <= 18
      ? (ASSUMPTIONS.targetPrice as 500)
      : launchReadiness >= 62
        ? (ASSUMPTIONS.acceptablePrice as 350)
        : launchReadiness >= 48
          ? (ASSUMPTIONS.painfulPrice as 300)
          : (ASSUMPTIONS.floorPrice as 200);

  const netAfterRoyaltiesPerInjection =
    priceOutcome * (1 - ASSUMPTIONS.royaltiesRate / 100);

  const currentScenario = SCENARIO_EVOLUTION[2020];
  const scenarioLabel = ACCESS_SCENARIOS[currentScenario].label;
  const restrictedProjection = ACCESS_SCENARIOS.restricted_8MMD_3TF.timeline;

  const performanceFactor = clamp(
    0.72 +
      areas.access * 0.006 +
      areas.commercial * 0.004 +
      areas.confidence * 0.003 +
      areas.capacity * 0.002 -
      areas.risk * 0.003,
    0.35,
    1.35
  );

  const newPatients2020Projected = Math.round(restrictedProjection[2020].cefalixNewPatients * performanceFactor);
  const totalPatients2020Projected = Math.round(restrictedProjection[2020].cefalixTotalPatients * performanceFactor);

  const projectionTimeline = [2019, 2020, 2021, 2022, 2023].map((year) => {
    const scenarioId = SCENARIO_EVOLUTION[Math.min(year, 2020)] || "restricted_8MMD_3TF";
    const scenario = ACCESS_SCENARIOS[scenarioId];
    const base = scenario.timeline[year as keyof typeof scenario.timeline];
    const yearlyFactor = year === 2019 ? Math.max(0.5, performanceFactor - 0.1) : performanceFactor;
    const expectedShare = clamp(Math.round(base.expectedShare * yearlyFactor), 10, 65);

    return {
      year,
      scenarioLabel: scenario.label,
      eligiblePatients: base.eligiblePatients,
      dynamicPatients: base.dynamicPatients,
      patientsOnACGRP: base.patientsOnACGRP,
      cefalixNewPatients: Math.round(base.cefalixNewPatients * yearlyFactor),
      cefalixTotalPatients: Math.round(base.cefalixTotalPatients * yearlyFactor),
      expectedShare,
      netPrice: priceOutcome,
      netSales: Math.round(Math.round(base.netSales * yearlyFactor) * (priceOutcome / 350))
    };
  });

  const pnl = {
    2017: { revenue: 0, opex: summaries[2017].totalCost, grossMargin: -summaries[2017].totalCost },
    2018: { revenue: 0, opex: summaries[2018].totalCost, grossMargin: -summaries[2018].totalCost },
    2019: { revenue: 0, opex: summaries[2019].totalCost, grossMargin: -summaries[2019].totalCost },
    2020: {
      revenue: Math.round(totalPatients2020Projected * ASSUMPTIONS.injectionsPerYear * priceOutcome),
      opex: summaries[2020].totalCost,
      grossMargin: Math.round(
        totalPatients2020Projected * ASSUMPTIONS.injectionsPerYear * netAfterRoyaltiesPerInjection -
          summaries[2020].totalCost
      )
    },
    2021: {
      revenue: Math.round(Math.max(4800, Math.round(totalPatients2020Projected * 1.9)) * ASSUMPTIONS.injectionsPerYear * priceOutcome),
      opex: Math.round((summaries[2019].totalCost + summaries[2020].totalCost) * 0.72),
      grossMargin: Math.round(
        Math.max(4800, Math.round(totalPatients2020Projected * 1.9)) *
          ASSUMPTIONS.injectionsPerYear *
          netAfterRoyaltiesPerInjection -
          (summaries[2019].totalCost + summaries[2020].totalCost) * 0.72
      )
    }
  };

  const stakeholderTrust = clamp(
    Math.round(areas.medical * 0.32 + areas.confidence * 0.28 + areas.access * 0.22 - areas.risk * 0.15)
  );
  const competitivePosition = clamp(
    Math.round(areas.commercial * 0.25 + areas.confidence * 0.24 + areas.access * 0.18 + areas.marketShaping * 0.16 - areas.risk * 0.12)
  );
  const organizationalReadiness = clamp(
    Math.round(areas.medical * 0.18 + areas.access * 0.2 + areas.commercial * 0.22 + areas.capacity * 0.16 + areas.confidence * 0.14 - areas.risk * 0.08)
  );
  const financialSustainability = clamp(
    Math.round(
      25 +
        (priceOutcome === 500 ? 28 : priceOutcome === 350 ? 18 : priceOutcome === 300 ? 8 : -8) +
        areas.access * 0.16 +
        areas.commercial * 0.1 -
        areas.risk * 0.12
    )
  );
  const launchAttractiveness = clamp(
    Math.round(
      launchReadiness * 0.28 +
        financialSustainability * 0.24 +
        stakeholderTrust * 0.16 +
        competitivePosition * 0.16 +
        organizationalReadiness * 0.16
    )
  );

  const priceOutcomeLabel =
    priceOutcome === 500
      ? "objetivo inicial"
      : priceOutcome === 350
        ? "aceptable"
        : priceOutcome === 300
          ? "doloroso pero lanzable"
          : "extremo";

  return {
    areas,
    summaries,
    launchReadiness,
    newPatients2020: newPatients2020Projected,
    share2020,
    share2021,
    pnl,
    currentScenario,
    currentScenarioLabel: scenarioLabel,
    priceOutcome,
    priceOutcomeLabel,
    financialSustainability,
    launchAttractiveness,
    stakeholderTrust,
    competitivePosition,
    organizationalReadiness,
    patientPoolAccessed: totalPatients2020Projected,
    projectionTimeline
  };
}
