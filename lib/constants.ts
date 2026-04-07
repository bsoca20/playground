import { Action, Areas } from "@/lib/types";

export const YEARS = [2017, 2018, 2019, 2020] as const;

export const YEAR_LABELS: Record<number, string> = {
  2017: "2017 · 36 meses al lanzamiento",
  2018: "2018 · 24 meses al lanzamiento · potencial aprobación EMA",
  2019: "2019 · aprobación local esperada · listos para lanzar en breve",
  2020: "2020 · lanzamiento"
};

export const BUDGETS: Record<number, number> = {
  2017: 1_000_000,
  2018: 5_000_000,
  2019: 14_000_000,
  2020: 16_000_000
};

export const ASSUMPTIONS = {
  targetPrice: 500,
  acceptablePrice: 350,
  painfulPrice: 300,
  floorPrice: 200,
  royaltiesRate: 30,
  injectionsPerYear: 12,
  neurologistsSpain: 2800,
  migraineFocusedNeurologists: 1500,
  hospitalAccounts: 250,
  topHospitals: 50,
  broadPoolIfPlus4MMD: 280000,
  annualExercisePool: 42000,
  objectiveShareIf2Launch: 51
};

export const CASE_NARRATIVE: Record<number, { title: string; message: string }> = {
  2017: {
    title: "Ambición amplia y first mover advantage",
    message:
      "El equipo arranca con optimismo, creyendo en una ventaja competitiva clara, un mercado amplio y la posibilidad de posicionar Cefalix antes que sus competidores."
  },
  2018: {
    title: "Aprobación europea y señales de endurecimiento",
    message:
      "Llega la aprobación europea, pero España empieza a mostrar preocupación presupuestaria y señales claras de que el acceso será más restrictivo de lo previsto."
  },
  2019: {
    title: "Restricción severa y presión máxima",
    message:
      "El caso gira hacia un pool restringido, solo neurología y una negociación de precio mucho más dura. La lógica del launch cambia radicalmente."
  },
  2020: {
    title: "Launch bajo condiciones difíciles",
    message:
      "Cefalix sale en un entorno mucho más duro que el imaginado al inicio. La calidad de la preparación y de las decisiones previas determina si el launch sigue siendo atractivo."
  }
};

export const SCENARIO_EVOLUTION: Record<number, "broad_4MMD_GP_SPEC" | "restricted_8MMD_3TF"> = {
  2017: "broad_4MMD_GP_SPEC",
  2018: "broad_4MMD_GP_SPEC",
  2019: "restricted_8MMD_3TF",
  2020: "restricted_8MMD_3TF"
};

export const ACCESS_SCENARIOS = {
  broad_4MMD_GP_SPEC: {
    label: ">4MMD (GP + Spec)",
    timeline: {
      2019: { eligiblePatients: 284854, dynamicPatients: 80285, patientsOnACGRP: 4223, expectedShare: 50, cefalixNewPatients: 1109, cefalixTotalPatients: 2780, netPrice: 350, netSales: 1945983 },
      2020: { eligiblePatients: 283921, dynamicPatients: 95386, patientsOnACGRP: 26758, expectedShare: 48, cefalixNewPatients: 14573, cefalixTotalPatients: 12843, netPrice: 350, netSales: 31465815 },
      2021: { eligiblePatients: 284424, dynamicPatients: 110134, patientsOnACGRP: 74512, expectedShare: 44, cefalixNewPatients: 31941, cefalixTotalPatients: 32787, netPrice: 350, netSales: 80327333 },
      2022: { eligiblePatients: 284792, dynamicPatients: 116554, patientsOnACGRP: 129855, expectedShare: 41, cefalixNewPatients: 38310, cefalixTotalPatients: 53241, netPrice: 350, netSales: 130441020 },
      2023: { eligiblePatients: 285924, dynamicPatients: 113492, patientsOnACGRP: 191586, expectedShare: 39, cefalixNewPatients: 44875, cefalixTotalPatients: 74718, netPrice: 350, netSales: 183058425 }
    }
  },
  restricted_8MMD_3TF: {
    label: ">8MMD +3TF",
    timeline: {
      2019: { eligiblePatients: 42626, dynamicPatients: 12014, patientsOnACGRP: 632, expectedShare: 50, cefalixNewPatients: 166, cefalixTotalPatients: 416, netPrice: 350, netSales: 291200 },
      2020: { eligiblePatients: 42666, dynamicPatients: 14334, patientsOnACGRP: 4021, expectedShare: 48, cefalixNewPatients: 2190, cefalixTotalPatients: 1930, netPrice: 350, netSales: 4728500 },
      2021: { eligiblePatients: 42733, dynamicPatients: 16547, patientsOnACGRP: 11195, expectedShare: 44, cefalixNewPatients: 4799, cefalixTotalPatients: 4926, netPrice: 350, netSales: 12068700 },
      2022: { eligiblePatients: 42782, dynamicPatients: 17509, patientsOnACGRP: 19507, expectedShare: 41, cefalixNewPatients: 5755, cefalixTotalPatients: 7998, netPrice: 350, netSales: 19595100 },
      2023: { eligiblePatients: 42932, dynamicPatients: 17041, patientsOnACGRP: 28767, expectedShare: 39, cefalixNewPatients: 6738, cefalixTotalPatients: 11219, netPrice: 350, netSales: 27486550 }
    }
  }
} as const;

export const MARKET_BASELINE = {
  2019: {
    population_18_65: 29438000,
    prevalence: 3709000,
    consultingPatients: 1854000,
    diagnosedPatients: 1242000,
    visitedByNeurologists: 403841,
    prophylacticTreated: 284854
  },
  2020: {
    population_18_65: 29322000,
    prevalence: 3694000,
    consultingPatients: 1847000,
    diagnosedPatients: 1237000,
    visitedByNeurologists: 404274,
    prophylacticTreated: 283921
  },
  2021: {
    population_18_65: 29221000,
    prevalence: 3681000,
    consultingPatients: 1840000,
    diagnosedPatients: 1239000,
    visitedByNeurologists: 404989,
    prophylacticTreated: 284424
  },
  2022: {
    population_18_65: 29126000,
    prevalence: 3669000,
    consultingPatients: 1834000,
    diagnosedPatients: 1242000,
    visitedByNeurologists: 405513,
    prophylacticTreated: 284792
  },
  2023: {
    population_18_65: 29031000,
    prevalence: 3658000,
    consultingPatients: 1829000,
    diagnosedPatients: 1243000,
    visitedByNeurologists: 407125,
    prophylacticTreated: 285924
  }
};

export const INITIAL_AREAS: Areas = {
  medical: 1,
  access: 1,
  commercial: 1,
  marketShaping: 1,
  confidence: 1,
  capacity: 1,
  risk: 2
};

export const ACTIONS: Action[] = [
  {
    id: "msl_team",
    title: "MSL team",
    category: "Medical",
    kind: "persistent_team",
    description: "Equipo médico científico en campo que trabaja con neurólogos y KOLs.",
    whyItMatters: "Necesita tiempo para generar relación, confianza y continuidad científica.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "5 MSLs", multiplier: 5, description: "Cobertura inicial" },
      medium: { label: "6 MSLs", multiplier: 6, description: "Cobertura amplia" },
      high: { label: "8 MSLs", multiplier: 8, description: "Cobertura reforzada" }
    },
    impacts: { medical: 12, confidence: 10 }
  },
  {
    id: "access_team",
    title: "Access team",
    category: "Access",
    kind: "persistent_team",
    description: "Equipo para comisiones, listing regional y hospitalario.",
    whyItMatters: "La velocidad de apertura es crítica.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "8 personas", multiplier: 8, description: "Base" },
      medium: { label: "12 personas", multiplier: 12, description: "Cobertura fuerte" },
      high: { label: "20 personas", multiplier: 20, description: "Despliegue masivo" }
    },
    impacts: { access: 16, capacity: 5 }
  },
  {
    id: "field_force",
    title: "Field force",
    category: "Commercial",
    kind: "persistent_team",
    description: "Delegados especializados con coste + presupuesto local incorporado.",
    whyItMatters: "Si el número es bajo, dejas territorio descubierto.",
    baseCost: 300000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "10 reps", multiplier: 10, description: "Cobertura limitada" },
      medium: { label: "20 reps", multiplier: 20, description: "Cobertura sólida" },
      high: { label: "30 reps", multiplier: 30, description: "Cobertura extendida" }
    },
    impacts: { commercial: 16, confidence: 3 }
  },
  {
    id: "innovation_managers",
    title: "Innovation / Territory Managers",
    category: "Innovation",
    kind: "persistent_team",
    description: "Perfiles en territorio centrados en patient journey, procesos asistenciales y proyectos hospitalarios.",
    whyItMatters: "Ayudan a desbloquear fricciones territoriales y acelerar transformación real del sistema.",
    baseCost: 120000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "2 personas", multiplier: 2, description: "Cobertura inicial" },
      medium: { label: "4 personas", multiplier: 4, description: "Cobertura media" },
      high: { label: "6 personas", multiplier: 6, description: "Cobertura amplia" }
    },
    impacts: { capacity: 10, access: 6, marketShaping: 4 }
  },
  {
    id: "migraine_impact_study",
    title: "Migraine impact study",
    category: "Innovation",
    kind: "one_off",
    description: "Estudio nacional sobre impacto de la migraña en España, útil para public affairs y narrativa.",
    whyItMatters: "Da una base sólida para construir legitimidad del problema y conversación pública.",
    baseCost: 200000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Estudio base", multiplier: 1, description: "Base" },
      medium: { label: "Estudio ampliado", multiplier: 1.25, description: "Más robusto" },
      high: { label: "Estudio premium", multiplier: 1.5, description: "Máxima profundidad" }
    },
    impacts: { marketShaping: 8, confidence: 5 }
  },
  {
    id: "public_affairs_actions",
    title: "Public affairs actions",
    category: "Innovation",
    kind: "annual_program",
    description: "Acciones locales de public affairs apoyadas en el estudio de impacto.",
    whyItMatters: "Ayudan a sostener narrativa y legitimidad institucional.",
    baseCost: 50000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "1 acción", multiplier: 1, description: "Base" },
      medium: { label: "5 acciones", multiplier: 5, description: "Media" },
      high: { label: "10 acciones", multiplier: 10, description: "Amplia" }
    },
    impacts: { marketShaping: 7, confidence: 4 }
  },
  {
    id: "patient_journey_improvement",
    title: "Patient journey improvement",
    category: "Journey",
    kind: "annual_program",
    description: "Programa de mejora de la ruta del paciente en hospitales.",
    whyItMatters: "Sin mejoras reales del journey, el funnel se queda muy por debajo del target teórico.",
    baseCost: 150000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "5 hospitales", multiplier: 1, description: "Piloto" },
      medium: { label: "10 hospitales", multiplier: 2, description: "Expansión" },
      high: { label: "20 hospitales", multiplier: 4, description: "Máximo anual" }
    },
    impacts: { capacity: 12, access: 5 }
  },
  {
    id: "neuroconnect",
    title: "NeuroConnect",
    category: "Access",
    kind: "annual_program",
    description: "Sesiones clínicas neurólogo-farmacéutico hospitalario.",
    whyItMatters: "Mejora alineación hospitalaria y acelera listing.",
    baseCost: 80000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "10 hospitales", multiplier: 1, description: "Base" },
      medium: { label: "25 hospitales", multiplier: 2.5, description: "Media" },
      high: { label: "50 hospitales", multiplier: 5, description: "Máxima" }
    },
    impacts: { access: 9, confidence: 4 }
  },
  {
    id: "regional_education_meetings",
    title: "Regional education meetings",
    category: "Medical",
    kind: "annual_program",
    description: "Programas de educación regional. Cada meeting cuesta 20k.",
    whyItMatters: "Refuerza visibilidad médica y capacidad de convicción territorial.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "5 meetings", multiplier: 1, description: "Base" },
      medium: { label: "10 meetings", multiplier: 2, description: "Media" },
      high: { label: "20 meetings", multiplier: 4, description: "Alta" }
    },
    impacts: { medical: 8, confidence: 4 }
  },
  {
    id: "international_expert_meetings",
    title: "Expert meetings from other countries",
    category: "Medical",
    kind: "annual_program",
    description: "Reuniones con expertos de otros países. Cada foro cuesta 100k.",
    whyItMatters: "Aporta credibilidad externa y presión científica comparada.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "1 meeting", multiplier: 1, description: "Base" },
      medium: { label: "2 meetings", multiplier: 2, description: "Media" },
      high: { label: "3 meetings", multiplier: 3, description: "Alta" }
    },
    impacts: { medical: 6, confidence: 6 }
  },
  {
    id: "clinical_studies",
    title: "Clinical studies",
    category: "Medical",
    kind: "annual_program",
    description: "Estudios clínicos y generación de evidencia científica local.",
    whyItMatters: "Fortalece el bloque médico-científico y la defensa del valor.",
    baseCost: 500000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "1 estudio", multiplier: 1, description: "Base" },
      medium: { label: "2 estudios", multiplier: 2, description: "Media" },
      high: { label: "4 estudios", multiplier: 4, description: "Alta" }
    },
    impacts: { medical: 12, confidence: 8 }
  },
  {
    id: "sen_congress",
    title: "Congreso SEN",
    category: "Patient",
    kind: "annual_program",
    description: "Presencia en el congreso nacional de neurología.",
    whyItMatters: "Da visibilidad nacional y refuerza la presencia de marca y narrativa.",
    baseCost: 500000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Presencia base", multiplier: 1, description: "Base" },
      medium: { label: "Presencia reforzada", multiplier: 1.2, description: "Media" },
      high: { label: "Presencia premium", multiplier: 1.5, description: "Alta" }
    },
    impacts: { marketShaping: 8, confidence: 5 }
  },
  {
    id: "product_samples",
    title: "Product samples for physicians",
    category: "Medical",
    kind: "annual_program",
    description: "Muestras de producto para uso y demostración con médicos.",
    whyItMatters: "Reduce fricción de uso y ayuda a visibilizar manejo del producto.",
    baseCost: 150000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "300 muestras", multiplier: 1, description: "Base" },
      medium: { label: "900 muestras", multiplier: 3, description: "Media" },
      high: { label: "1500 muestras", multiplier: 5, description: "Alta" }
    },
    impacts: { medical: 4, confidence: 5 }
  },
  {
    id: "social_digital_content",
    title: "Social / digital / content",
    category: "Patient",
    kind: "persistent_program",
    description: "Programa persistente de redes, web y contenido.",
    whyItMatters: "Construye presencia sostenida y acompaña la activación del mercado.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Base", multiplier: 1, description: "Base" },
      medium: { label: "Refuerzo", multiplier: 1.5, description: "Media" },
      high: { label: "Amplio", multiplier: 2, description: "Alta" }
    },
    impacts: { marketShaping: 7, confidence: 3 }
  },
  {
    id: "national_awareness_campaign",
    title: "National awareness campaign",
    category: "Patient",
    kind: "annual_program",
    description: "Campaña nacional de prevención y concienciación sobre migraña.",
    whyItMatters: "Puede empujar demanda, pero si access no está maduro también puede tensar al sistema.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Campaña básica", multiplier: 1, description: "Base" },
      medium: { label: "Campaña fuerte", multiplier: 2, description: "Media" },
      high: { label: "Campaña masiva", multiplier: 4, description: "Alta" }
    },
    impacts: { marketShaping: 10, confidence: 3, risk: 2 }
  },
  {
    id: "regional_campaigns",
    title: "Regional campaigns",
    category: "Patient",
    kind: "annual_program",
    description: "Campañas regionales orientadas a hospitales y territorios.",
    whyItMatters: "Permiten concentrar empuje en zonas clave y apoyar despliegue territorial.",
    baseCost: 200000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "10 campañas", multiplier: 1, description: "Base" },
      medium: { label: "20 campañas", multiplier: 2, description: "Media" },
      high: { label: "30 campañas", multiplier: 3, description: "Alta" }
    },
    impacts: { marketShaping: 8, commercial: 4 }
  },
  {
    id: "patient_app",
    title: "Patient app",
    category: "Patient",
    kind: "persistent_program",
    description: "App de seguimiento del paciente.",
    whyItMatters: "Puede aportar valor al ecosistema y sostener engagement, si se justifica su continuidad.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Básica", multiplier: 1, description: "Base" },
      medium: { label: "Reforzada", multiplier: 1.5, description: "Media" },
      high: { label: "Amplia", multiplier: 2, description: "Alta" }
    },
    impacts: { confidence: 6, capacity: 3 }
  },
  {
    id: "early_access_program",
    title: "Early Access Program",
    category: "Access",
    kind: "annual_program",
    description: "Programa de acceso temprano. 6.000 €/año por paciente más gestión.",
    whyItMatters: "Es una decisión estructural, no táctica: crea compromiso, presión y legitimidad.",
    baseCost: 600000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "100 pacientes", multiplier: 1, description: "Base" },
      medium: { label: "500 pacientes", multiplier: 5, description: "Media" },
      high: { label: "1000 pacientes", multiplier: 10, description: "Alta" }
    },
    impacts: { access: 10, confidence: 8, risk: 4 }
  },
  {
    id: "launch_training",
    title: "Launch training",
    category: "Commercial",
    kind: "one_off",
    description: "Launch meeting, formación regional y preparación comercial para la fase final.",
    whyItMatters: "Prepara al equipo para traducir cobertura en ejecución de lanzamiento.",
    baseCost: 300000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Base", multiplier: 1, description: "Base" },
      medium: { label: "Completo", multiplier: 1.25, description: "Media" },
      high: { label: "Intensivo", multiplier: 1.6, description: "Alta" }
    },
    impacts: { commercial: 8, confidence: 3 }
  },
  {
    id: "account_plans",
    title: "Account plans",
    category: "Commercial",
    kind: "annual_program",
    description: "Planes de cuenta y revisión territorial sobre hospitales y cuentas clave.",
    whyItMatters: "Mejora el foco y evita cobertura superficial.",
    baseCost: 80000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "120 cuentas", multiplier: 1, description: "Base" },
      medium: { label: "220 cuentas", multiplier: 1.4, description: "Media" },
      high: { label: "260 cuentas", multiplier: 1.8, description: "Alta" }
    },
    impacts: { commercial: 7, access: 3 }
  },
  {
    id: "home_delivery",
    title: "Home delivery",
    category: "Operations",
    kind: "annual_program",
    description: "Programa de entrega a domicilio con implicaciones logísticas y operativas.",
    whyItMatters: "Puede mejorar experiencia y continuidad, pero añade complejidad de operación.",
    baseCost: 100000,
    yearFrom: 2017,
    yearTo: 2020,
    levels: {
      low: { label: "Set-up", multiplier: 1, description: "Base" },
      medium: { label: "Piloto", multiplier: 1.5, description: "Media" },
      high: { label: "Amplio", multiplier: 2.2, description: "Alta" }
    },
    impacts: { capacity: 6, confidence: 4, risk: 1 }
  }
];
