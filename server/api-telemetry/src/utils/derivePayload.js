exports.handler = async (event) => {
  const SYSTEM_NOMINAL_FREQ = 50.0;

  let VLL_MAX_DEV = Math.max(
    Math.abs(event.VRY - event.AVG_VLL),
    Math.abs(event.VYB - event.AVG_VLL),
    Math.abs(event.VBR - event.AVG_VLL)
  );
  let VLL_MAX_DEV_PERCENT = (VLL_MAX_DEV / event.AVG_VLL) * 100;

  let VLN_MAX_DEV = Math.max(
    Math.abs(event.VR - event.AVG_VLN),
    Math.abs(event.VY - event.AVG_VLN),
    Math.abs(event.VB - event.AVG_VLN)
  );
  let VLN_MAX_DEV_PERCENT = (VLN_MAX_DEV / event.AVG_VLN) * 100;

  let I_MAX_DEV = Math.max(
    Math.abs(event.IR - event.AVG_I),
    Math.abs(event.IY - event.AVG_I),
    Math.abs(event.IB - event.AVG_I)
  );
  let I_MAX_DEV_PERCENT = (I_MAX_DEV / event.AVG_I) * 100;

  let FREQ_DEV = Math.abs(event.FREQUENCY - SYSTEM_NOMINAL_FREQ);
  let FREQ_DEV_PERCENT = (FREQ_DEV / SYSTEM_NOMINAL_FREQ) * 100;

  let THD_V_AVG = (event["R_THD-V"] + event["Y_THD-V"] + event["B_THD-V"]) / 3;
  let THD_V_MAX_DEV = Math.max(
    Math.abs(event["R_THD-V"] - THD_V_AVG),
    Math.abs(event["Y_THD-V"] - THD_V_AVG),
    Math.abs(event["B_THD-V"] - THD_V_AVG)
  );
  let THD_V_MAX_DEV_PERCENT = (THD_V_MAX_DEV / THD_V_AVG) * 100;

  let THD_I_AVG = (event["R_THD-I"] + event["Y_THD-I"] + event["B_THD-I"]) / 3;
  let THD_I_MAX_DEV = Math.max(
    Math.abs(event["R_THD-I"] - THD_I_AVG),
    Math.abs(event["Y_THD-I"] - THD_I_AVG),
    Math.abs(event["B_THD-I"] - THD_I_AVG)
  );
  let THD_I_MAX_DEV_PERCENT = (THD_I_MAX_DEV / THD_I_AVG) * 100;

  function getPFDetails(pf) {
    if (pf > 0.99)
      return { level: "Excellent", type: "Incentive", percent: 1.0 };
    if (pf > 0.98)
      return { level: "Very Good", type: "Incentive", percent: 0.75 };
    if (pf > 0.95) return { level: "Good", type: "Incentive", percent: 0.5 };
    if (pf >= 0.9) return { level: "Neutral", type: "None", percent: 0.0 };
    if (pf >= 0.85) return { level: "Low", type: "Penalty", percent: -2.0 };
    if (pf >= 0.8) return { level: "Very Low", type: "Penalty", percent: -5.0 };
    return { level: "Critical", type: "Penalty", percent: -10.0 };
  }

  let R_PF_INFO = getPFDetails(event.R_PF);
  let Y_PF_INFO = getPFDetails(event.Y_PF);
  let B_PF_INFO = getPFDetails(event.B_PF);
  let AVG_PF_INFO = getPFDetails(event.AVG_PF);

  const payload = {
    ...event,
    // VLL_MAX_DEV: VLL_MAX_DEV.toFixed(2),
    // VLL_MAX_DEV_PERCENT: VLL_MAX_DEV_PERCENT.toFixed(2),
    // VLN_MAX_DEV: VLN_MAX_DEV.toFixed(2),
    // VLN_MAX_DEV_PERCENT: VLN_MAX_DEV_PERCENT.toFixed(2),
    // I_MAX_DEV: I_MAX_DEV.toFixed(2),
    // I_MAX_DEV_PERCENT: I_MAX_DEV_PERCENT.toFixed(2),
    // FREQ_DEV: FREQ_DEV.toFixed(2),
    // FREQ_DEV_PERCENT: FREQ_DEV_PERCENT.toFixed(2),
    // THD_V_AVG: THD_V_AVG.toFixed(2),
    // THD_V_MAX_DEV: THD_V_MAX_DEV.toFixed(2),
    // THD_V_MAX_DEV_PERCENT: THD_V_MAX_DEV_PERCENT.toFixed(2),
    // THD_I_AVG: THD_I_AVG.toFixed(2),
    // THD_I_MAX_DEV: THD_I_MAX_DEV.toFixed(2),
    // THD_I_MAX_DEV_PERCENT: THD_I_MAX_DEV_PERCENT.toFixed(2),
    // R_PF_LEVEL: R_PF_INFO.level,
    // R_PF_CRITERIA_TYPE: R_PF_INFO.type,
    // R_PF_CRITERIA_PERCENT: R_PF_INFO.percent.toFixed(2),
    // Y_PF_LEVEL: Y_PF_INFO.level,
    // Y_PF_CRITERIA_TYPE: Y_PF_INFO.type,
    // Y_PF_CRITERIA_PERCENT: Y_PF_INFO.percent.toFixed(2),
    // B_PF_LEVEL: B_PF_INFO.level,
    // B_PF_CRITERIA_TYPE: B_PF_INFO.type,
    // B_PF_CRITERIA_PERCENT: B_PF_INFO.percent.toFixed(2),
    // AVG_PF_LEVEL: AVG_PF_INFO.level,
    // AVG_PF_CRITERIA_TYPE: AVG_PF_INFO.type,
    // AVG_PF_CRITERIA_PERCENT: AVG_PF_INFO.percent.toFixed(2),
  };

  return { statusCode: 200, body: payload };
};
