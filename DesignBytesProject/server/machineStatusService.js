import { STATUS_KEYS } from "./machineStatusRepository.js";

export function buildStatusesFromSnapshot(snapshot) {
  const activeState = snapshot?.fuelCell?.controlState?.active;
  const controlSystem = snapshot?.controlSystem;

  return {
    [STATUS_KEYS.systemPower]: snapshot?.meta?.systemPower === "on",
    [STATUS_KEYS.h2Bypass]: controlSystem?.h2BypassRequested || controlSystem?.pressureBypassActive,
    [STATUS_KEYS.serviceMode]: activeState === "Service Mode",
  };
}
