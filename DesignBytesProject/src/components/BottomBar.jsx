import { useEffect, useState } from "react";

function FooterActionButton({
  id,
  icon,
  label,
  variant = "default",
  enabled,
  pending,
  onAction,
}) {
  const isGenset = label === "Genset OFF";
  const isH2Bypass = label === "H2 Bypass";

  return (
    <button
      className={`bottom-action-button bottom-action-button--${variant}`}
      disabled={!enabled || pending}
      onClick={() => onAction(id)}
      style={{
        opacity: enabled && !pending ? 1 : 0.45,
        cursor: enabled && !pending ? "pointer" : "not-allowed",
      }}
    >
      <img
        src={icon}
        alt={label}
        className={`bottom-action-icon${isGenset ? " bottom-action-icon--genset" : ""}${isH2Bypass ? " bottom-action-icon--h2" : ""}`}
      />
      <span className="bottom-action-label">{label}</span>
    </button>
  );
}

export default function BottomBar({ actions, meta, pendingActionId, onAction }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad2 = (value) => String(value).padStart(2, "0");
  const liveTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const liveDate = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${now.getFullYear()}`;

  return (
    <div className="dashboard-footer">
      <div className="bottom-meta">
        <div>{liveTime}</div>
        <div className="bottom-meta-date">{liveDate}</div>
      </div>

      <div className="bottom-actions">
        {actions.map((action) => (
          <FooterActionButton
            key={action.id}
            id={action.id}
            icon={action.icon}
            label={action.label}
            variant={action.variant}
            enabled={action.enabled}
            pending={pendingActionId === action.id}
            onAction={onAction}
          />
        ))}
      </div>

      <div className="bottom-powered">
        <div className="bottom-powered-label">Powered By</div>
        <div className="bottom-powered-value">{meta.poweredBy}</div>
      </div>
    </div>
  );
}
