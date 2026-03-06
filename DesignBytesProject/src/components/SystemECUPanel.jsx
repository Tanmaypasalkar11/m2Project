import { SYSTEM_ECU } from "../data/mockData";

function DataRow({ label, value, unit }) {
  const hasUnit = Boolean(unit);

  return (
    <div className="system-ecu-row">
      <span className="system-ecu-label">{label}</span>

      <div className={`system-ecu-reading-wrap${hasUnit ? " system-ecu-reading-wrap--with-unit" : " system-ecu-reading-wrap--off"}`}>
        <span className={`system-ecu-reading${hasUnit ? " system-ecu-reading--with-unit" : " system-ecu-reading--off"}`}>{value}</span>
        {hasUnit ? (
          <span className="system-ecu-reading-unit system-ecu-reading-unit--with-unit">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
export default function SystemECUPanel() {
  return (
    <div className="system-ecu-panel">
      <h2 className="panel-title system-ecu-title">System ECU</h2>

      <DataRow
        label={SYSTEM_ECU.outputRequest.label}
        value={SYSTEM_ECU.outputRequest.value}
        unit={SYSTEM_ECU.outputRequest.unit}
      />

      <DataRow
        label={SYSTEM_ECU.startStop.label}
        value={SYSTEM_ECU.startStop.value}
        unit={SYSTEM_ECU.startStop.unit}
      />
    </div>
  );
}


