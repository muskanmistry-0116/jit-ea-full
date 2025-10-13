module.exports = function buildInsertSQL(data) {
  const table = "telemetry_data3";
  // const ts = `${data.ts || Math.floor(Date.now() / 1000)}`;
  const columns = [],
    values = [];

  for (const [key, value] of Object.entries(data)) {
    // if (key === "ts") continue;
    columns.push(key);
    values.push(typeof value === "string" ? `'${value}'` : value ?? "NULL");
  }

  // columns.push("ts");
  // values.push(ts);

  return `INSERT INTO ${table} (${columns.join(",")}) VALUES (${values.join(
    ","
  )})`;
};
