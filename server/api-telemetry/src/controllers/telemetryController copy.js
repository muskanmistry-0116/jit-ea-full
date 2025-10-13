const axios = require("axios");
const { handler } = require("../utils/derivePayload");
const buildInsertSQL = require("../utils/buildInsertSQL");
const Policy = require("../models/Policy");

const QUESTDB_URL = process.env.QUESTDB_URL;

exports.getQecho = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const sql = `SELECT * FROM telemetry_data3 ORDER BY ts DESC LIMIT ${limit}`;
    const { data } = await axios.get(QUESTDB_URL, { params: { query: sql } });

    const rows = data.dataset.map((row) =>
      Object.fromEntries(data.columns.map((col, i) => [col.name, row[i]]))
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.insertQecho = async (req, res) => {
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
    const keys = ["VR", "VY", "VB"];
    const policyChecks = {};

    for (const k of keys) {
      if (!policy[k]) continue;

      const val = Number(body[k]);
      if (!Number.isFinite(val)) {
        policyChecks[k] = { label: "invalid", severity: "invalid" };
        continue;
      }

      // If your doc still sometimes uses simple {min,max}, fall back to that.
      if (
        typeof policy[k].min === "number" &&
        typeof policy[k].max === "number"
      ) {
        policyChecks[k] = {
          label: checkPolicy(val, policy[k].min, policy[k].max),
          severity: "legacy",
        };
      } else {
        policyChecks[k] = classifyByBands(val, policy[k]); // uses % bands around nominal
      }
    }

    // sample console
    if (policyChecks.VR)
      console.log(
        `VR -> ${policyChecks.VR.label} (${policyChecks.VR.severity})`
      );

    // 5) emit + respond
    req.io.emit("socket-echo", latestRow);
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
    { UDID: udid }, // <-- make sure this matches your schema
    { _id: 0, jsonObj: 1 }
  ).lean();

  if (!doc?.jsonObj) throw new Error(`Policy not found for UDID: ${udid}`);
  return doc.jsonObj;
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
