import { useState } from "react";
import { CONTROL_STATES } from "../data/mockData";

export default function ControlStatePanel() {
  const [active, setActive] = useState("Stopped");
  return (
    <div className="control-state-panel">
      <h2 className="panel-title control-state-title">Control State</h2>
      <div className="control-state-actions">
        {CONTROL_STATES.map((s) => {
          const isActive = s === active;
          return (
            <button
              key={s}
              onClick={() => setActive(s)}
              className="control-state-button"
              style={{
                display: "flex",
                height: "48.889px",
                padding: "10.667px 21.333px",
                justifyContent: "center",
                alignItems: "center",
                gap: "6.667px",
                borderRadius: "66.667px",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
                fontStyle: "normal",
                lineHeight: "12.667px",
                fontWeight: isActive ? 600 : 500,
                background: isActive ? "#173539" : "rgba(255, 255, 255, 0.05)",
                color: "#FFF",
                border: isActive ? "none" : "0.667px solid rgba(255, 255, 255, 0.10)",
                opacity: isActive ? 1 : 0.5,
                boxShadow: "none",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
