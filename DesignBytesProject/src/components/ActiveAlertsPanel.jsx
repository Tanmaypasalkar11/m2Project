import { ACTIVE_ALERTS } from "../data/mockData";

function AlertCard({ alert }) {
  const iconSrc =
    alert.type === "warning"
      ? "/fuelcell/svg/warningwithblur.svg"
      : "/fuelcell/shutdown.svg";

  return (
    <div className="active-alert-card">
      <img src={iconSrc} alt={alert.label} className="active-alert-icon" />
      <div className="active-alert-copy">
        <div className="active-alert-count">{alert.count}</div>
        <div className="active-alert-label">{alert.label}</div>
      </div>
    </div>
  );
}

export default function ActiveAlertsPanel() {
  return (
    <div className="panel active-alerts-panel">
      <h2 className="panel-title active-alerts-title">Active Alerts</h2>
      <div className="active-alerts-list">
        {ACTIVE_ALERTS.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
