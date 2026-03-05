/**
 * Diving calculator - ported from sailorskills-estimator
 * Hardcoded rates, no DB calls. Used by the public /diving page.
 */

// ── Rates ──
const RATES = {
  recurring: 4.49,
  onetime: 5.99,
  minimum: 149.00,
  anode: 15.00,
};

const SURCHARGES = {
  powerboat: 0.25,
  catamaran: 0.25,
  trimaran: 0.50,
};

// ── Hull fouling matrix (v2.0) ──
const SEVERITY = {
  "MIN":   { label: "Minimal",          surcharge: 0 },
  "M-MOD": { label: "Minimal-Moderate", surcharge: 0 },
  "MOD":   { label: "Moderate",         surcharge: 0 },
  "M-H":   { label: "Moderate-Heavy",   surcharge: 0.25 },
  "H":     { label: "Heavy",            surcharge: 0.50 },
  "H-S":   { label: "Heavy-Severe",     surcharge: 0.75 },
  "S":     { label: "Severe",           surcharge: 1.00 },
  "SEV":   { label: "Severe (Maximum)", surcharge: 2.00 },
};

const PAINT_COLS = ["<6mo", "6-12mo", "1-1.5yr", "1.5-2yr", "2+yr"];

const MATRIX = {
  "<2":    ["MIN",  "MIN",   "MIN",  "MOD",  "M-H"],
  "2-4":   ["MIN",  "M-MOD", "M-MOD","MOD",  "M-H"],
  "5-6":   ["MOD",  "MOD",   "MOD",  "M-H",  "H"],
  "7-8":   [null,   "M-H",   "M-H",  "H",    "H-S"],
  "9-12":  [null,   null,    "H",    "H-S",  "SEV"],
  "13-24": [null,   null,    "H-S",  "S",    "SEV"],
  "24+":   [null,   null,    null,   "S",    "SEV"],
};

export function lookupFouling(paintAge, lastCleaned) {
  const colIdx = PAINT_COLS.indexOf(paintAge);
  if (colIdx === -1) return { severity: "SEV", ...SEVERITY.SEV };
  const row = MATRIX[lastCleaned];
  if (!row) return { severity: "SEV", ...SEVERITY.SEV };
  let code = row[colIdx];
  if (code === null) {
    for (let i = colIdx + 1; i < row.length; i++) {
      if (row[i] !== null) {
        return { severity: row[i], ...SEVERITY[row[i]] };
      }
    }
    return { severity: "SEV", ...SEVERITY.SEV };
  }
  return { severity: code, ...(SEVERITY[code] || SEVERITY.SEV) };
}

// ── Main calculator ──
export function calculateEstimate({
  boatLength = 35,
  boatType = "sailboat",
  frequency = "monthly",
  propellerCount = 1,
  paintAge = "<6mo",
  lastCleaned = "<2",
  anodeCount = 0,
}) {
  const isOneTime = frequency === "onetime";
  const rate = isOneTime ? RATES.onetime : RATES.recurring;
  const baseCost = rate * boatLength;
  const items = [];

  items.push({
    label: `Base rate`,
    detail: `$${rate}/ft × ${boatLength}ft`,
    amount: baseCost,
  });

  let surchargeTotal = 0;

  // Boat type surcharge
  if (boatType === "powerboat" || boatType === "catamaran" || boatType === "trimaran") {
    const pct = SURCHARGES[boatType];
    const amt = baseCost * pct;
    surchargeTotal += amt;
    const labels = { powerboat: "Powerboat", catamaran: "Catamaran", trimaran: "Trimaran" };
    items.push({
      label: `${labels[boatType]} surcharge`,
      detail: `+${(pct * 100).toFixed(0)}%`,
      amount: amt,
    });
  }

  // Propeller surcharge
  if (propellerCount > 1) {
    const additional = propellerCount - 1;
    const pct = additional * 0.10;
    const amt = baseCost * pct;
    surchargeTotal += amt;
    items.push({
      label: `Additional propeller${additional > 1 ? "s" : ""}`,
      detail: `+${(pct * 100).toFixed(0)}%`,
      amount: amt,
    });
  }

  // Growth surcharge from hull fouling matrix
  const fouling = lookupFouling(paintAge, lastCleaned);
  if (fouling.surcharge > 0) {
    const amt = baseCost * fouling.surcharge;
    surchargeTotal += amt;
    items.push({
      label: `Est. growth (${fouling.label})`,
      detail: `+${(fouling.surcharge * 100).toFixed(0)}%`,
      amount: amt,
    });
  }

  // Anode installation
  let anodeCost = 0;
  if (anodeCount > 0) {
    anodeCost = anodeCount * RATES.anode;
    items.push({
      label: `Anode installation`,
      detail: `${anodeCount} × $${RATES.anode}`,
      amount: anodeCost,
    });
  }

  const subtotal = baseCost + surchargeTotal + anodeCost;
  const minimumApplied = subtotal > 0 && subtotal < RATES.minimum;
  const total = minimumApplied ? RATES.minimum : subtotal;

  return {
    items,
    subtotal,
    total,
    minimumApplied,
    rate,
    isOneTime,
    fouling,
  };
}

export { RATES };
