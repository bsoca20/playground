const BUDGET = 12_000_000;
const TEAMS = ["Equipo A", "Equipo B", "Equipo C"];
const TEAM_COLORS = ["#4f8ef7", "#10d9a0", "#f59e0b"];
const NET_PRICE_YEAR = 3468;
const TARGET_PATIENTS = 3254;

const AREAS = [
  {
    key: "medical",
    label: "Medical y MSL",
    icon: "🧬",
    max: 3_000_000,
    step: 100_000,
    weight: 0.2,
    desc: "Preparación científica, KOL engagement, workshops y legitimidad clínica temprana."
  },
  {
    key: "access",
    label: "Access hospitalario",
    icon: "🏛",
    max: 2_500_000,
    step: 100_000,
    weight: 0.2,
    desc: "Listing, champions, farmacia hospitalaria y velocidad regional de acceso."
  },
  {
    key: "field",
    label: "Field force y targeting",
    icon: "👥",
    max: 2_500_000,
    step: 100_000,
    weight: 0.17,
    desc: "Cobertura de neurólogos, secuencia de visitas y conversión por tier."
  },
  {
    key: "activation",
    label: "Patient activation",
    icon: "📣",
    max: 1_500_000,
    step: 50_000,
    weight: 0.11,
    desc: "Activación del paciente correcto, awareness y demanda de prevención."
  },
  {
    key: "journey",
    label: "Patient journey / WinMIG",
    icon: "🧭",
    max: 1_300_000,
    step: 50_000,
    weight: 0.1,
    desc: "Rediseño del funnel desde AP y urgencias hasta neurología y tratamiento."
  },
  {
    key: "rwe",
    label: "RWE y servicios",
    icon: "🔬",
    max: 1_300_000,
    step: 50_000,
    weight: 0.12,
    desc: "RWExp, publicaciones, NeuroConnect y servicios de valor añadido."
  },
  {
    key: "private",
    label: "Private market",
    icon: "🏥",
    max: 900_000,
    step: 50_000,
    weight: 0.1,
    desc: "Pilotos OOP, hospitales privados, aprendizaje de captura temprana y servicio."
  }
];

const SCENARIOS = [
  {
    id: "advantaged",
    title: "First Mover Ventajoso",
    tag: "e",
    tagLabel: "Favorable",
    desc: "Cefalix llega con fuerte momentum prelaunch, LenovoBio retrasa su despliegue comercial y TeraHead aún no presiona tanto en precio.",
    market: 52_000,
    priceMult: 1,
    competition: 0.86,
    accessFriction: 0.9,
    note: "Ideal para capturar neurólogos y acelerar listing."
  },
  {
    id: "base",
    title: "Caso Base",
    tag: "m",
    tagLabel: "Moderado",
    desc: "El funnel launchable real se sitúa cerca de 42.000 pacientes. La competencia entra, pero el ganador sigue dependiendo de la orquestación.",
    market: 42_000,
    priceMult: 1,
    competition: 1,
    accessFriction: 1,
    note: "La referencia principal del business case."
  },
  {
    id: "squeezed",
    title: "Acceso y Competencia Tensos",
    tag: "h",
    tagLabel: "Difícil",
    desc: "Hospitales más lentos, TeraHead más agresivo en acceso y LenovoBio gana tracción de mensaje. El funnel se comprime y el listing tarda.",
    market: 30_000,
    priceMult: 0.94,
    competition: 1.2,
    accessFriction: 1.18,
    note: "Medical, access y journey pasan a ser críticos."
  }
];

const YEAR_CONTEXT = [
  {
    label: "Año 1",
    phase: "Market Shaping (T-24 a T-12)",
    badge: "AÑO 1 · MARKET SHAPING",
    text:
      "Cefalix aún no compite por cuota visible, compite por preparar el sistema. La prioridad es medical temprano, capturar RWExp, activar KOLs y empezar a desbloquear hospitales y journey."
  },
  {
    label: "Año 2",
    phase: "Pre-Launch Scale (T-12 a T0)",
    badge: "AÑO 2 · PRE-LAUNCH SCALE",
    text:
      "Se acelera field force, se segmenta HCP por tiers y la velocidad de listing importa. Las decisiones de access y patient activation determinan cuántos pacientes llegan realmente al launch."
  },
  {
    label: "Año 3",
    phase: "Launch y Defensa",
    badge: "AÑO 3 · LAUNCH Y DEFENSA",
    text:
      "Cefalix ya está en el mercado. Ahora toca convertir preparación en pacientes, sostener primera elección, abrir más centros y defender el espacio frente a LenovoBio y TeraHead."
  }
];

const PRESET_EVENTS = [
  {
    label: "Publicación RWE fuerte",
    type: "positive",
    impact: () => {
      STATE.marketMomentum = Math.min(STATE.marketMomentum * 1.08, 1.45);
      STATE.firstMover = Math.min(STATE.firstMover + 0.08, 1.35);
      return "Cefalix publica RWE robusto y acelera confianza clínica, listings y velocidad de primera receta.";
    }
  },
  {
    label: "TeraHead acelera acceso",
    type: "negative",
    impact: () => {
      STATE.pricePressure = Math.max(STATE.pricePressure * 0.95, 0.78);
      STATE.competitionShock = Math.min(STATE.competitionShock + 0.08, 1.35);
      return "TeraHead gana tracción con acceso táctico y obliga a defender hospitales donde Cefalix aún no consolidó preferencia.";
    }
  },
  {
    label: "LenovoBio activa campaña médica",
    type: "neutral",
    impact: () => {
      STATE.competitionShock = Math.min(STATE.competitionShock + 0.05, 1.35);
      return "LenovoBio entra con mensaje médico más visible. La categoría se expande, pero también sube la presión competitiva.";
    }
  },
  {
    label: "WinMIG desbloquea derivación",
    type: "positive",
    impact: () => {
      STATE.marketMomentum = Math.min(STATE.marketMomentum * 1.06, 1.45);
      return "El journey mejora y el funnel desde AP y urgencias entrega más pacientes elegibles a neurología.";
    }
  },
  {
    label: "Restricción hospitalaria regional",
    type: "negative",
    impact: () => {
      STATE.marketMomentum = Math.max(STATE.marketMomentum * 0.93, 0.7);
      return "Varias comisiones hospitalarias endurecen el acceso y retrasan nuevas aperturas para Cefalix.";
    }
  },
  {
    label: "Private market aprende rápido",
    type: "positive",
    impact: () => {
      STATE.firstMover = Math.min(STATE.firstMover + 0.05, 1.35);
      return "Los pilotos privados aportan aprendizaje de pricing y servicio, mejorando captura temprana y narrativa comercial.";
    }
  }
];

let STATE = {
  year: 1,
  team: 0,
  scenario: 1,
  alloc: TEAMS.map(() => Object.fromEntries(AREAS.map((area) => [area.key, 0]))),
  submitted: TEAMS.map(() => Array(3).fill(false)),
  history: TEAMS.map(() => []),
  events: [],
  marketMomentum: 1,
  pricePressure: 1,
  firstMover: 1,
  competitionShock: 1
};

let shareChart = null;
let salesChart = null;

function init() {
  bindTabs();
  bindTeams();
  bindControls();
  buildSliders();
  buildTimeline();
  buildScenarios();
  buildVariableGrid();
  renderPresetEvents();
  renderCompTable();
  syncContext();
  renderTeamStatus();
  updateProjection();
  renderKpis();
  renderRanking();
  renderComparisonTable();
  renderInvestmentBars();
  renderDecisionAnalysis();
  initCharts();
}

function bindTabs() {
  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => showTab(button.dataset.tabTarget));
  });
}

function bindTeams() {
  document.querySelectorAll(".tpill").forEach((button) => {
    button.addEventListener("click", () => selectTeam(Number(button.dataset.team)));
  });
}

function bindControls() {
  document.getElementById("confirm-btn").addEventListener("click", openModal);
  document.getElementById("reset-btn").addEventListener("click", resetAllocation);
  document.getElementById("advance-btn").addEventListener("click", advanceYear);
  document.getElementById("reset-all-btn").addEventListener("click", resetAll);
  document.getElementById("publish-btn").addEventListener("click", publishEvent);
  document.getElementById("modal-cancel").addEventListener("click", closeModal);
  document.getElementById("modal-ok").addEventListener("click", submitDecision);
}

function showTab(name) {
  document.querySelectorAll(".panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `panel-${name}`);
  });
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === name);
  });
  if (name === "resultados") {
    updateCharts();
    renderInvestmentBars();
  }
  if (name === "ranking") {
    renderRanking();
    renderComparisonTable();
    renderDecisionAnalysis();
  }
}

function selectTeam(index) {
  STATE.team = index;
  document.querySelectorAll(".tpill").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.team) === index);
  });
  buildSliders();
  updateProjection();
}

function buildTimeline() {
  const timeline = document.getElementById("year-timeline");
  timeline.innerHTML = YEAR_CONTEXT.map((entry, index) => {
    const year = index + 1;
    const stateClass = year < STATE.year ? "done" : year === STATE.year ? "current" : "locked";
    const prefix = year < STATE.year ? "✓" : year === STATE.year ? "▶" : "🔒";
    return `
      <div class="tl-step ${stateClass}">
        <div>${prefix} ${entry.label}</div>
        <div class="tl-label">${entry.phase}</div>
      </div>
    `;
  }).join("");
}

function buildSliders() {
  const wrap = document.getElementById("sliders");
  const alloc = STATE.alloc[STATE.team];
  wrap.innerHTML = AREAS.map((area) => {
    const value = alloc[area.key] || 0;
    return `
      <div class="area-row">
        <div class="area-top">
          <div class="area-name"><span>${area.icon}</span>${area.label}</div>
          <div class="area-amount" id="av-${area.key}">${formatCurrency(value)}</div>
        </div>
        <input type="range" min="0" max="${area.max}" step="${area.step}" value="${value}" data-slider="${area.key}">
        <div class="range-labels"><span>€0</span><span>${formatShortCurrency(area.max)}</span></div>
        <div class="area-desc">${area.desc}</div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-slider]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const key = event.target.dataset.slider;
      const value = Number(event.target.value);
      STATE.alloc[STATE.team][key] = value;
      document.getElementById(`av-${key}`).textContent = formatCurrency(value);
      updateBudgetBar();
      updateProjection();
      updateInvestmentTable();
    });
  });

  updateBudgetBar();
  updateInvestmentTable();
}

function updateBudgetBar() {
  const total = sumObject(STATE.alloc[STATE.team]);
  const remaining = BUDGET - total;
  document.getElementById("bval").textContent = formatCurrency(remaining);
  document.getElementById("bassigned").textContent = formatCurrency(total);
  document.getElementById("bbar").classList.toggle("over", remaining < 0);
}

function resetAllocation() {
  STATE.alloc[STATE.team] = Object.fromEntries(AREAS.map((area) => [area.key, 0]));
  buildSliders();
  updateProjection();
}

function normalizedAreaScore(teamIndex, areaKey) {
  const area = AREAS.find((item) => item.key === areaKey);
  const value = STATE.alloc[teamIndex][areaKey] || 0;
  return Math.min(Math.sqrt(value / area.max || 0), 1);
}

function teamScores(teamIndex) {
  const scenario = SCENARIOS[STATE.scenario];
  const medical = normalizedAreaScore(teamIndex, "medical");
  const access = normalizedAreaScore(teamIndex, "access");
  const field = normalizedAreaScore(teamIndex, "field");
  const activation = normalizedAreaScore(teamIndex, "activation");
  const journey = normalizedAreaScore(teamIndex, "journey");
  const rwe = normalizedAreaScore(teamIndex, "rwe");
  const privateMarket = normalizedAreaScore(teamIndex, "private");

  const listing = clamp((access * 0.48 + medical * 0.17 + rwe * 0.15 + journey * 0.2) * 100 / scenario.accessFriction, 0, 100);
  const demand = clamp((activation * 0.4 + journey * 0.33 + privateMarket * 0.12 + medical * 0.15) * 100 * STATE.marketMomentum, 0, 100);
  const conversion = clamp((field * 0.45 + medical * 0.22 + access * 0.18 + rwe * 0.15) * 100 / scenario.competition, 0, 100);
  const differentiation = clamp((medical * 0.36 + rwe * 0.3 + field * 0.16 + activation * 0.08 + privateMarket * 0.1) * 100 * STATE.firstMover / STATE.competitionShock, 0, 100);
  const alignment = clamp((medical + access + field + activation + journey + rwe + privateMarket) / 7 * 100, 0, 100);

  return { listing, demand, conversion, differentiation, alignment };
}

function launchStrength(teamIndex, year) {
  const yearFactor = [0.42, 0.75, 1][year - 1] || 1;
  const scores = teamScores(teamIndex);
  return clamp(
    (scores.listing * 0.24 +
      scores.demand * 0.16 +
      scores.conversion * 0.24 +
      scores.differentiation * 0.2 +
      scores.alignment * 0.16) *
      yearFactor,
    0,
    99
  );
}

function marketShare(teamIndex, year) {
  const scenario = SCENARIOS[STATE.scenario];
  const strength = launchStrength(teamIndex, year);
  const privateBoost = normalizedAreaScore(teamIndex, "private") * 2.2;
  const launchShare = clamp((strength * 0.38 + privateBoost + 4) / scenario.competition, 0, 52);
  return launchShare;
}

function yearlyPatients(teamIndex, year) {
  const scenario = SCENARIOS[STATE.scenario];
  const scores = teamScores(teamIndex);
  const shareValue = marketShare(teamIndex, year) / 100;
  const patients =
    scenario.market *
    shareValue *
    (0.54 + scores.listing / 250 + scores.demand / 350 + scores.conversion / 300);
  return Math.round(clamp(patients, 0, TARGET_PATIENTS * 1.9));
}

function yearlyRevenue(teamIndex, year) {
  const scenario = SCENARIOS[STATE.scenario];
  const patients = yearlyPatients(teamIndex, year);
  return patients * NET_PRICE_YEAR * scenario.priceMult * STATE.pricePressure;
}

function updateProjection() {
  const currentTotal = sumObject(STATE.alloc[STATE.team]);
  if (currentTotal === 0) {
    ["proj-strength", "proj-s1", "proj-pac", "proj-roi"].forEach((id) => {
      document.getElementById(id).textContent = "—";
    });
    document.getElementById("alerts-panel").innerHTML =
      '<div class="alert-item alert-info">Asigna presupuesto para ver proyecciones del caso.</div>';
    updateInvestmentTable();
    renderCompetitorBars(0);
    return;
  }

  const strength = launchStrength(STATE.team, 3);
  const yearRevenue = yearlyRevenue(STATE.team, STATE.year);
  const yearPatients = yearlyPatients(STATE.team, STATE.year);
  const roi = ((yearRevenue - currentTotal) / currentTotal) * 100;

  document.getElementById("proj-strength").textContent = `${strength.toFixed(0)}`;
  document.getElementById("proj-s1").textContent = formatMillionCurrency(yearRevenue);
  document.getElementById("proj-pac").textContent = yearPatients.toLocaleString("es-ES");
  document.getElementById("proj-roi").textContent = `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%`;
  document.getElementById("proj-roi").style.color = roi >= 0 ? "var(--green)" : "var(--red)";

  buildAlerts(STATE.team, currentTotal);
  updateInvestmentTable();
  renderCompetitorBars(marketShare(STATE.team, STATE.year));
}

function buildAlerts(teamIndex, total) {
  const alloc = STATE.alloc[teamIndex];
  const alerts = [];

  if (total > BUDGET) {
    alerts.push({ type: "danger", message: "Presupuesto excedido: la estrategia necesita recorte antes de ser validada." });
  }
  if ((alloc.access || 0) < 900_000) {
    alerts.push({ type: "danger", message: "Access hospitalario insuficiente: riesgo alto de listing lento y apertura tardía." });
  }
  if ((alloc.medical || 0) < 1_000_000) {
    alerts.push({ type: "warn", message: "Medical corto para el caso: se resiente la legitimidad temprana y la velocidad de first Rx." });
  }
  if ((alloc.field || 0) < 1_200_000 && STATE.year > 1) {
    alerts.push({ type: "warn", message: "Field force por debajo de lo necesario para capturar tiers altos antes del launch." });
  }
  if ((alloc.journey || 0) < 500_000) {
    alerts.push({ type: "warn", message: "Sin trabajo de patient journey, el funnel real queda por debajo del potencial del mercado." });
  }
  if ((alloc.rwe || 0) > 700_000) {
    alerts.push({ type: "ok", message: "RWE y servicios bien cubiertos: mejoran diferenciación, credibilidad y defensa competitiva." });
  }
  if ((alloc.access || 0) > 1_600_000) {
    alerts.push({ type: "ok", message: "Access fuerte: buena probabilidad de fast-track listing y champions hospitalarios." });
  }
  if ((alloc.private || 0) > 350_000) {
    alerts.push({ type: "info", message: "El private market añade aprendizaje táctico y captura temprana, pero no sustituye al acceso público." });
  }

  const classByType = {
    danger: "alert-danger",
    warn: "alert-warn",
    ok: "alert-ok",
    info: "alert-info"
  };

  document.getElementById("alerts-panel").innerHTML = alerts.length
    ? alerts.map((alert) => `<div class="alert-item ${classByType[alert.type]}">${alert.message}</div>`).join("")
    : '<div class="alert-item alert-ok">Plan equilibrado para el caso seleccionado.</div>';
}

function updateInvestmentTable() {
  const alloc = STATE.alloc[STATE.team];
  const total = Math.max(sumObject(alloc), 1);
  const impactMap = {
    medical: (value) => (value > 1_700_000 ? "Autoridad científica alta" : value > 800_000 ? "Base médica sólida" : value > 0 ? "Cobertura limitada" : "Sin preparación médica"),
    access: (value) => (value > 1_600_000 ? "Listing acelerado" : value > 900_000 ? "Apertura razonable" : value > 0 ? "Fricción alta" : "Riesgo crítico"),
    field: (value) => (value > 1_800_000 ? "Cobertura tier 1 fuerte" : value > 1_000_000 ? "Cobertura media" : value > 0 ? "Conversión lenta" : "Sin captura comercial"),
    activation: (value) => (value > 800_000 ? "Awareness visible" : value > 300_000 ? "Activación parcial" : value > 0 ? "Señal débil" : "Paciente pasivo"),
    journey: (value) => (value > 700_000 ? "Journey desbloqueado" : value > 300_000 ? "Mejora parcial" : value > 0 ? "Impacto acotado" : "Funnel rígido"),
    rwe: (value) => (value > 800_000 ? "RWE robusto" : value > 300_000 ? "Base de evidencia" : value > 0 ? "Datos limitados" : "Sin soporte diferencial"),
    private: (value) => (value > 400_000 ? "Gain & learn potente" : value > 150_000 ? "Piloto útil" : value > 0 ? "Presencia táctica" : "Sin palanca privada")
  };

  document.getElementById("inv-table").innerHTML = AREAS.map((area) => {
    const value = alloc[area.key] || 0;
    const pct = ((value / total) * 100).toFixed(1);
    return `
      <tr>
        <td>${area.icon} ${area.label}</td>
        <td class="mono">${formatCurrency(value)}</td>
        <td class="mono">${pct}%</td>
        <td>${impactMap[area.key](value)}</td>
      </tr>
    `;
  }).join("");
}

function openModal() {
  const total = sumObject(STATE.alloc[STATE.team]);
  const title = document.getElementById("m-title");
  const body = document.getElementById("m-body");
  const okButton = document.getElementById("modal-ok");

  if (total > BUDGET) {
    title.textContent = "Presupuesto excedido";
    body.textContent = `Has asignado ${formatCurrency(total)}, por encima del límite de ${formatCurrency(BUDGET)}. Ajusta antes de confirmar.`;
    okButton.style.display = "none";
  } else {
    const projectedShare = marketShare(STATE.team, STATE.year);
    title.textContent = `Confirmar decisiones · ${TEAMS[STATE.team]} · Año ${STATE.year}`;
    body.textContent = `Total asignado: ${formatCurrency(total)}. La proyección de cuota para el año actual es ${projectedShare.toFixed(1)}% y el launch strength a Año 3 es ${launchStrength(STATE.team, 3).toFixed(0)}.`;
    okButton.style.display = "inline-block";
  }

  document.getElementById("modal").classList.add("open");
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
}

function submitDecision() {
  const team = STATE.team;
  const yearIndex = STATE.year - 1;
  const total = sumObject(STATE.alloc[team]);
  STATE.submitted[team][yearIndex] = true;
  STATE.history[team][yearIndex] = {
    year: STATE.year,
    alloc: { ...STATE.alloc[team] },
    share: Number(marketShare(team, STATE.year).toFixed(1)),
    revenue: yearlyRevenue(team, STATE.year),
    patients: yearlyPatients(team, STATE.year),
    total,
    strength: Number(launchStrength(team, STATE.year).toFixed(0))
  };
  addEvent(
    "positive",
    `${TEAMS[team]} confirmó Año ${STATE.year}. Launch strength ${launchStrength(team, STATE.year).toFixed(0)} y ${yearlyPatients(team, STATE.year).toLocaleString("es-ES")} pacientes proyectados.`
  );
  closeModal();
  renderTeamStatus();
  renderKpis();
  updateCharts();
  renderInvestmentBars();
  renderRanking();
}

function advanceYear() {
  if (STATE.year >= 3) {
    window.alert("La simulación ya completó los 3 años del caso.");
    return;
  }
  STATE.year += 1;
  syncContext();
  buildTimeline();
  addEvent("neutral", `El facilitador avanza a ${YEAR_CONTEXT[STATE.year - 1].label}: ${YEAR_CONTEXT[STATE.year - 1].phase}.`);
  renderTeamStatus();
  updateProjection();
}

function syncContext() {
  const ctx = YEAR_CONTEXT[STATE.year - 1];
  document.getElementById("round-badge").textContent = ctx.badge;
  document.getElementById("ctx-year").textContent = STATE.year;
  document.getElementById("ctx-phase").textContent = ctx.phase;
  document.getElementById("ctx-text").textContent = ctx.text;
  document.getElementById("fac-year").textContent = `${ctx.label} — ${ctx.phase}`;
  document.getElementById("fac-phase").textContent = ctx.text;
  document.getElementById("confirm-year-lbl").textContent = STATE.year;
}

function publishEvent() {
  const type = document.getElementById("ev-type").value;
  const text = document.getElementById("ev-text").value.trim();
  if (!text) {
    return;
  }
  if (type === "positive") {
    STATE.marketMomentum = Math.min(STATE.marketMomentum * 1.06, 1.45);
  }
  if (type === "negative") {
    STATE.marketMomentum = Math.max(STATE.marketMomentum * 0.94, 0.7);
  }
  addEvent(type, text);
  document.getElementById("ev-text").value = "";
  updateProjection();
  updateCharts();
}

function addEvent(type, text) {
  STATE.events.unshift({ type, text, year: STATE.year });
  const log = document.getElementById("elog");
  const item = document.createElement("div");
  item.className = `eitem ${type}`;
  item.innerHTML = `<span class="etag">Año ${STATE.year}</span><span>${text}</span>`;
  log.prepend(item);
  while (log.children.length > 18) {
    log.removeChild(log.lastChild);
  }
}

function renderPresetEvents() {
  document.getElementById("preset-events").innerHTML = PRESET_EVENTS.map((event, index) => {
    return `<button class="btn btn-ghost preset-btn" data-preset="${index}">${event.label}</button>`;
  }).join("");

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const preset = PRESET_EVENTS[Number(button.dataset.preset)];
      const message = preset.impact();
      addEvent(preset.type, message);
      updateProjection();
      updateCharts();
    });
  });
}

function renderKpis() {
  const team = STATE.team;
  const history = STATE.history[team].filter(Boolean);
  const latest = history[history.length - 1];
  const accumulatedRevenue = history.reduce((sum, item) => sum + item.revenue, 0);
  const accumulatedInvestment = history.reduce((sum, item) => sum + item.total, 0);
  const roi = accumulatedInvestment ? ((accumulatedRevenue - accumulatedInvestment) / accumulatedInvestment) * 100 : 0;

  const cards = [
    { label: "Cuota actual", value: latest ? `${latest.share.toFixed(1)}%` : "—", color: "var(--green)", sub: "% del target capturable" },
    { label: "Ingresos netos acum.", value: latest ? formatMillionCurrency(accumulatedRevenue) : "—", color: "#60a5fa", sub: "Ventas estimadas" },
    { label: "Pacientes acum.", value: latest ? history.reduce((sum, item) => sum + item.patients, 0).toLocaleString("es-ES") : "—", color: "var(--amber)", sub: "Pacientes tratados" },
    { label: "ROI acumulado", value: latest ? `${roi >= 0 ? "+" : ""}${roi.toFixed(0)}%` : "—", color: roi >= 0 ? "var(--green)" : "var(--red)", sub: "Retorno sobre inversión" }
  ];

  document.getElementById("kpi-row").innerHTML = cards
    .map(
      (card) => `
        <div class="card">
          <div class="card-header">${card.label}</div>
          <div class="card-val small-val" style="color:${card.color}">${card.value}</div>
          <div class="card-sub">${card.sub}</div>
        </div>
      `
    )
    .join("");
}

function initCharts() {
  if (typeof Chart === "undefined") {
    return;
  }
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#5a6480",
          font: { family: "DM Mono", size: 10 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#5a6480", font: { family: "DM Mono", size: 10 } },
        grid: { color: "rgba(255,255,255,0.04)" }
      },
      y: {
        ticks: { color: "#5a6480", font: { family: "DM Mono", size: 10 } },
        grid: { color: "rgba(255,255,255,0.04)" }
      }
    }
  };

  shareChart = new Chart(document.getElementById("chart-share"), {
    type: "line",
    data: { labels: ["Año 1", "Año 2", "Año 3"], datasets: [] },
    options: baseOptions
  });

  salesChart = new Chart(document.getElementById("chart-sales"), {
    type: "bar",
    data: { labels: ["Año 1", "Año 2", "Año 3"], datasets: [] },
    options: baseOptions
  });
}

function updateCharts() {
  if (!shareChart || !salesChart) {
    return;
  }
  shareChart.data.datasets = TEAMS.map((team, index) => ({
    label: team,
    data: [1, 2, 3].map((year) => STATE.history[index][year - 1]?.share ?? null),
    borderColor: TEAM_COLORS[index],
    backgroundColor: `${TEAM_COLORS[index]}22`,
    fill: true,
    tension: 0.35,
    pointRadius: 4
  }));

  salesChart.data.datasets = TEAMS.map((team, index) => ({
    label: team,
    data: [1, 2, 3].map((year) => {
      const item = STATE.history[index][year - 1];
      return item ? Number((item.revenue / 1e6).toFixed(2)) : null;
    }),
    backgroundColor: `${TEAM_COLORS[index]}99`,
    borderColor: TEAM_COLORS[index],
    borderWidth: 1,
    borderRadius: 4
  }));

  shareChart.update();
  salesChart.update();
}

function renderInvestmentBars() {
  const alloc = STATE.alloc[STATE.team];
  const max = Math.max(...Object.values(alloc), 1);
  document.getElementById("invest-bars").innerHTML = AREAS.map((area) => {
    const value = alloc[area.key] || 0;
    const width = ((value / max) * 100).toFixed(0);
    const pct = ((value / BUDGET) * 100).toFixed(1);
    return `
      <div class="prow">
        <div class="prow-label">${area.icon} ${area.label}</div>
        <div class="ptrack"><div class="pfill" style="width:${width}%;background:${value > 0 ? "var(--accent)" : "rgba(255,255,255,0.06)"}"></div></div>
        <div class="pval">${pct}%</div>
      </div>
    `;
  }).join("");
}

function renderRanking() {
  const ranking = TEAMS.map((name, index) => {
    const history = STATE.history[index].filter(Boolean);
    const last = history[history.length - 1];
    const shareValue = last ? last.share : 0;
    const revenue = history.reduce((sum, item) => sum + item.revenue, 0);
    const investment = history.reduce((sum, item) => sum + item.total, 0);
    const roi = investment ? ((revenue - investment) / investment) * 100 : 0;
    return { name, index, share: shareValue, roi };
  }).sort((a, b) => b.share - a.share);

  const medals = ["🥇", "🥈", "🥉"];
  document.getElementById("rank-cards").innerHTML = ranking
    .map(
      (entry, position) => `
        <div class="rank-card">
          <div class="rank-medal">${medals[position]}</div>
          <div class="rank-name" style="color:${TEAM_COLORS[entry.index]}">${entry.name}</div>
          <div class="rank-val" style="color:${TEAM_COLORS[entry.index]}">${entry.share.toFixed(1)}%</div>
          <div class="rank-sub">Cuota del mercado capturable</div>
          <div class="btn-row">
            <span class="chip ${entry.roi >= 0 ? "chip-g" : "chip-r"}">ROI ${entry.roi >= 0 ? "+" : ""}${entry.roi.toFixed(0)}%</span>
            <span class="chip chip-b">Año ${STATE.year}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderComparisonTable() {
  document.getElementById("cmp-body").innerHTML = AREAS.map((area) => {
    const values = TEAMS.map((_, index) => STATE.alloc[index][area.key] || 0);
    const max = Math.max(...values);
    return `
      <tr>
        <td>${area.icon} ${area.label}</td>
        ${values
          .map(
            (value, index) =>
              `<td class="mono" style="color:${value === max && value > 0 ? TEAM_COLORS[index] : "var(--text)"}">${formatCurrency(value)}</td>`
          )
          .join("")}
      </tr>
    `;
  }).join("");
}

function renderDecisionAnalysis() {
  const items = TEAMS.map((name, index) => {
    const alloc = STATE.alloc[index];
    const total = sumObject(alloc);
    if (!total) {
      return null;
    }
    const accessPct = ((alloc.access || 0) / total) * 100;
    const medicalPct = ((alloc.medical || 0) / total) * 100;
    const fieldPct = ((alloc.field || 0) / total) * 100;
    const journeyPct = ((alloc.journey || 0) / total) * 100;

    let message = "";
    let type = "alert-ok";

    if (accessPct < 16) {
      message = `${name} invierte poco en access (${accessPct.toFixed(0)}%). Puede generar retraso de listing y pérdida de cuentas clave.`;
      type = "alert-danger";
    } else if (medicalPct < 18) {
      message = `${name} va corto en medical (${medicalPct.toFixed(0)}%). El caso castiga mucho esa decisión antes del launch.`;
      type = "alert-warn";
    } else if (journeyPct < 6) {
      message = `${name} apenas trabaja el patient journey. Puede tener un target teórico grande, pero un funnel real pequeño.`;
      type = "alert-info";
    } else if (fieldPct > 30 && accessPct < 20) {
      message = `${name} empuja field antes de asegurar access. Estrategia intensa, pero con riesgo de baja conversión estructural.`;
      type = "alert-info";
    } else {
      message = `${name} presenta una mezcla bastante coherente para convertir preparación en first choice.`;
    }
    return `<div class="alert-item ${type}">${message}</div>`;
  }).filter(Boolean);

  document.getElementById("decision-analysis").innerHTML =
    items.join("") || '<div class="alert-item alert-info">Confirma decisiones para ver lectura comparada.</div>';
}

function renderTeamStatus() {
  document.getElementById("team-status").innerHTML = TEAMS.map((name, index) => {
    const done = STATE.submitted[index][STATE.year - 1];
    const shareValue = STATE.history[index][STATE.year - 1]?.share;
    return `
      <div class="hl">
        <div>
          <div style="font-weight:600;color:${TEAM_COLORS[index]};font-size:0.85rem;">${name}</div>
          <div class="card-sub">Año ${STATE.year}: ${shareValue !== undefined ? `${shareValue.toFixed(1)}% share` : "pendiente"}</div>
        </div>
        <div style="font-size:0.78rem;font-weight:600;color:${done ? "var(--green)" : "var(--red)"};">
          ${done ? "✓ Confirmado" : "⏳ Pendiente"}
        </div>
      </div>
    `;
  }).join("");
}

function buildScenarios() {
  document.getElementById("sc-cards").innerHTML = SCENARIOS.map((scenario, index) => {
    return `
      <div class="sc-card ${index === STATE.scenario ? "sel" : ""}" data-scenario="${index}">
        <div class="sc-title">${scenario.title}</div>
        <div class="sc-desc">${scenario.desc}</div>
        <div><span class="sc-tag tag-${scenario.tag}">${scenario.tagLabel}</span></div>
        <div class="btn-row" style="margin-top:0.7rem;flex-wrap:wrap;">
          <span class="chip chip-b">${scenario.market.toLocaleString("es-ES")} pac.</span>
          <span class="chip ${scenario.priceMult >= 1 ? "chip-g" : "chip-r"}">precio x${scenario.priceMult.toFixed(2)}</span>
          <span class="chip ${scenario.competition <= 1 ? "chip-g" : "chip-r"}">competencia x${scenario.competition.toFixed(2)}</span>
        </div>
        <div class="card-sub" style="margin-top:0.5rem;">${scenario.note}</div>
      </div>
    `;
  }).join("");

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      STATE.scenario = Number(button.dataset.scenario);
      updateScenarioReadout();
      buildScenarios();
      updateProjection();
    });
  });

  updateScenarioReadout();
}

function updateScenarioReadout() {
  const scenario = SCENARIOS[STATE.scenario];
  document.getElementById("mkt-target").textContent = scenario.market.toLocaleString("es-ES");
  document.getElementById("p-mkt").textContent = `${scenario.market.toLocaleString("es-ES")} pac.`;
  document.getElementById("price-display").textContent = formatCurrency(Math.round(NET_PRICE_YEAR * scenario.priceMult));
  document.getElementById("p-price").textContent = formatCurrency(Math.round(NET_PRICE_YEAR * scenario.priceMult));
  document.getElementById("p-fma").textContent = scenario.competition < 1 ? "Alto" : scenario.competition > 1 ? "Presionado" : "Medio";
}

function buildVariableGrid() {
  const groups = [
    {
      title: "Medical",
      icon: "🧬",
      items: ["MSLs tempranos", "RWExp y workshops", "KOL activation", "FAQs científicas", "Patient profiling"]
    },
    {
      title: "Access",
      icon: "🏛",
      items: ["Listing hospitalario", "Champions por centro", "MAP pipeline", "Regional access", "Pharmacy engagement"]
    },
    {
      title: "Commercial",
      icon: "👥",
      items: ["Segmentación por tiers", "3-6-9 calls", "Cobertura target", "Field ramp-up", "Conversión a first Rx"]
    },
    {
      title: "Patient Activation",
      icon: "📣",
      items: ["Belief", "Confidence", "Action", "Knowledge", "Prevención como conversación"]
    },
    {
      title: "Journey",
      icon: "🧭",
      items: ["Derivación AP", "Urgencias", "Lista de espera", "Tiempo a neurólogo", "Cuellos de botella"]
    },
    {
      title: "Private Market",
      icon: "🏥",
      items: ["Self-pay", "Pilotos premium", "Hospitales privados", "Home delivery", "Gain & learn"]
    }
  ];

  document.getElementById("var-grid").innerHTML = groups
    .map(
      (group) => `
        <div class="card">
          <div class="card-header">${group.icon} ${group.title}</div>
          ${group.items.map((item) => `<div class="card-sub" style="padding:0.24rem 0;border-bottom:1px solid rgba(255,255,255,0.03);">· ${item}</div>`).join("")}
        </div>
      `
    )
    .join("");
}

function renderCompetitorBars(cefalixShareValue) {
  const scenario = SCENARIOS[STATE.scenario];
  const lenovo = clamp(27 * scenario.competition + (1 - STATE.firstMover) * 10, 14, 42);
  const terahead = clamp(24 * scenario.competition + (1 - STATE.pricePressure) * 14, 14, 40);
  const others = clamp(100 - cefalixShareValue - lenovo - terahead, 6, 38);

  const data = [
    { name: "Cefalix", value: cefalixShareValue, color: "var(--cefalix)" },
    { name: "LenovoBio", value: lenovo, color: "var(--lenovo)" },
    { name: "TeraHead", value: terahead, color: "var(--terahead)" },
    { name: "Otros", value: others, color: "var(--muted)" }
  ];

  document.getElementById("comp-bars").innerHTML = data
    .map(
      (entry) => `
        <div class="comp-bar">
          <div class="comp-dot" style="background:${entry.color}"></div>
          <div class="comp-name" style="color:${entry.color}">${entry.name}</div>
          <div class="comp-track"><div class="comp-fill" style="width:${entry.value.toFixed(1)}%;background:${entry.color}"></div></div>
          <div class="comp-val" style="color:${entry.color}">${entry.value.toFixed(1)}%</div>
        </div>
      `
    )
    .join("");
}

function renderCompTable() {
  const rows = [
    ["Cefalix", "First mover / first choice", "Medical + access + RWE", "Pierde si llega tarde al listing"],
    ["LenovoBio", "Mensaje médico sólido", "Capacidad de educar categoría", "Puede capturar si el mercado duda"],
    ["TeraHead", "Acceso agresivo", "Presión táctica y comercial", "Comprime precio y cuentas abiertas"]
  ];

  document.getElementById("comp-table").innerHTML = rows
    .map(
      (row, index) => `
        <tr>
          <td style="color:${index === 0 ? "var(--cefalix)" : index === 1 ? "var(--lenovo)" : "var(--terahead)"}">${row[0]}</td>
          <td>${row[1]}</td>
          <td>${row[2]}</td>
          <td>${row[3]}</td>
        </tr>
      `
    )
    .join("");
}

function resetAll() {
  if (!window.confirm("¿Reiniciar toda la simulación?")) {
    return;
  }
  const currentScenario = STATE.scenario;
  STATE = {
    year: 1,
    team: 0,
    scenario: currentScenario,
    alloc: TEAMS.map(() => Object.fromEntries(AREAS.map((area) => [area.key, 0]))),
    submitted: TEAMS.map(() => Array(3).fill(false)),
    history: TEAMS.map(() => []),
    events: [],
    marketMomentum: 1,
    pricePressure: 1,
    firstMover: 1,
    competitionShock: 1
  };
  document.getElementById("elog").innerHTML = "";
  document.querySelectorAll(".tpill").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.team) === 0);
  });
  syncContext();
  buildTimeline();
  buildSliders();
  updateScenarioReadout();
  updateProjection();
  renderTeamStatus();
  renderKpis();
  updateCharts();
  renderRanking();
  renderComparisonTable();
  renderDecisionAnalysis();
  renderInvestmentBars();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sumObject(object) {
  return Object.values(object).reduce((sum, value) => sum + value, 0);
}

function formatCurrency(value) {
  return `€${Math.round(value).toLocaleString("es-ES")}`;
}

function formatShortCurrency(value) {
  if (value >= 1e6) {
    return `€${(value / 1e6).toFixed(1)}M`;
  }
  return `€${Math.round(value / 1e3)}K`;
}

function formatMillionCurrency(value) {
  if (value >= 1e6) {
    return `€${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `€${Math.round(value / 1e3)}K`;
  }
  return formatCurrency(value);
}

init();
