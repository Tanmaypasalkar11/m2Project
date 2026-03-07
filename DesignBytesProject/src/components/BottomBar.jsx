import { useEffect, useState } from "react";
import { BOTTOM_ACTIONS, DASHBOARD_META } from "../data/mockData";

function FooterActionButton({ icon, label, variant = "default" }) {
  const isGenset = label === "Genset OFF";
  const isH2Bypass = label === "H2 Bypass";

  return (
    <button className={`bottom-action-button bottom-action-button--${variant}`}>
      <img
        src={icon}
        alt={label}
        className={`bottom-action-icon${isGenset ? " bottom-action-icon--genset" : ""}${isH2Bypass ? " bottom-action-icon--h2" : ""}`}
      />
      <span className="bottom-action-label">{label}</span>
    </button>
  );
}

export default function BottomBar() {
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
        {BOTTOM_ACTIONS.map((a) => (
          <FooterActionButton
            key={a.id}
            icon={a.icon}
            label={a.label}
            variant={a.variant}
          />
        ))}
      </div>

      <div className="bottom-powered">
        <div className="bottom-powered-label">Powered By</div>
        <div className="bottom-powered-value">{DASHBOARD_META.poweredBy}</div>
      </div>
    </div>
  );
}
