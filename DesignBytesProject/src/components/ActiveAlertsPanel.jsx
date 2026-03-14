function AlertCard({ alert }) {
  const iconSrc =
    alert.type === "warning"
      ? "/fuelcell/svg/warningwithblur.svg"
      : "/fuelcell/shutdown.svg";
  const typeClass = alert.type === "warning" ? "warning" : "danger";

  return (
    <div className={`active-alert-card active-alert-card--${typeClass}`}>
      <div className={`active-alert-icon-wrap active-alert-icon-wrap--${typeClass}`}>
        <img
          src={iconSrc}
          alt={alert.label}
          className={`active-alert-icon active-alert-icon--${typeClass}`}
        />
      </div>
      <div className="active-alert-copy">
        <div className="active-alert-count">{alert.count}</div>
        <div className="active-alert-label">{alert.label}</div>
      </div>
    </div>
  );
}

export default function ActiveAlertsPanel({ alerts }) {
  return (
    <div className="panel active-alerts-panel">
      <h2 className="panel-title active-alerts-title">Active Alerts</h2>
      <div className="active-alerts-list">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
