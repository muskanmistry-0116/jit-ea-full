const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      trim: true,
    },
    make: {
      type: String,
      default: null,
    },
    model: {
      type: String,
      default: null,
    },
    std_current_rating: {
      type: String,
      default: null,
    },
    maximum_load: {
      type: String,
      default: null,
    },
    floating_current_R: {
      type: String,
      default: null,
    },
    floating_current_Y: {
      type: String,
      default: null,
    },
    floating_current_B: {
      type: String,
      default: null,
    },
    load_current_R: {
      type: String,
      default: null,
    },
    load_current_Y: {
      type: String,
      default: null,
    },
    load_current_B: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    deviceId: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      // required: true,
      required: false,
      // required: function () {
      //   return this.role !== "admin";
      // },
    },
    // machine: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Machine",
    //   // required: true,
    //   required: false,
    //   // required: function () {
    //   //   return this.role !== "admin";
    //   // },
    // },
    data_interval: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPaymentDelay: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    awsTopicName: {
      type: String,
      required: true,
      unique: true,
    },
    // --- New Optional Fields ---
    locationTag: { type: String, default: null },
    departmentZone: { type: String, default: null },
    description: { type: String, default: null },
    ratedVoltage: { type: String, default: null },
    ratedCurrent: { type: String, default: null },
    idleCurrentRange: { type: String, default: null },
    ratedFrequency: { type: String, default: null },
    powerRating: { type: String, default: null },
    breakerContactorRating: { type: String, default: null },
    ctRatio: { type: String, default: null },
    ptRatio: { type: String, default: null },
    starterType: { type: String, default: null },
    numberOfFeeders: { type: Number, default: null },
    pfPenaltyThreshold: { type: Number, default: null },
    voltageImbalanceTolerance: { type: Number, default: null },
    currentImbalanceTolerance: { type: Number, default: null },
    overloadThreshold: { type: Number, default: null },
    idleLoadThreshold: { type: Number, default: null },
    loadFactorTarget: { type: Number, default: null },
    harmonicLimitVoltage: { type: Number, default: null },
    harmonicLimitCurrent: { type: Number, default: null },
    maxFrequencyDeviation: { type: Number, default: null },
    machineEfficiency: { type: Number, default: null },
    transformerEfficiencyRef: { type: Number, default: null },
    energyLossBaseline: { type: Number, default: null },
    secBaseline: { type: Number, default: null },
    energyCharge: { type: Number, default: null },
    installationDate: { type: Date, default: null },
    lastMaintenanceDate: { type: Date, default: null },
    maintenanceCycleDays: { type: Number, default: null },
    runtimeHoursBenchmarkPerDay: { type: Number, default: null },
    runtimeLimitForService: { type: Number, default: null },
    alarmNotificationEmails: { type: [String], default: [] },
    overvoltage: { type: Boolean, default: false },
    undervoltage: { type: Boolean, default: false },
    overload: { type: Boolean, default: false },
    loadPhaseImbalance: { type: Boolean, default: false },
    lowPowerFactor: { type: Boolean, default: false },
    frequencyDrop: { type: Boolean, default: false },
    idleRunning: { type: Boolean, default: false },
    frequentStartStop: { type: Boolean, default: false },
    modbusAddress: { type: String, default: null },
    baudRate: { type: String, default: null },
    parityStopBits: { type: String, default: null },
    cloudSyncEnabled: { type: Boolean, default: false },
    deviceTypeUI: { type: String, default: null },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: false,
    },
  },
  { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;
