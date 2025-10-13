const axios = require("axios");
const { handler } = require("../utils/derivePayload");
const buildInsertSQL = require("../utils/buildInsertSQL");
const Policy = require("../models/Policy");
const Device = require(".      case "pf":
        if (parsedTimeFrame) {
          sql = `SELECT ts,
                 avg(R_PF) as avg_R_PF, avg(Y_PF) as avg_Y_PF, avg(B_PF) as avg_B_PF,
                 avg(AVG_PF) as avg_AVG_PF
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval}`;
        } else {
          sql = `SELECT TS,R_PF,Y_PF,B_PF,AVG_PF FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt} ${offsetStmt}`;
        }
        break;e");
// const insertTelemetry2 = require("./telemetryInsertFunc");
// exports.insertTelemetry = insertTelemetry2;

const QUESTDB_URL = process.env.QUESTDB_URL;

exports.getTelemetry = async (req, res) => {
  try {
    const query = req.query || {};
    console.log("query :", query);

    // Pagination parameters
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 100;
    const timeFrame = query.timeFrame; // e.g., "1m", "15m", "1h", "6h", "1d", "3d"
    
    const did = req.query.did || "";
    if (!did) {
      return res.status(400).json({ error: "DID (Device ID) is required" });
    }

    // Parse timeFrame parameter (e.g., "1m", "15m", "1h", "6h", "1d", "3d")
    function parseTimeFrame(timeFrame) {
      if (!timeFrame) return null;
      
      const match = timeFrame.match(/^(\d+)(m|h|d)$/);
      if (!match) return null;
      
      const [, amount, unit] = match;
      const value = parseInt(amount);
      
      // QuestDB supported intervals mapping
      let questDbInterval;
      switch (unit) {
        case 'm': 
          // QuestDB supports: T, s, m, h, d, M, y
          // For minutes, common supported values are 1m, 5m, 10m, 30m
          if ([1, 5, 10, 15, 30].includes(value)) {
            questDbInterval = `${value}m`;
          } else {
            // Convert to closest supported interval
            if (value < 5) questDbInterval = '1m';
            else if (value < 10) questDbInterval = '5m';
            else if (value < 30) questDbInterval = '15m';
            else questDbInterval = '30m';
          }
          return { value, unit: 'minute', interval: questDbInterval };
        case 'h':
          // Hours are generally supported: 1h, 2h, 6h, 12h, etc.
          questDbInterval = `${value}h`;
          return { value, unit: 'hour', interval: questDbInterval };
        case 'd':
          // Days are supported: 1d, 7d, etc.
          questDbInterval = `${value}d`;
          return { value, unit: 'day', interval: questDbInterval };
        default: 
          return null;
      }
    }

    // Calculate offset for pagination (skip page 0 for all records)
    const offset = page === 0 ? 0 : (page - 1) * limit;
    let limitStmt = page === 0 ? "" : `LIMIT ${limit}`;
    let offsetStmt = page === 0 ? "" : `OFFSET ${offset}`;
    
    // For SAMPLE BY queries, we need different syntax
    let sampleLimitStmt = page === 0 ? "" : limitStmt;
    
    let sql = `SELECT * FROM telemetry_data3 WHERE DID='${did}' ORDER BY ts DESC ${limitStmt} ${offsetStmt}`;

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

    // Parse timeFrame for aggregation first
    const parsedTimeFrame = parseTimeFrame(timeFrame);

    // Debug timestamp conversion
    if (query.from || query.to) {
      console.log("=== TIMESTAMP DEBUG ===");
      console.log("Original from:", query.from);
      console.log("Original to:", query.to);
      console.log("Converted ts_from:", ts_from);
      console.log("Converted ts_to:", ts_to);
      
      // Also show human readable dates
      if (query.from) {
        const fromDate = new Date(Number(query.from) * 1000);
        console.log("From date (human):", fromDate.toISOString());
      }
      if (query.to) {
        const toDate = new Date(Number(query.to) * 1000);
        console.log("To date (human):", toDate.toISOString());
      }
      console.log("=====================");
    }

    // Debug timeFrame parsing
    if (timeFrame) {
      console.log("=== TIMEFRAME DEBUG ===");
      console.log("Original timeFrame:", timeFrame);
      console.log("Parsed timeFrame:", parsedTimeFrame);
      if (parsedTimeFrame) {
        console.log("QuestDB interval:", parsedTimeFrame.interval);
      }
      console.log("======================");
    }
    let baseSelectClause = "*";
    let aggregationClause = "";
    let groupByClause = "";
    let orderByClause = "ORDER BY ts DESC";

    // If timeFrame is provided, build aggregation query
    if (parsedTimeFrame) {
      // Build sample by clause for time-based aggregation
      const sampleInterval = parsedTimeFrame.interval;
      
      // Common aggregated fields for most segments
      const commonAggFields = `
        sample_by(${sampleInterval}, ts) as ts,
        avg(VR) as avg_VR, avg(VY) as avg_VY, avg(VB) as avg_VB,
        avg(IR) as avg_IR, avg(IY) as avg_IY, avg(IB) as avg_IB,
        avg(R_KW) as avg_R_KW, avg(Y_KW) as avg_Y_KW, avg(B_KW) as avg_B_KW,
        avg(TOTAL_KW) as avg_TOTAL_KW,
        avg(FREQUENCY) as avg_FREQUENCY,
        avg(R_PF) as avg_R_PF, avg(Y_PF) as avg_Y_PF, avg(B_PF) as avg_B_PF,
        max(KWH) as max_KWH, max(KVAH) as max_KVAH, max(KVARH) as max_KVARH
      `.trim();
      
      baseSelectClause = commonAggFields;
      groupByClause = `SAMPLE BY ${sampleInterval}`;
      orderByClause = "ORDER BY ts ASC";
    }

    switch (query.segment) {
      case "voltage":
        if (parsedTimeFrame) {
          sql = `SELECT ts,
                 avg(VR) as avg_VR, avg(VY) as avg_VY, avg(VB) as avg_VB,
                 avg(VRY) as avg_VRY, avg(VYB) as avg_VYB, avg(VBR) as avg_VBR,
                 avg(AVG_VLL) as avg_AVG_VLL, avg(AVG_VLN) as avg_AVG_VLN
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval}`;
        } else {
          sql = `SELECT TS,VR,VY,VB,VRY,VYB,VBR,AVG_VLL,AVG_VLN FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt} ${offsetStmt}`;
        }
        break;
      case "current":
        if (parsedTimeFrame) {
          sql = `SELECT ts,
                 avg(IR) as avg_IR, avg(IY) as avg_IY, avg(IB) as avg_IB,
                 avg(AVG_I) as avg_AVG_I
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval}`;
        } else {
          sql = `SELECT TS,IR,IY,IB,AVG_I FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt} ${offsetStmt}`;
        }
        break;
      case "pf":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(R_PF) as avg_R_PF, avg(Y_PF) as avg_Y_PF, avg(B_PF) as avg_B_PF,
                 avg(AVG_PF) as avg_AVG_PF
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,R_PF,Y_PF,B_PF,AVG_PF FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "frequency":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(FREQUENCY) as avg_FREQUENCY
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,FREQUENCY FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "power":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(R_KW) as avg_R_KW, avg(Y_KW) as avg_Y_KW, avg(B_KW) as avg_B_KW,
                 avg(TOTAL_KW) as avg_TOTAL_KW
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,R_KW,Y_KW,B_KW,TOTAL_KW FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "energy":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(R_KVA) as avg_R_KVA, avg(Y_KVA) as avg_Y_KVA, avg(B_KVA) as avg_B_KVA,
                 avg(TOTAL_KVA) as avg_TOTAL_KVA,
                 avg(R_KVAR) as avg_R_KVAR, avg(Y_KVAR) as avg_Y_KVAR, avg(B_KVAR) as avg_B_KVAR,
                 avg(TOTAL_KVAR) as avg_TOTAL_KVAR
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,R_KVA,Y_KVA,B_KVA,TOTAL_KVA,R_KVAR,Y_KVAR,B_KVAR,TOTAL_KVAR FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "thd":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(R_THD_V) as avg_R_THD_V, avg(Y_THD_V) as avg_Y_THD_V, avg(B_THD_V) as avg_B_THD_V,
                 avg(R_THD_I) as avg_R_THD_I, avg(Y_THD_I) as avg_Y_THD_I, avg(B_THD_I) as avg_B_THD_I,
                 max(KWH) as max_KWH, max(KVAH) as max_KVAH, max(KVARH) as max_KVARH
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,R_THD_V,Y_THD_V,B_THD_V,R_THD_I,Y_THD_I,B_THD_I,KWH,KVAH,KVARH FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "max_demand":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 max(LN_MAX_DEV) as max_LN_MAX_DEV
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,LN_MAX_DEV FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "load":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(LN_VOL_IMB) as avg_LN_VOL_IMB, max(LL_MAX_DEV) as max_LL_MAX_DEV,
                 avg(LL_VOL_IMB) as avg_LL_VOL_IMB, max(I_MAX_DEV) as max_I_MAX_DEV,
                 avg(I_CURR_IMB) as avg_I_CURR_IMB, avg(F_DEV) as avg_F_DEV,
                 avg(F_DEV_PCT) as avg_F_DEV_PCT, max(PF_MAX_DEV) as max_PF_MAX_DEV,
                 avg(PF_IMB) as avg_PF_IMB
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,LN_VOL_IMB,LL_MAX_DEV,LL_VOL_IMB,I_MAX_DEV,I_CURR_IMB,F_DEV,F_DEV_PCT,PF_MAX_DEV,PF_IMB FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "efficiency":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(KW_IMB_PCT) as avg_KW_IMB_PCT, avg(KVA_IMB_PCT) as avg_KVA_IMB_PCT,
                 sum(DELTA_KWH) as sum_DELTA_KWH, sum(DELTA_KVAH) as sum_DELTA_KVAH,
                 avg(ENG_CHA) as avg_ENG_CHA, avg(KVAR_IMB_PCT) as avg_KVAR_IMB_PCT
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS,KW_IMB_PCT,KVA_IMB_PCT,DELTA_KWH,DELTA_KVAH,ENG_CHA,KVAR_IMB_PCT FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "energy_loss":
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 max(KVARH) as max_KVARH, max(KWH) as max_KWH, max(KVAH) as max_KVAH
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${limitStmt}`;
        } else {
          sql = `SELECT TS, KVARH, KWH, KVAH FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt}`;
        }
        break;
      case "all":
      default:
        if (parsedTimeFrame) {
          sql = `SELECT sample_by(${parsedTimeFrame.interval}, ts) as ts,
                 avg(VR) as avg_VR, avg(VY) as avg_VY, avg(VB) as avg_VB,
                 avg(IR) as avg_IR, avg(IY) as avg_IY, avg(IB) as avg_IB,
                 avg(R_KW) as avg_R_KW, avg(Y_KW) as avg_Y_KW, avg(B_KW) as avg_B_KW,
                 avg(TOTAL_KW) as avg_TOTAL_KW, avg(FREQUENCY) as avg_FREQUENCY,
                 avg(R_PF) as avg_R_PF, avg(Y_PF) as avg_Y_PF, avg(B_PF) as avg_B_PF,
                 max(KWH) as max_KWH, max(KVAH) as max_KVAH, max(KVARH) as max_KVARH
                 FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 SAMPLE BY ${parsedTimeFrame.interval} ${sampleLimitStmt}`;
        } else {
          sql = `SELECT * FROM telemetry_data3 
                 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}
                 ORDER BY ts DESC ${limitStmt} ${offsetStmt}`;
        }
        break;
    }

    // console.log("SQL :", sql);
    console.log("=== SQL DEBUG ===");
    console.log("Final SQL Query:", sql);
    console.log("================");
    
    const { data } = await axios.get(QUESTDB_URL, { params: { query: sql } });

    const rows = data.dataset.map((row) =>
      Object.fromEntries(data.columns.map((col, i) => [col.name, row[i]]))
    );

    // Get total count for pagination (only if page > 0)
    let totalCount = 0;
    let totalPages = 0;
    
    if (page > 0) {
      const countSql = `SELECT count(*) as total FROM telemetry_data3 WHERE DID='${did}' ${ts_from ? `AND TS >= '${ts_from}'` : ''} ${ts_to ? `AND TS <= '${ts_to}'` : ''}`;
      try {
        const { data: countData } = await axios.get(QUESTDB_URL, { params: { query: countSql } });
        totalCount = countData.dataset[0][0];
        totalPages = Math.ceil(totalCount / limit);
      } catch (countErr) {
        console.log("Count query failed:", countErr.message);
      }
    }

    const deviceId = did;
    let deviceData = null;
    if (deviceId) {
      deviceData = await Device.findOne({ did: deviceId }).lean();
    }

    const response = {
      count: rows.length,
      status: true,
      message: "success",
      data: rows,
      device: deviceData,
    };

    // Add pagination info if page > 0
    if (page > 0) {
      response.pagination = {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    }

    // Add timeFrame info if provided
    if (parsedTimeFrame) {
      response.timeFrame = {
        original: timeFrame,
        parsed: parsedTimeFrame,
        aggregationType: parsedTimeFrame.unit
      };
    }

    res.json(response);
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
