/**
 * Diving calculator - ported from sailorskills-estimator
 * Pricing logic is IDENTICAL to the source of truth.
 * Only the UI layer changes (React instead of vanilla DOM).
 */

// ── Fallback rates (match business_pricing_config table) ──
const RATES = {
  recurring_cleaning: 4.49,
  onetime_cleaning: 5.99,
  underwater_inspection: 3.99,
  item_recovery: 199.00,
  propeller_service: 349.00,
  anodes_only: 149.00,
  minimum_service_charge: 149.00,
  anode_installation: 15.00,
};

const SURCHARGES = {
  powerboat: 0.25,
  catamaran: 0.25,
  trimaran: 0.50,
  // Paint surcharges REMOVED — poor paint → heavier growth → growth surcharge covers it
  paintPoor: 0,
  paintFairLate: 0,
  paintMissing: 0,
};

// ── Service definitions ──
export const serviceData = {
  recurring_cleaning: {
    rate: RATES.recurring_cleaning,
    name: "Recurring Cleaning & Anodes",
    type: "per_foot",
    description: "Regular hull cleaning keeps your boat performing at its best. Includes cleaning and zinc anode inspection. Available at 1, 2, 3, or 6-month intervals.",
  },
  onetime_cleaning: {
    rate: RATES.onetime_cleaning,
    name: "One-time Cleaning & Anodes",
    type: "per_foot",
    description: "Complete hull cleaning and zinc anode inspection. Perfect for pre-haul out, pre-survey, or when your regular diver is unavailable.",
  },
  item_recovery: {
    rate: RATES.item_recovery,
    name: "Item Recovery",
    type: "flat",
    description: "Recovery of lost items — phones, keys, tools, dinghies. Up to 45 minutes of search time. Recovery not guaranteed.",
  },
  underwater_inspection: {
    rate: RATES.underwater_inspection,
    name: "Underwater Inspection",
    type: "per_foot",
    description: `Thorough underwater inspection with photo/video documentation. $${RATES.underwater_inspection} per foot, $${RATES.minimum_service_charge} minimum.`,
  },
  propeller_service: {
    rate: RATES.propeller_service,
    name: "Propeller Removal/Installation",
    type: "flat",
    description: `Professional propeller removal or installation. $${RATES.propeller_service} per propeller.`,
  },
  anodes_only: {
    rate: RATES.anodes_only,
    name: "Anodes Only",
    type: "flat",
    description: `Zinc anode inspection and replacement. $${RATES.minimum_service_charge} minimum plus $${RATES.anode_installation} per anode.`,
  },
};

export const serviceDisplayOrder = [
  "recurring_cleaning",
  "onetime_cleaning",
  "separator",
  "anodes_only",
  "underwater_inspection",
  "item_recovery",
  "propeller_service",
];

// ── Hull fouling matrix (v2.0, transposed) ──
const hullFoulingMatrix = {
  severityScale: {
    "MIN":   { label: "Minimal",          surcharge: 0 },
    "M-MOD": { label: "Minimal-Moderate", surcharge: 0 },
    "MOD":   { label: "Moderate",         surcharge: 0 },
    "M-H":   { label: "Moderate-Heavy",   surcharge: 0.25 },
    "H":     { label: "Heavy",            surcharge: 0.50 },
    "H-S":   { label: "Heavy-Severe",     surcharge: 0.75 },
    "S":     { label: "Severe",           surcharge: 1.00 },
    "SEV":   { label: "Severe (Maximum)", surcharge: 2.00 },
  },
  columns: ["<6mo", "6-12mo", "1-1.5yr", "1.5-2yr", "2+yr"],
  matrix: {
    "<2":    ["MIN",  "MIN",   "MIN",  "MOD",  "M-H"],
    "2-4":   ["MIN",  "M-MOD", "M-MOD","MOD",  "M-H"],
    "5-6":   ["MOD",  "MOD",   "MOD",  "M-H",  "H"],
    "7-8":   [null,   "M-H",   "M-H",  "H",    "H-S"],
    "9-12":  [null,   null,    "H",    "H-S",  "SEV"],
    "13-24": [null,   null,    "H-S",  "S",    "SEV"],
    "24+":   [null,   null,    null,   "S",    "SEV"],
  },
  cleaningMap: {
    "0-2_months": "<2",
    "2-4_months": "2-4",
    "3-4_months": "2-4",
    "5-6_months": "5-6",
    "7-8_months": "7-8",
    "9-12_months": "9-12",
    "13-24_months": "13-24",
    "over_24_months": "24+",
    "over_24_months_unsure": "24+",
  },
  paintMap: {
    "0-6_months": "<6mo",
    "6-12_months": "6-12mo",
    "7-12_months": "6-12mo",
    "1-1.5_years": "1-1.5yr",
    "12-18_months": "1-1.5yr",
    "13-21_months": "1-1.5yr",
    "1.5-2_years": "1.5-2yr",
    "18-24_months": "1.5-2yr",
    "22-24_months": "1.5-2yr",
    "2+_years": "2+yr",
    "over_24_months": "2+yr",
    "unsure_paint": "2+yr",
  },
};

export function lookupFoulingSeverity(paintAgeFormValue, cleaningAgeFormValue) {
  const { cleaningMap, paintMap, matrix, severityScale, columns } = hullFoulingMatrix;
  const cleaningKey = cleaningMap[cleaningAgeFormValue] || "24+";
  const paintKey = paintMap[paintAgeFormValue] || "2+yr";
  const colIdx = columns.indexOf(paintKey);
  if (colIdx === -1) return { severity: "SEV", label: "Severe (Maximum)", surcharge: 2.0 };

  const row = matrix[cleaningKey];
  if (!row) return { severity: "SEV", label: "Severe (Maximum)", surcharge: 2.0 };

  let code = row[colIdx];
  if (code === null) {
    for (let i = colIdx + 1; i < row.length; i++) {
      if (row[i] !== null) {
        const info = severityScale[row[i]];
        return { severity: row[i], label: info.label, surcharge: info.surcharge };
      }
    }
    return { severity: "SEV", label: "Severe (Maximum)", surcharge: 2.0 };
  }
  const info = severityScale[code] || severityScale.SEV;
  return { severity: code, label: info.label, surcharge: info.surcharge };
}

// ── Main calculator ──
export function calculateServiceCost({
  serviceKey,
  boatLength = 0,
  boatType = "sailboat",
  hullType = "monohull",
  propellerCount = 1,
  lastPaintedTime = null,
  lastCleanedTime = null,
  anodesToInstall = 0,
}) {
  const service = serviceData[serviceKey];
  if (!service) return { success: false, error: "Invalid service", total: 0, breakdown: { items: [], total: 0 } };

  const items = [];
  let baseServiceCost = 0;
  let surchargeTotal = 0;

  if (service.type === "per_foot") {
    if (boatLength <= 0) return { success: false, error: "Invalid boat length", total: 0, breakdown: { items: [], total: 0 } };

    baseServiceCost = service.rate * boatLength;
    items.push({ type: "base", description: `Base (${service.rate.toFixed(2)}/ft × ${boatLength}ft)`, amount: baseServiceCost });

    // Boat type surcharge
    if (boatType === "powerboat") {
      const s = baseServiceCost * SURCHARGES.powerboat;
      surchargeTotal += s;
      items.push({ type: "surcharge", description: "Powerboat (+25%)", amount: s });
    }

    // Hull type surcharge
    if (hullType === "catamaran") {
      const s = baseServiceCost * SURCHARGES.catamaran;
      surchargeTotal += s;
      items.push({ type: "surcharge", description: "Catamaran (+25%)", amount: s });
    } else if (hullType === "trimaran") {
      const s = baseServiceCost * SURCHARGES.trimaran;
      surchargeTotal += s;
      items.push({ type: "surcharge", description: "Trimaran (+50%)", amount: s });
    }

    // Propeller surcharge (1 included, additional are 10% each)
    if (propellerCount > 1) {
      const additional = propellerCount - 1;
      const rate = additional * 0.10;
      const s = baseServiceCost * rate;
      surchargeTotal += s;
      items.push({ type: "surcharge", description: `Additional Propeller${additional > 1 ? "s" : ""} (+${(rate * 100).toFixed(0)}%)`, amount: s });
    }

    // Growth surcharge (cleaning services only)
    const isCleaning = serviceKey === "onetime_cleaning" || serviceKey === "recurring_cleaning";
    if (isCleaning && lastPaintedTime && lastCleanedTime) {
      const fouling = lookupFoulingSeverity(lastPaintedTime, lastCleanedTime);
      if (fouling.surcharge > 0) {
        const s = baseServiceCost * fouling.surcharge;
        surchargeTotal += s;
        items.push({ type: "surcharge", description: `Est. Growth (${fouling.label}): +${(fouling.surcharge * 100).toFixed(0)}%`, amount: s });
      }
    }
  } else {
    baseServiceCost = service.rate;
    items.push({ type: "base", description: "Flat Rate", amount: baseServiceCost });
  }

  // Anode installation
  let anodeCost = 0;
  if (anodesToInstall > 0) {
    anodeCost = anodesToInstall * RATES.anode_installation;
    items.push({ type: "additional", description: `Anode Installation (${anodesToInstall} × $${RATES.anode_installation})`, amount: anodeCost });
  }

  const subtotal = baseServiceCost + surchargeTotal + anodeCost;
  const minimumApplied = subtotal > 0 && subtotal < RATES.minimum_service_charge;
  const total = minimumApplied ? RATES.minimum_service_charge : subtotal;

  return {
    success: true,
    service: service.name,
    serviceType: service.type,
    baseRate: service.rate,
    total,
    breakdown: { items, subtotal, total, minimumApplied },
  };
}

// ── Stripe config ──
export const stripeConfig = {
  supabaseUrl: "https://fzygakldvvzxmahkdylq.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6eWdha2xkdnZ6eG1haGtkeWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODM4OTgsImV4cCI6MjA2OTY1OTg5OH0.8BNDF5zmpk2HFdprTjsdOWTDh_XkAPdTnGo7omtiVIk",
};

export async function fetchStripeConfig() {
  try {
    const res = await fetch(`${stripeConfig.supabaseUrl}/functions/v1/get-stripe-config`, {
      headers: { Authorization: `Bearer ${stripeConfig.supabaseAnonKey}` },
    });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { publishableKey: null, mode: "test" };
  }
}

export async function createPaymentIntent(formData) {
  const res = await fetch(`${stripeConfig.supabaseUrl}/functions/v1/create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${stripeConfig.supabaseAnonKey}`,
    },
    body: JSON.stringify({ formData }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create payment intent");
  }
  return res.json();
}

// ── Form options ──
export const paintAgeOptions = [
  { value: "0-6_months", label: "Less than 6 months" },
  { value: "6-12_months", label: "6–12 months" },
  { value: "13-21_months", label: "1–1.5 years" },
  { value: "22-24_months", label: "1.5–2 years" },
  { value: "over_24_months", label: "Over 2 years" },
  { value: "unsure_paint", label: "Not sure" },
];

export const cleaningAgeOptions = [
  { value: "0-2_months", label: "Less than 2 months" },
  { value: "2-4_months", label: "2–4 months" },
  { value: "5-6_months", label: "5–6 months" },
  { value: "7-8_months", label: "7–8 months" },
  { value: "9-12_months", label: "9–12 months" },
  { value: "13-24_months", label: "1–2 years" },
  { value: "over_24_months", label: "Over 2 years" },
];

export const boatTypeOptions = [
  { value: "sailboat", label: "Sailboat" },
  { value: "powerboat", label: "Powerboat", note: "+25%" },
];

export const hullTypeOptions = [
  { value: "monohull", label: "Monohull" },
  { value: "catamaran", label: "Catamaran", note: "+25%" },
  { value: "trimaran", label: "Trimaran", note: "+50%" },
];

export const intervalOptions = [
  { value: "1", label: "Monthly" },
  { value: "2", label: "Bi-monthly" },
  { value: "3", label: "Quarterly" },
  { value: "6", label: "Semi-annual" },
];
