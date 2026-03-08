import StatusDot from "./StatusDot";
import MetricIcon from "./MetricIcon";

function resolveMetricValue(metric) {
  if (metric.displayValue) {
    return metric.displayValue;
  }

  if (metric.unit) {
    return `${metric.value} ${metric.unit}`;
  }

  return String(metric.value);
}

export default function FuelCellPanel({ statusItems, metrics }) {
  return (
    <div className="panel fuel-cell-panel">
      <h2 className="panel-title fuel-cell-title">Fuel Cell</h2>

      <div className="fuel-cell-top">
        <div className="fuel-cell-illustration-wrap">
          <img
            src="/fuel-cell.png"
            alt="Fuel Cell Diagram"
            className="fuel-cell-image"
            style={{
              width: "256.895px",
              height: "249.865px",
              aspectRatio: "73 / 71",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        <div className="fuel-cell-status-list">
          {statusItems.map((s) => {
            const isEmergency = s.id === 1;
            const isOverheat = s.id === 2;
            const isAdditionalState = s.id >= 3;

            return (
              <div
                key={s.id}
                className={`fuel-cell-status-item${isEmergency ? " fuel-cell-status-item--emergency" : ""}${isOverheat ? " fuel-cell-status-item--overheat" : ""}${isAdditionalState ? " fuel-cell-status-item--state" : ""}`}
              >
              <div className="fuel-cell-status-label">
                <StatusDot color={s.color} />
                <span
                  className={`${isEmergency ? "fuel-cell-status-text--emergency" : ""}${isOverheat ? " fuel-cell-status-text--overheat" : ""}${isAdditionalState ? " fuel-cell-status-text--state" : ""}`}
                  style={
                    isEmergency || isOverheat || isAdditionalState
                      ? undefined
                      : {
                          color: "#cbd5e1",
                          fontSize: 13,
                        }
                  }
                >
                  {s.label}
                </span>
              </div>
              <span
                className={`${isEmergency ? "fuel-cell-status-value--emergency" : ""}${isOverheat ? " fuel-cell-status-value--overheat" : ""}${isAdditionalState ? " fuel-cell-status-value--state" : ""}`}
                style={
                  isEmergency || isOverheat || isAdditionalState
                    ? undefined
                    : {
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        color: s.value === "ON" ? "#4ade80" : "#f87171",
                      }
                }
              >
                {s.value}
              </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fuel-cell-metrics">
        {metrics.map((m, i) => (
          <div
            key={m.id}
            className={`fuel-cell-metric${i > 0 ? " fuel-cell-metric--with-divider" : ""}`}
          >
            <div className="fuel-cell-metric-label">
              <MetricIcon type={m.iconType} />
              <span className="fuel-cell-metric-text">{m.label}</span>
            </div>
            <span className="fuel-cell-metric-value">{resolveMetricValue(m)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
