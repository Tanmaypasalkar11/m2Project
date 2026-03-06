import { useEffect, useState } from "react";
import { BOTTOM_ACTIONS, DASHBOARD_META } from "../data/mockData";

// SVG icons for each button
function GensetIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="8" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="8" y="4" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="7" y1="13" x2="7" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="12" y1="12" x2="12" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="17" y1="13" x2="17" y2="17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function PowerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}
function H2Icon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <line x1="3" y1="6"  x2="21" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const ICONS = {
  "Genset OFF": <GensetIcon />,
  "Power ON":   <PowerIcon />,
  "Power OFF":  <StopIcon />,
  "H2 Bypass":  <H2Icon />,
};

const VARIANT_STYLES = {
  inactive: {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "#94a3b8",
  },
  active: {
    background: "#16a34a",
    border: "1px solid #15803d",
    color: "#ffffff",
    boxShadow: "0 0 18px rgba(22,163,74,0.45)",
  },
  danger: {
    background: "#7f1d1d",
    border: "1px solid #9e2323",
    color: "#fca5a5",
  },
};

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
          <button
            key={a.id}
            className="bottom-action-button"
            style={{
              fontSize: 14,
              fontWeight: 600,
              ...VARIANT_STYLES[a.variant],
            }}
          >
            {ICONS[a.label]}
            {a.label}
          </button>
        ))}
      </div>

      <div className="bottom-powered">
        <div className="bottom-powered-label">Powered By</div>
        <div className="bottom-powered-value">{DASHBOARD_META.poweredBy}</div>
      </div>
    </div>
  );
}
