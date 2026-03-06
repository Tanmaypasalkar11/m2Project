export const FUEL_CELL_STATUS = [
  { id: 1, label: "Emergency switch state",     value: "ON",  color: "green" },
  { id: 2, label: "Limit by overheat",           value: "OFF", color: "red"   },
  { id: 3, label: "Limit by cellvol",            value: "ON",  color: "green" },
  { id: 4, label: "Power generation restricted", value: "OFF", color: "red"   },
  { id: 5, label: "PG- Stopped",                value: "ON",  color: "green" },
];

export const FUEL_CELL_METRICS = [
  { id: 1, label: "Output Value",              value: "100 W",   iconType: "arrow-up" },
  { id: 2, label: "Output Upper Limit",        value: "200 W",   iconType: "gauge"    },
  { id: 3, label: "External Detector Density", value: "150 PPM", iconType: "signal"   },
];

export const SYSTEM_ECU = {
  outputRequest: { label: "Output Request",       value: "750", unit: "W"  },
  startStop:     { label: "Start - Stop (FCCMD)", value: "OFF", unit: null },
};

export const ACTIVE_ALERTS = [
  { id: 1, count: 1, label: "Shutdowns", type: "danger"  },
  { id: 2, count: 4, label: "Warnings",  type: "warning" },
];

export const CONTROL_STATES = [
  "Stopped", "Sleep", "Service Mode", "PS Available",
  "Start Processing", "Idle", "Stop Processing",
];

export const BOTTOM_ACTIONS = [
  { id: 1, label: "Genset OFF", variant: "inactive" },
  { id: 2, label: "Power ON",   variant: "active"   },
  { id: 3, label: "Power OFF",  variant: "danger"   },
  { id: 4, label: "H2 Bypass",  variant: "inactive" },
];

export const TABS = ["Fuel Cell", "Methanol Reformer"];

export const DASHBOARD_META = {
  poweredBy: "Design Bytes",
};
