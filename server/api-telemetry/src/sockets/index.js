const jwt = require("jsonwebtoken");
const axios = require("axios");

const QUESTDB_URL = process.env.QUESTDB_URL;

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      if (userId) socket.join(userId.toString());
    });

    socket.on("authenticate", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(decoded.id);
        socket.emit("authenticated", { success: true, userId: decoded.id });
      } catch (err) {
        socket.emit("authenticated", {
          success: false,
          message: "Invalid token",
        });
        socket.disconnect();
      }
    });

    socket.on("get-qecho", async (params = {}) => {
      try {
        const limit = parseInt(params.limit) || 50;
        const sql = `SELECT * FROM telemetry_data3 ORDER BY ts DESC LIMIT ${limit}`;
        const { data } = await axios.get(QUESTDB_URL, {
          params: { query: sql },
        });

        const rows = data.dataset.map((row) =>
          Object.fromEntries(data.columns.map((col, i) => [col.name, row[i]]))
        );
        socket.emit("qecho-data", rows);
      } catch (err) {
        socket.emit("qecho-data", { error: err.message });
      }
    });

    socket.on("disconnect", () =>
      console.log("Socket disconnected:", socket.id)
    );
  });
};
