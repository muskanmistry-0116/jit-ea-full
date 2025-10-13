require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser"); 
const connectDB = require("./config/db");
const cors = require("./config/cors");  
const errorHandler = require("./middlewares/errorHandler");
const telemetryRoutes = require("./routes/v1/telemetry");
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] },
});

// Middlewares
app.set("trust proxy", 1);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50000 }));
app.use(cors);
app.use(bodyParser.json());

// Attach io to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("Socket connected:", {
    id: socket.id,
    handshake: socket.handshake,
    address: socket.handshake.address,
    time: new Date().toISOString(),
  });
  socket.on("disconnect", (reason) => {
    console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Routes
app.use("/api/v1/telemetry", telemetryRoutes);

// Error handler
app.use(errorHandler);

// Socket handler
// require("./sockets")(io);

// Server listen
const PORT = process.env.PORT || 9002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server, io };
