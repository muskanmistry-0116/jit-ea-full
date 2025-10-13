const axios = require("axios");
const { handler } = require("../utils/derivePayload");
const buildInsertSQL = require("../utils/buildInsertSQL");
const Policy = require("../models/Policy");
const Device = require("../models/Device");
// const insertTelemetry = require("./telemetryInsertFunc");

exports.insertTelemetry = async (req, res) => {
  try {
    const body = req.body || {};

    // 1) derive + insert into QuestDB
    const derived = (await handler(body)).body;
    const sql = buildInsertSQL(derived);
    await axios.get(QUESTDB_URL, { params: { query: sql } });

    // 2) read back last row (optional verification)
    const fetchSql = "SELECT * FROM telemetry_data3 ORDER BY ts DESC LIMIT 1";
    const { data: fetchData } = await axios.get(QUESTDB_URL, {
      params: { query: fetchSql },
    });

    if (!fetchData.columns || !fetchData.dataset?.length) {
      throw new Error("No data returned from QuestDB after insert");
    }

    const latestRow = Object.fromEntries(
      fetchData.columns.map((col, i) => [col.name, fetchData.dataset[0][i]])
    );

    // 3) get policy ranges for this UDID
    const policy = await readRanges(body.UDID); // -> jsonObj { VR:{...}, VY:{...}, VB:{...} }

    // 4) classify available voltage keys against the bands
    // inside insertQecho after you fetch `policy = await readRanges(body.UDID)`
    const keys = ["VR", "VY", "VB"]; // add more when you need
    const policyChecks = {};

    for (const k of keys) {
      if (!policy[k]) continue;

      // Make sure value unit == policy unit (e.g., Volts). Convert if needed.
      const val = Number(body[k]); // if you send kV, convert: const val = Number(body[k]) * 1000;

      policyChecks[k] = classifyFlexible(val, policy[k]);
    }

    // console.log("VR ->", policyChecks.VR);
    console.log(latestRow);

    // 5) emit + respond
    req.io.emit("realtime-event", latestRow);
    res.status(201).json({
      message: "✅ Data inserted",
      query: sql,
      insertedPayload: derived,
      policyChecks,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

// Return only the inner jsonObj for the device
async function readRanges(udid) {
  const doc = await Policy.findOne(
    { device: udid }, // adjust if your field is named differently
    { _id: 0, jsonObj: 1 }
  ).lean();

  if (!doc?.jsonObj) throw new Error(`Policy not found for UDID: ${udid}`);
  return doc.jsonObj; // { VR:{...}, VY:{...}, VB:{...} }
}

function checkPolicy(value, min, max) {
  const v = Number(value);
  if (!Number.isFinite(v)) return "invalid";
  if (v < min) return "below";
  if (v > max) return "above";
  return "within";
}

// ---- band-based classifier for "mode: percent" or "absolute"
function classifyByBands(valueBaseUnit, spec) {
  const unit = spec.unit || "V";
  const mode = spec.mode || "percent";
  const bands = Array.isArray(spec.bands) ? spec.bands : [];

  let x;
  if (mode === "percent") {
    const nominal = Number(spec.nominal);
    if (!Number.isFinite(nominal) || nominal <= 0) {
      return { label: "invalid-nominal", severity: "invalid" };
    }
    x = ((Number(valueBaseUnit) - nominal) / nominal) * 100; // deviation %
  } else {
    x = Number(valueBaseUnit); // absolute comparison
  }

  for (const b of bands) {
    const lo = mode === "percent" ? b.lower_pct : b.lower_abs;
    const hi = mode === "percent" ? b.upper_pct : b.upper_abs;
    const incLo = b.inc_lower !== false; // default true
    const incHi = b.inc_upper !== false; // default true

    if (inRange(x, lo, hi, incLo, incHi)) {
      return { label: b.name, severity: b.severity || "ok", unit };
    }
  }

  // if nothing matched, consider it critical as a safe default
  return { label: "unclassified", severity: "crit", unit };
}

function inRange(x, lo, hi, incLo = true, incHi = true) {
  if (lo !== null && lo !== undefined) {
    if (incLo ? x < lo : x <= lo) return false;
  }
  if (hi !== null && hi !== undefined) {
    if (incHi ? x > hi : x >= hi) return false;
  }
  return true;
}

// Detect which config shape we have
function pickModeAndBands(spec) {
  if (!spec || typeof spec !== "object") return { kind: "none" };

  // NEW dual-mode shape: {active_mode, nominal, percent:{bands}, absolute:{bands}}
  if (spec.percent?.bands || spec.absolute?.bands || spec.active_mode) {
    const mode =
      spec.active_mode || (spec.percent?.bands ? "percent" : "absolute");
    return {
      kind: mode,
      bands: spec[mode]?.bands || [],
      nominal: Number(spec.nominal),
    };
  }

  // OLD percent-only shape: {mode: 'percent', nominal, bands:[{lower_pct,upper_pct,...}]}
  if (spec.mode === "percent" && Array.isArray(spec.bands)) {
    return {
      kind: "percent",
      bands: spec.bands,
      nominal: Number(spec.nominal),
    };
  }

  // LEGACY absolute shape: {min, max}
  if (typeof spec.min === "number" && typeof spec.max === "number") {
    return { kind: "minmax", min: spec.min, max: spec.max };
  }

  return { kind: "none" };
}

function classifyFlexible(valueBaseUnit, paramSpec) {
  const v = Number(valueBaseUnit);
  if (!Number.isFinite(v)) return { label: "invalid", severity: "invalid" };

  const shape = pickModeAndBands(paramSpec);

  if (shape.kind === "percent") {
    const { nominal, bands } = shape;
    if (!Number.isFinite(nominal) || nominal <= 0 || !bands.length) {
      return { label: "invalid-config", severity: "invalid", mode: "percent" };
    }
    const devPct = ((v - nominal) / nominal) * 100;
    for (const b of bands) {
      const incLo = b.inc_lower !== false;
      const incHi = b.inc_upper !== false;
      if (
        inRange(devPct, b.lower_pct ?? null, b.upper_pct ?? null, incLo, incHi)
      ) {
        return {
          label: b.name,
          severity: b.severity || "ok",
          mode: "percent",
          unit: paramSpec.unit || "",
        };
      }
    }
    return {
      label: "unclassified",
      severity: "crit",
      mode: "percent",
      unit: paramSpec.unit || "",
    };
  }

  if (shape.kind === "absolute") {
    const { bands } = shape;
    if (!bands.length)
      return { label: "invalid-config", severity: "invalid", mode: "absolute" };
    for (const b of bands) {
      const incLo = b.inc_lower !== false;
      const incHi = b.inc_upper !== false;
      if (inRange(v, b.lower_abs ?? null, b.upper_abs ?? null, incLo, incHi)) {
        return {
          label: b.name,
          severity: b.severity || "ok",
          mode: "absolute",
          unit: paramSpec.unit || "",
        };
      }
    }
    return {
      label: "unclassified",
      severity: "crit",
      mode: "absolute",
      unit: paramSpec.unit || "",
    };
  }

  if (shape.kind === "minmax") {
    return {
      label: v < shape.min ? "below" : v > shape.max ? "above" : "within",
      severity: "legacy",
      mode: "minmax",
      unit: paramSpec.unit || "",
    };
  }

  return { label: "invalid-config", severity: "invalid" };
}
