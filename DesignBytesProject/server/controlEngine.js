import { MR_MODES, POWER_MODES } from "../src/data/mockData.js";

const FC_CONTROL_STATE_CODES = {
  Sleep: 0,
  Stopped: 1,
  "Start Processing": 2,
  "PS Available": 3,
  "Stop Processing": 4,
  "Error Stopped": 5,
  "Service Mode": 6,
  Idle: 7,
};

function normalizeBinary(value) {
  return Boolean(value);
}

function normalizePowerMode(value) {
  if (!value) {
    return null;
  }

  if (Object.values(POWER_MODES).includes(value)) {
    return value;
  }

  return null;
}

function normalizeMrMode(value) {
  if (!value) {
    return null;
  }

  if (Object.values(MR_MODES).includes(value)) {
    return value;
  }

  return null;
}

function resolvePowerModeFromCommand(actionId, currentPowerMode) {
  if (actionId === "genset_off") {
    return POWER_MODES.gensetOff;
  }

  if (actionId === "power_on") {
    return POWER_MODES.powerGenerationOn;
  }

  if (actionId === "power_off") {
    return POWER_MODES.powerGenerationOff;
  }

  return currentPowerMode;
}

function resolveBaseValves(powerMode) {
  if (powerMode === POWER_MODES.gensetOff) {
    return { V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, V6: null, V7: 0 };
  }

  if (powerMode === POWER_MODES.powerGenerationOff) {
    return { V1: 1, V2: 0, V3: 0, V4: 1, V5: 0, V6: null, V7: 0 };
  }

  return { V1: 1, V2: 1, V3: 1, V4: 1, V5: 0, V6: null, V7: 0 };
}

function resolveCanRequest({ controlState, outputValueW, outputUpperLimitW }) {
  return {
    canId: "0x441",
    cycleMs: 20,
    outputValueW,
    outputUpperLimitW,
    controlStateCode: FC_CONTROL_STATE_CODES[controlState] ?? 1,
  };
}

function resolveStatusBit(value) {
  return value ? 1 : 0;
}

export function createInitialControlSystem() {
  return {
    powerMode: POWER_MODES.powerGenerationOn,
    mrMode: MR_MODES.run,
    h2BypassRequested: false,
    pressureBypassActive: false,
    pressureThresholdReached: false,
    pressurePsi: 0,
    pressureThresholdPsi: 27,
    valves: resolveBaseValves(POWER_MODES.powerGenerationOn),
    canRequest: resolveCanRequest({
      controlState: "Start Processing",
      outputValueW: 100,
      outputUpperLimitW: 200,
    }),
    fcStatusSignals: {
      emergencySwitchState: 1,
      fcOutputLimitByOverheat: 0,
      fcOutputLimitByCellvol: 1,
      warningD4: 1,
    },
  };
}

export function deriveControlSystem({
  previousControlSystem = createInitialControlSystem(),
  actionId = null,
  payload = {},
  dashboardState,
}) {
  const pressurePsi =
    Number(
      payload.h2PressurePsi ??
        payload.h2Pressure ??
        payload.methanolReformer?.h2PressurePsi ??
        previousControlSystem.pressurePsi,
    ) || 0;
  const pressureThresholdPsi =
    Number(payload.h2BypassThresholdPsi ?? previousControlSystem.pressureThresholdPsi) || 27;
  const h2BypassRequested =
    actionId === "h2_bypass"
      ? !previousControlSystem.h2BypassRequested
      : normalizeBinary(payload.h2BypassRequested ?? previousControlSystem.h2BypassRequested);
  const powerMode =
    normalizePowerMode(payload.powerMode) ??
    normalizePowerMode(payload.controlSystem?.powerMode) ??
    resolvePowerModeFromCommand(actionId, previousControlSystem.powerMode);
  const mrMode =
    normalizeMrMode(payload.mrMode) ??
    normalizeMrMode(payload.methanolReformer?.mrMode) ??
    normalizeMrMode(payload.controlSystem?.mrMode) ??
    previousControlSystem.mrMode ??
    MR_MODES.run;
  const pressureThresholdReached = pressurePsi >= pressureThresholdPsi;
  const pressureBypassActive = normalizeBinary(
    payload.pressureBypassActive ??
      payload.controlSystem?.pressureBypassActive ??
      pressureThresholdReached,
  );
  const resolvedH2BypassRequested =
    actionId === "h2_bypass"
      ? !previousControlSystem.h2BypassRequested
      : normalizeBinary(
          payload.h2BypassRequested ??
            payload.controlSystem?.h2BypassRequested ??
            previousControlSystem.h2BypassRequested,
        );

  const valves = resolveBaseValves(powerMode);

  if (resolvedH2BypassRequested || pressureBypassActive) {
    valves.V5 = 1;
    valves.V7 = 1;
  }

  const outputMetric = dashboardState.fuelCell.metrics.find((metric) => metric.label === "Output Value");
  const outputUpperLimitMetric = dashboardState.fuelCell.metrics.find(
    (metric) => metric.label === "Output Upper Limit",
  );
  const emergencyStatus = dashboardState.fuelCell.status.find((status) => status.id === 1);
  const overheatStatus = dashboardState.fuelCell.status.find((status) => status.id === 2);
  const cellVoltageStatus = dashboardState.fuelCell.status.find((status) => status.id === 3);
  const warningStatus = dashboardState.fuelCell.activeAlerts.find((alert) => alert.id === "warnings");

  return {
    powerMode,
    mrMode,
    h2BypassRequested: resolvedH2BypassRequested,
    pressureBypassActive,
    pressureThresholdReached,
    pressurePsi,
    pressureThresholdPsi,
    valves,
    canRequest: resolveCanRequest({
      controlState: dashboardState.fuelCell.controlState.active,
      outputValueW: outputMetric?.value ?? 0,
      outputUpperLimitW: outputUpperLimitMetric?.value ?? 0,
    }),
    fcStatusSignals: {
      emergencySwitchState: resolveStatusBit(emergencyStatus?.value === "ON"),
      fcOutputLimitByOverheat: resolveStatusBit(overheatStatus?.value === "ON"),
      fcOutputLimitByCellvol: resolveStatusBit(cellVoltageStatus?.value === "ON"),
      warningD4: resolveStatusBit((warningStatus?.count ?? 0) > 0),
    },
  };
}
