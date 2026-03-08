import {
  ACTIVE_ALERTS,
  BOTTOM_ACTIONS,
  CONTROL_STATES,
  createFallbackDashboardState,
  HMI_PAGES,
} from "../src/data/mockData.js";

// If Python stops sending data for this long, we mark the bridge as offline.
const PYTHON_STALE_AFTER_MS = 10000;
// Rolling window used for smoothing detector density spikes like 2 PPM.
const DENSITY_AVERAGE_WINDOW = 5;
const POWER_STATE_ON = "on";
const POWER_STATE_OFF = "off";

// Default command availability when Python does not explicitly send allowed actions.
const COMMANDS_BY_CONTROL_STATE = {
  Stopped: ["power_off"],
  Sleep: ["power_off"],
  "Service Mode": ["genset_off", "h2_bypass"],
  "PS Available": ["power_off"],
  "Start Processing": ["power_off"],
  Idle: ["power_off", "h2_bypass"],
  "Stop Processing": ["power_off"],
};

// Safely converts incoming alert counts into non-negative integers.
function normalizeCount(value, fallback = 0) {
  const count = Number.parseInt(value, 10);
  return Number.isFinite(count) && count >= 0 ? count : fallback;
}

// Converts raw values from Python/API payloads into numbers when possible.
function normalizeNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

// Accepts different action name formats and maps them to known footer action ids.
function normalizeActionId(value) {
  if (!value) {
    return null;
  }

  const actionId = String(value).trim().toLowerCase().replace(/\s+/g, "_");

  return BOTTOM_ACTIONS.find((action) => action.id === actionId || action.label.toLowerCase() === String(value).trim().toLowerCase())?.id ?? null;
}

// Maps text from Python into one of the allowed control-state labels.
function normalizeControlState(value) {
  if (!value) {
    return null;
  }

  return CONTROL_STATES.find((state) => state.toLowerCase() === String(value).trim().toLowerCase()) ?? null;
}

// Accepts boolean or text power flags and normalizes them to on/off.
function normalizePowerState(value) {
  if (value === true) {
    return POWER_STATE_ON;
  }

  if (value === false) {
    return POWER_STATE_OFF;
  }

  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase();

  if (normalizedValue === "on" || normalizedValue === "powered_on") {
    return POWER_STATE_ON;
  }

  if (normalizedValue === "off" || normalizedValue === "powered_off") {
    return POWER_STATE_OFF;
  }

  return null;
}

function normalizePageKey(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (normalizedValue === HMI_PAGES.fuelCell || normalizedValue === "fuelcell") {
    return HMI_PAGES.fuelCell;
  }

  if (normalizedValue === HMI_PAGES.methanolReformer || normalizedValue === "mr") {
    return HMI_PAGES.methanolReformer;
  }

  return null;
}

// Merges partial ECU updates from Python into the existing ECU shape.
function mergeSystemEcu(update, currentSystemEcu) {
  const nextSystemEcu = {
    outputRequest: { ...currentSystemEcu.outputRequest },
    startStop: { ...currentSystemEcu.startStop },
  };

  if (update?.outputRequest) {
    nextSystemEcu.outputRequest = {
      ...nextSystemEcu.outputRequest,
      ...update.outputRequest,
      value: String(update.outputRequest.value ?? nextSystemEcu.outputRequest.value),
    };
  }

  if (update?.startStop) {
    nextSystemEcu.startStop = {
      ...nextSystemEcu.startStop,
      ...update.startStop,
      value: String(update.startStop.value ?? nextSystemEcu.startStop.value),
    };
  }

  return nextSystemEcu;
}

// Rebuilds the methanol parameter grid while preserving missing values from the current state.
function mergeSystemParameters(parameters, currentParameters) {
  if (!Array.isArray(parameters) || parameters.length === 0) {
    return currentParameters.map((parameter) => ({ ...parameter }));
  }

  const nextParameters = currentParameters.map((parameter) => ({ ...parameter }));
  const indexById = new Map(nextParameters.map((parameter, index) => [parameter.id, index]));
  const indexByLabel = new Map(
    nextParameters.map((parameter, index) => [parameter.label.trim().toLowerCase(), index]),
  );

  parameters.forEach((parameter, index) => {
    const labelKey = parameter.label?.trim().toLowerCase();
    const existingIndex =
      (parameter.id && indexById.has(parameter.id) ? indexById.get(parameter.id) : undefined) ??
      (labelKey && indexByLabel.has(labelKey) ? indexByLabel.get(labelKey) : undefined);

    if (existingIndex !== undefined) {
      nextParameters[existingIndex] = {
        ...nextParameters[existingIndex],
        ...parameter,
        value: String(parameter.value ?? nextParameters[existingIndex].value ?? "--"),
      };
      return;
    }

    nextParameters.push({
      id: parameter.id ?? `parameter_${index + 1}`,
      label: parameter.label ?? `Parameter ${index + 1}`,
      value: String(parameter.value ?? "--"),
    });
  });

  return nextParameters;
}

// Supports both object-style alert payloads and full alert arrays from Python.
function mergeAlerts(alerts, currentAlerts) {
  if (!alerts) {
    return currentAlerts.map((alert) => ({ ...alert }));
  }

  if (Array.isArray(alerts)) {
    return alerts.map((alert, index) => ({
      id: alert.id ?? currentAlerts[index]?.id ?? `alert_${index + 1}`,
      label: alert.label ?? currentAlerts[index]?.label ?? `Alert ${index + 1}`,
      type: alert.type ?? currentAlerts[index]?.type ?? "warning",
      count: normalizeCount(alert.count, currentAlerts[index]?.count ?? 0),
    }));
  }

  return ACTIVE_ALERTS.map((alert) => ({
    ...alert,
    count: normalizeCount(alerts[alert.id], alert.count),
  }));
}

// Marks which footer commands are currently enabled in the UI.
function buildCommandList(enabledIds) {
  return BOTTOM_ACTIONS.map((action) => ({
    ...action,
    enabled: enabledIds.includes(action.id),
  }));
}

// Prevents duplicate action ids when command sources overlap.
function dedupeActionIds(actionIds) {
  return [...new Set(actionIds)];
}

// Computes which footer buttons should be clickable for the current system state.
function resolveEnabledActionIds(controlState, availableCommands, powerState) {
  if (powerState === POWER_STATE_OFF) {
    return ["power_on"];
  }

  if (Array.isArray(availableCommands) && availableCommands.length > 0) {
    return dedupeActionIds([
      ...availableCommands
      .map(normalizeActionId)
      .filter(Boolean),
      "power_off",
    ]);
  }

  return dedupeActionIds([...(COMMANDS_BY_CONTROL_STATE[controlState] ?? []), "power_off"]);
}

// Pulls density readings from any of the accepted payload field names.
function collectDensitySamples(payload) {
  const rawSamples = [];

  const directValue =
    payload.externalDetectorDensityPpm ??
    payload.externalDetectorDensity ??
    payload.fuelCell?.externalDetectorDensityPpm ??
    payload.fuelCell?.externalDetectorDensity;

  const sampleList =
    payload.externalDetectorDensitySamplesPpm ??
    payload.externalDetectorDensitySamples ??
    payload.fuelCell?.externalDetectorDensitySamplesPpm ??
    payload.fuelCell?.externalDetectorDensitySamples;

  if (Array.isArray(sampleList)) {
    rawSamples.push(...sampleList);
  }

  if (directValue !== undefined) {
    rawSamples.push(directValue);
  }

  return rawSamples
    .map(normalizeNumber)
    .filter((value) => value !== null);
}

// Keeps metric numeric value and formatted UI value in sync.
function updateMetric(metric, nextValue, unit = metric.unit) {
  metric.value = nextValue;
  metric.unit = unit;
  metric.displayValue = `${nextValue} ${unit}`;
}

export class DashboardStore {
  constructor() {
    // Starts with frontend fallback data so the UI has a full shape immediately.
    this.state = createFallbackDashboardState();
    // Commands clicked in the UI are queued here for Python to read back.
    this.commandLog = [];
    this.commandSequence = 0;
    // Subscribers are the WebSocket broadcaster in server/index.js.
    this.listeners = new Set();
    this.lastPythonUpdateMs = 0;
    this.densitySamples = [normalizeNumber(this.state.fuelCell.metrics[2].value) ?? 150];
  }

  // Forces the dashboard into a powered-down visual snapshot.
  applyPoweredOffView() {
    this.state.meta.systemPower = POWER_STATE_OFF;
    this.state.fuelCell.controlState.active = "Stopped";
    this.state.methanolReformer.controlState.active = "Stopped";
    this.state.fuelCell.activeAlerts = this.state.fuelCell.activeAlerts.map((alert) => ({
      ...alert,
      count: 0,
    }));
    this.state.fuelCell.systemEcu = mergeSystemEcu(
      {
        outputRequest: { value: "0", unit: "W" },
        startStop: { value: "OFF" },
      },
      this.state.fuelCell.systemEcu,
    );

    const outputMetric = this.state.fuelCell.metrics.find((metric) => metric.label === "Output Value");
    const densityMetric = this.state.fuelCell.metrics.find(
      (metric) => metric.label === "External Detector Density",
    );

    if (outputMetric) {
      updateMetric(outputMetric, 0, "W");
    }

    if (densityMetric) {
      updateMetric(densityMetric, 0, "PPM");
      densityMetric.rawValue = 0;
      densityMetric.averageWindow = 1;
    }

    this.densitySamples = [0];
    this.state.fuelCell.commands = buildCommandList(["power_on"]);
  }

  // Restores the dashboard into a powered-on transitional state until Python updates arrive.
  applyPoweredOnView() {
    this.state.meta.systemPower = POWER_STATE_ON;
    this.state.fuelCell.controlState.active = "Start Processing";
    this.state.fuelCell.commands = buildCommandList(["power_off"]);
  }

  setActivePage(pageKey) {
    const normalizedPage = normalizePageKey(pageKey);

    if (!normalizedPage) {
      throw new Error("Unknown page requested by UI");
    }

    if (this.state.meta.activePage === normalizedPage) {
      return this.getSnapshot();
    }

    this.state.meta.activePage = normalizedPage;
    this.emit("ui:page");
    return this.getSnapshot();
  }

  getContext() {
    return {
      activePage: this.state.meta.activePage,
      systemPower: this.state.meta.systemPower,
    };
  }

  // Lets the server attach a listener that will broadcast every state change.
  subscribe(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  // Returns a deep copy so callers cannot mutate the internal store directly.
  getSnapshot() {
    return structuredClone(this.state);
  }

  // Notifies all subscribers whenever the in-memory HMI state changes.
  emit(reason) {
    const snapshot = this.getSnapshot();

    for (const listener of this.listeners) {
      listener({ reason, snapshot });
    }
  }

  // Flips the Python bridge status when updates go stale.
  refreshPythonBridgeStatus() {
    const isOnline = this.lastPythonUpdateMs > 0 && Date.now() - this.lastPythonUpdateMs < PYTHON_STALE_AFTER_MS;

    if (this.state.meta.pythonBridgeOnline !== isOnline) {
      this.state.meta.pythonBridgeOnline = isOnline;
      this.emit("python:bridge-status");
    }
  }

  // Keeps metadata about connected browser clients updated.
  setUiClientCount(count) {
    if (this.state.meta.uiClientCount === count) {
      return;
    }

    this.state.meta.uiClientCount = count;
    this.emit("ui:client-count");
  }

  // Main ingestion point for new telemetry sent by the Python bridge.
  applyPythonUpdate(payload = {}) {
    const previousPowerState = this.state.meta.systemPower ?? POWER_STATE_ON;
    const payloadPage =
      normalizePageKey(payload.page ?? payload.screen ?? payload.targetPage) ??
      this.state.meta.activePage ??
      HMI_PAGES.fuelCell;
    const nextControlState =
      normalizeControlState(payload.controlState) ??
      normalizeControlState(payload.fuelCell?.controlState) ??
      (payloadPage === HMI_PAGES.methanolReformer
        ? this.state.methanolReformer.controlState.active
        : this.state.fuelCell.controlState.active);
    const nextPowerState =
      normalizePowerState(payload.powerState) ??
      normalizePowerState(payload.isPoweredOn) ??
      normalizePowerState(payload.fuelCell?.powerState) ??
      normalizePowerState(payload.fuelCell?.isPoweredOn) ??
      previousPowerState;

    this.state.meta.systemPower = nextPowerState;

    if (previousPowerState === POWER_STATE_OFF && nextPowerState === POWER_STATE_ON) {
      this.densitySamples = [];
    }

    if (nextPowerState === POWER_STATE_OFF) {
      this.applyPoweredOffView();
      this.lastPythonUpdateMs = Date.now();
      this.state.meta.pythonBridgeOnline = true;
      this.state.meta.lastPythonUpdateAt = new Date(this.lastPythonUpdateMs).toISOString();
      this.state.meta.pythonSource = payload.source ?? "python-bridge";
      this.emit("python:update");
      return this.getSnapshot();
    }

    if (payloadPage === HMI_PAGES.fuelCell) {
      // Smooth sudden sensor spikes before sending them to the UI.
      const densitySamples = collectDensitySamples(payload);

      if (densitySamples.length > 0) {
        this.densitySamples.push(...densitySamples);
        this.densitySamples = this.densitySamples.slice(-DENSITY_AVERAGE_WINDOW);

        const latestSample = this.densitySamples[this.densitySamples.length - 1];
        const averageSample = Math.round(
          this.densitySamples.reduce((sum, sample) => sum + sample, 0) / this.densitySamples.length,
        );

        const externalDetectorDensityMetric = this.state.fuelCell.metrics.find(
          (metric) => metric.label === "External Detector Density",
        );

        if (externalDetectorDensityMetric) {
          updateMetric(externalDetectorDensityMetric, averageSample, "PPM");
          externalDetectorDensityMetric.rawValue = latestSample;
          externalDetectorDensityMetric.averageWindow = this.densitySamples.length;
        }
      }

      const outputValue = normalizeNumber(payload.outputValueW ?? payload.fuelCell?.outputValueW);
      const outputUpperLimit = normalizeNumber(payload.outputUpperLimitW ?? payload.fuelCell?.outputUpperLimitW);

      if (outputValue !== null) {
        const outputMetric = this.state.fuelCell.metrics.find((metric) => metric.label === "Output Value");

        if (outputMetric) {
          updateMetric(outputMetric, outputValue, "W");
        }
      }

      if (outputUpperLimit !== null) {
        const upperLimitMetric = this.state.fuelCell.metrics.find((metric) => metric.label === "Output Upper Limit");

        if (upperLimitMetric) {
          updateMetric(upperLimitMetric, outputUpperLimit, "W");
        }
      }

      this.state.fuelCell.activeAlerts = mergeAlerts(payload.activeAlerts, this.state.fuelCell.activeAlerts);
      this.state.fuelCell.systemEcu = mergeSystemEcu(payload.systemEcu, this.state.fuelCell.systemEcu);
      this.state.fuelCell.controlState.active = nextControlState;
      this.state.fuelCell.commands = buildCommandList(
        resolveEnabledActionIds(nextControlState, payload.availableCommands, nextPowerState),
      );
    }

    if (payloadPage === HMI_PAGES.methanolReformer) {
      this.state.methanolReformer.controlState.active =
        normalizeControlState(payload.methanolReformer?.controlState ?? payload.controlState) ??
        this.state.methanolReformer.controlState.active;
      this.state.methanolReformer.systemParameters = mergeSystemParameters(
        payload.methanolReformer?.systemParameters ?? payload.systemParameters,
        this.state.methanolReformer.systemParameters,
      );
    }

    this.lastPythonUpdateMs = Date.now();
    this.state.meta.pythonBridgeOnline = true;
    this.state.meta.lastPythonUpdateAt = new Date(this.lastPythonUpdateMs).toISOString();
    this.state.meta.pythonSource = payload.source ?? "python-bridge";

    this.emit("python:update");

    return this.getSnapshot();
  }

  // Records a UI button press so Python can consume it on the next poll.
  createUiCommand(actionId) {
    const normalizedActionId = normalizeActionId(actionId);

    if (!normalizedActionId) {
      throw new Error("Unknown action requested by UI");
    }

    const action = this.state.fuelCell.commands.find((candidate) => candidate.id === normalizedActionId);

    if (!action?.enabled) {
      throw new Error("Requested action is not enabled for the current control state");
    }

    const command = {
      id: ++this.commandSequence,
      actionId: action.id,
      label: action.label,
      requestedAt: new Date().toISOString(),
    };

    this.commandLog.push(command);
    this.commandLog = this.commandLog.slice(-50);

    this.state.meta.lastUiCommandAt = command.requestedAt;
    this.state.meta.lastCommand = command;

    if (command.actionId === "power_off") {
      this.applyPoweredOffView();
    }

    if (command.actionId === "power_on") {
      this.applyPoweredOnView();
    }

    this.emit("ui:command");

    return command;
  }

  // Returns only commands newer than the last id seen by Python.
  getCommands(afterId = 0) {
    return this.commandLog.filter((command) => command.id > afterId);
  }
}
