export type Phase =
  | "home"
  | "context"
  | "instructions"
  | "preread"
  | "simulator"
  | "summary"
  | "review";

export type Level = "none" | "low" | "medium" | "high";

export type Category =
  | "Medical"
  | "Access"
  | "Commercial"
  | "Patient"
  | "Journey"
  | "Innovation"
  | "Operations";

export type InvestmentArea =
  | "medical"
  | "access"
  | "commercial"
  | "marketShaping"
  | "confidence"
  | "capacity"
  | "risk";

export type ActionKind =
  | "persistent_team"
  | "persistent_program"
  | "annual_program"
  | "one_off";

export type LevelMeta = {
  label: string;
  multiplier: number;
  description: string;
};

export type Action = {
  id: string;
  title: string;
  category: Category;
  kind: ActionKind;
  description: string;
  whyItMatters: string;
  baseCost: number;
  yearFrom: number;
  yearTo: number;
  levels: Record<Exclude<Level, "none">, LevelMeta>;
  impacts: Partial<Record<InvestmentArea, number>>;
};

export type Selection = {
  actionId: string;
  level: Exclude<Level, "none">;
};

export type YearSelections = Record<number, Selection[]>;

export type Areas = Record<InvestmentArea, number>;

export type YearSummary = {
  recurringCost: number;
  newCost: number;
  totalCost: number;
  selections: Array<{
    title: string;
    levelLabel: string;
    cost: number;
    inherited: boolean;
  }>;
  notes: string[];
  hospitalsTouched: number;
  peopleActivated: number;
};

export type SimResult = {
  areas: Areas;
  summaries: Record<number, YearSummary>;
  launchReadiness: number;
  newPatients2020: number;
  share2020: number;
  share2021: number;
  pnl: Record<number, { revenue: number; opex: number; grossMargin: number }>;
  currentScenario: "broad_4MMD_GP_SPEC" | "restricted_8MMD_3TF";
  currentScenarioLabel: string;
  priceOutcome: 500 | 350 | 300 | 200;
  priceOutcomeLabel: string;
  financialSustainability: number;
  launchAttractiveness: number;
  stakeholderTrust: number;
  competitivePosition: number;
  organizationalReadiness: number;
  patientPoolAccessed: number;
  projectionTimeline: Array<{
    year: number;
    scenarioLabel: string;
    eligiblePatients: number;
    dynamicPatients: number;
    patientsOnACGRP: number;
    cefalixNewPatients: number;
    cefalixTotalPatients: number;
    expectedShare: number;
    netPrice: number;
    netSales: number;
  }>;
};
