export const TABS = ["Fuel Cell", "Methanol Reformer"];
export const HMI_PAGES = {
  fuelCell: "fuel_cell",
  methanolReformer: "methanol_reformer",
};

export const CONTROL_STATES = [
  "Stopped",
  "Sleep",
  "Service Mode",
  "PS Available",
  "Start Processing",
  "Idle",
  "Stop Processing",
];

export const FUEL_CELL_STATUS = [
  { id: 1, label: "Emergency switch state", value: "ON", color: "green" },
  { id: 2, label: "Limit by overheat", value: "OFF", color: "red" },
  { id: 3, label: "Limit by cellvol", value: "ON", color: "green" },
  { id: 4, label: "Power generation restricted", value: "OFF", color: "red" },
  { id: 5, label: "PG- Stopped", value: "ON", color: "green" },
];

export const FUEL_CELL_METRICS = [
  { id: 1, label: "Output Value", value: 100, unit: "W", iconType: "arrow-up" },
  { id: 2, label: "Output Upper Limit", value: 200, unit: "W", iconType: "gauge" },
  { id: 3, label: "External Detector Density", value: 150, unit: "PPM", iconType: "signal" },
];

export const SYSTEM_ECU = {
  outputRequest: { label: "Output Request", value: "750", unit: "W" },
  startStop: { label: "Start - Stop (FCCMD)", value: "OFF", unit: null },
};

export const ACTIVE_ALERTS = [
  { id: "shutdowns", count: 1, label: "Shutdowns", type: "danger" },
  { id: "warnings", count: 4, label: "Warnings", type: "warning" },
];

export const BOTTOM_ACTIONS = [
  { id: "genset_off", label: "Genset OFF", variant: "default", icon: "/GenSetlogo.svg" },
  { id: "power_on", label: "Power ON", variant: "green", icon: "/power-01.svg" },
  { id: "power_off", label: "Power OFF", variant: "red", icon: "/stop.svg" },
  { id: "h2_bypass", label: "H2 Bypass", variant: "default", icon: "/H2Logo.svg" },
];

export const DASHBOARD_META = {
  poweredBy: "Design Bytes",
};

export const METHANOL_REFORMER_SYSTEM_PARAMETERS = [
  { id: "h2_pressure", label: "H2 Pressure", value: "10%" },
  { id: "h2_flow", label: "H2 Flow", value: "10%" },
  { id: "reformer_in", label: "Reformer In", value: "30%" },
  { id: "reformer_out", label: "Reformer Out", value: "30%" },
  { id: "membrane_in", label: "Membrane In", value: "30%" },
  { id: "membrane_out", label: "Membrane Out", value: "25%" },
  { id: "major_fault_code", label: "Major Fault Code", value: "213" },
  { id: "thermal_cycle_temp", label: "Thermal Cycle Temp", value: "30%" },
  { id: "stack_voltage", label: "Stack Voltage", value: "25%" },
  { id: "major_fault_status", label: "Major Fault Status", value: "None" },
];

function formatMetric(metric) {
  return {
    ...metric,
    displayValue: `${metric.value} ${metric.unit}`,
  };
}

function cloneSystemEcu() {
  return {
    outputRequest: { ...SYSTEM_ECU.outputRequest },
    startStop: { ...SYSTEM_ECU.startStop },
  };
}

function cloneAlerts() {
  return ACTIVE_ALERTS.map((alert) => ({ ...alert }));
}

function cloneStatus() {
  return FUEL_CELL_STATUS.map((status) => ({ ...status }));
}

function cloneMetrics() {
  return FUEL_CELL_METRICS.map((metric) => formatMetric({ ...metric }));
}

function cloneCommands(enabledIds = ["power_off"]) {
  return BOTTOM_ACTIONS.map((action) => ({
    ...action,
    enabled: enabledIds.includes(action.id),
  }));
}

function cloneMethanolParameters() {
  return METHANOL_REFORMER_SYSTEM_PARAMETERS.map((parameter) => ({ ...parameter }));
}

export function createFallbackDashboardState() {
  return {
    meta: {
      poweredBy: DASHBOARD_META.poweredBy,
      activePage: HMI_PAGES.fuelCell,
      systemPower: "on",
      pythonBridgeOnline: false,
      uiClientCount: 0,
      lastPythonUpdateAt: null,
      lastUiCommandAt: null,
      lastCommand: null,
    },
    fuelCell: {
      status: cloneStatus(),
      metrics: cloneMetrics(),
      systemEcu: cloneSystemEcu(),
      activeAlerts: cloneAlerts(),
      controlState: {
        states: [...CONTROL_STATES],
        active: "Stopped",
      },
      commands: cloneCommands(),
    },
    methanolReformer: {
      systemParameters: cloneMethanolParameters(),
      controlState: {
        states: [...CONTROL_STATES],
        active: "Stopped",
      },
    },
  };
}
