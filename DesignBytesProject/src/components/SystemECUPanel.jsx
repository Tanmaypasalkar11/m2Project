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
export default function SystemECUPanel({ systemEcu }) {
  return (
    <div className="system-ecu-panel">
      <h2 className="panel-title system-ecu-title">System ECU</h2>

      <DataRow
        label={systemEcu.outputRequest.label}
        value={systemEcu.outputRequest.value}
        unit={systemEcu.outputRequest.unit}
      />

      <DataRow
        label={systemEcu.startStop.label}
        value={systemEcu.startStop.value}
        unit={systemEcu.startStop.unit}
      />
    </div>
  );
}

