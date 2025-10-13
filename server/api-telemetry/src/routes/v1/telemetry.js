const express = require("express");
const router = express.Router();
const authenticateToken = require("../../middlewares/auth");
const telemetryController = require("../../controllers/telemetryController");
const telemetryController2 = require("../../controllers/telemetryInsertFunc");

const apiKeyAuth = require("../../middlewares/apiKeyAuth");

router.post("/", apiKeyAuth, telemetryController2.insertTelemetry);

router.get("/", authenticateToken, telemetryController.getTelemetry);

router.get("/rtl",  telemetryController.getRtlTelemetry);
router.get("/rtl2",  telemetryController.getRtlTelemetry2);

module.exports = router;
