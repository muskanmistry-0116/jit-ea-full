const axios = require("axios");
const { handler } = require("../utils/derivePayload");
const buildInsertSQL = require("../utils/buildInsertSQL");
const Policy = require("../models/Policy");
const Device = require("../models/Device");
// const insertTelemetry2 = require("./telemetryInsertFunc");
// exports.insertTelemetry = insertTelemetry2;

const QUESTDB_URL = process.env.QUESTDB_URL;

exports.getTelemetry = async (req, res) => {
  try {
    const query = req.query || {};
    console.log("query :", query);

    let limit = parseInt(query.limit);
    const did = req.query.did || "";
    if (!did) {
      return res.status(400).json({ error: "DID (Device ID) is required" });
    }

    let limitStmt = limit > 0 ? ` ${limit}` : "";
    let sql = `SELECT * FROM telemetry_data3 WHERE DID='${did}' ORDER BY ts DESC LIMIT ${limitStmt}`;

    // Utility function to convert ISO/IST date string to QuestDB-compatible timestamp (epoch in microseconds)
    function convertToQuestDBTimestamp(dateStr) {
      if (!dateStr) throw new Error("No date provided");

      // If it's a number or a numeric string, treat as epoch (seconds or ms)
      if (!isNaN(dateStr)) {
        let epoch = Number(dateStr);
        // If it's in seconds (10 digits), convert to ms
        if (epoch < 1e12) {
          epoch = epoch * 1000;
        }
        return epoch * 1000; // QuestDB expects microseconds
      }

      // Otherwise, parse as date string
      let date;
      if (dateStr.endsWith("Z")) {
        date = new Date(dateStr);
      } else {
        // Assume IST (UTC+5:30)
        date = new Date(new Date(dateStr).getTime() - 5.5 * 60 * 60 * 1000);
      }
      return date.getTime() * 1000;
    }

    function toQuestDBTimestampString(input) {
      let date;
      if (!input) throw new Error("No date provided");

      // If input is a number or numeric string, treat as epoch
      if (!isNaN(input)) {
        let epoch = Number(input);
        // If in seconds, convert to ms
        if (epoch < 1e12) epoch = epoch * 1000;
        date = new Date(epoch);
      } else {
        date = new Date(input);
      }

      // Format: YYYY-MM-DDTHH:mm:ss.SSSSSSZ (6 digits for microseconds)
      const pad = (n, z = 2) => String(n).padStart(z, "0");
      const year = date.getUTCFullYear();
      const month = pad(date.getUTCMonth() + 1);
      const day = pad(date.getUTCDate());
      const hour = pad(date.getUTCHours());
      const min = pad(date.getUTCMinutes());
      const sec = pad(date.getUTCSeconds());
      const ms = pad(date.getUTCMilliseconds(), 3);
      // Add 3 zeros for microseconds
      return `${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`;
    }

    let ts_from = query.from ? toQuestDBTimestampString(query.from) : "";
    let ts_to = query.to ? toQuestDBTimestampString(query.to) : "";

    switch (query.segment) {
      case "voltage":
        sql = `SELECT TS,VR,VY,VB,VRY,VYB,VBR,AVG_VLL,AVG_VLN FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limitStmt}
        `;
        break;
      case "current":
        sql = `SELECT TS,IR,IY,IB,AVG_I FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limitStmt}
        `;
        break;
      case "pf":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT TS,R_PF,Y_PF,B_PF,AVG_PF FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "frequency":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT TS,FREQUENCY FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "power":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT TS,R_KW,Y_KW,B_KW,TOTAL_KW FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "energy":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT TS,R_KVA,Y_KVA,B_KVA,TOTAL_KVA,R_KVAR,Y_KVAR,B_KVAR,TOTAL_KVAR, FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "thd":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT R_THD_V,Y_THD_V,B_THD_V,R_THD_I,Y_THD_I,B_THD_I,KWH,KVAH,KVARH FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "max_demand":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT LN_MAX_DEV FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "load":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT LN_VOL_IMB,LL_MAX_DEV,LL_VOL_IMB,I_MAX_DEV,I_CURR_IMB,F_DEV,F_DEV_PCT,PF_MAX_DEV,PF_IMB FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "efficiency":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT KW_IMB_PCT,KVA_IMB_PCT,DELTA_KWH,DELTA_KVAH,ENG_CHA,KVAR_IMB_PCT FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "energy_loss":
        limit = parseInt(query.limit) || 100;
        sql = `SELECT TS, KVARH, KWH, KVAH FROM telemetry_data3 
        WHERE DID='${did}' AND TS >= '${ts_from}' AND TS <= '${ts_to}'
        ORDER BY ts ASC 
        LIMIT ${limit}
        `;
        break;
      case "all":
      default:
        limit = parseInt(query.limit) || 100;
        sql = `SELECT * FROM telemetry_data3 WHERE DID='${did}' ORDER BY ts DESC LIMIT ${limit}`;
        break;
    }

    // console.log("SQL :", sql);
    const { data } = await axios.get(QUESTDB_URL, { params: { query: sql } });

    const rows = data.dataset.map((row) =>
      Object.fromEntries(data.columns.map((col, i) => [col.name, row[i]]))
    );

    const deviceId = did;
    let deviceData = null;
    if (deviceId) {
      deviceData = await Device.findOne({ did: deviceId }).lean();
    }

    res.json({
      count: rows.length,
      status: true,
      message: "success",
      data: rows,
      device: deviceData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRtlTelemetry = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const did = req.query.did || "";
    if (!did) {
      return res.status(400).json({ error: "DID (Device ID) is required" });
    }
    const sql = `SELECT * FROM telemetry_data3 WHERE DID='${did}' ORDER BY ts DESC LIMIT 1`;
    const { data } = await axios.get(QUESTDB_URL, { params: { query: sql } });

    const rows = data.dataset.map((row) =>
      Object.fromEntries(data.columns.map((col, i) => [col.name, row[i]]))
    );

    // // Fetch device details based on UDID (which is ObjectID in Device schema)
    // const deviceId = rows[0]?.UDID;
    // let deviceData = null;
    // if (deviceId) {
    //   deviceData = await Device.findById(deviceId).lean();
    // }

    // Fetch device details based on UDID (which is ObjectID in Device schema)
    const deviceId = rows[0]?.DID;
    let deviceData = null;
    if (deviceId) {
      deviceData = await Device.findOne({ did: deviceId }).lean();
    }
    // console.log(deviceData);

    res.json({ status: "Success", data: rows, device: deviceData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRtlTelemetry2 = async (req, res) => {
  try {
    // const limit = parseInt(req.query.limit) || 50;
    const did = req.query.did || "";
    if (!did) {
      return res.status(400).json({ error: "DID (Device ID) is required" });
    }
    const sql = `SELECT * FROM telemetry_data3 WHERE DID='${did}' ORDER BY ts DESC LIMIT 2`;

    const { data } = await axios.get(QUESTDB_URL, { params: { query: sql } });

    const rows = data.dataset.map((row) =>
      Object.fromEntries(data.columns.map((col, i) => [col.name, row[i]]))
    );

    // Fetch device details based on UDID (which is ObjectID in Device schema)
    const deviceId = did;
    let deviceData = null;
    if (deviceId) {
      deviceData = await Device.findOne({ did: deviceId }).lean();
    }
    // console.log(deviceData);

    res.json({ status: "Success", data: rows, device: deviceData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
