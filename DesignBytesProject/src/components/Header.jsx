import { TABS } from "../data/mockData";

function dotStyles(color) {
  const styles = {
    green: {
      background: "#6aff79",
      boxShadow: "0 0 10px rgba(106, 255, 121, 0.55)",
    },
    yellow: {
      background: "#facc15",
      boxShadow: "0 0 10px rgba(250, 204, 21, 0.5)",
    },
    red: {
      background: "#f87171",
      boxShadow: "0 0 10px rgba(248, 113, 113, 0.45)",
    },
    off: {
      background: "rgba(255, 255, 255, 0.16)",
      boxShadow: "none",
    },
  };

  return styles[color] ?? styles.off;
}

function resolveIndicatorColor(systemPower, activeControlState) {
  if (activeControlState === "Service Mode") {
    return "yellow";
  }

  if (systemPower === "off") {
    return "red";
  }

  if (systemPower === "on") {
    return "green";
  }

  return "off";
}

export default function Header({
  activeTab,
  setActiveTab,
  systemPower,
  activeControlState,
}) {
  const indicatorColor = resolveIndicatorColor(systemPower, activeControlState);
  const activeDotStyle = dotStyles("green");
  const inactiveDotStyle = dotStyles("off");

  return (
    <div className="dashboard-header">
      <div className="dashboard-header-row">
        <div className="dashboard-brand">
          <span className="dashboard-brand-logo" role="img" aria-label="Kirloskar logo" />
        </div>

        <div
          className="dashboard-status-dots"
          style={{
            transform: "translate(-8px, 5px)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 13,
              height: 13,
              borderRadius: "50%",
              ...activeDotStyle,
            }}
            title="System status"
          />

          <span
            style={{
              display: "inline-block",
              width: 13,
              height: 13,
              borderRadius: "50%",
              ...inactiveDotStyle,
            }}
            title="System status"
          />

          <span
            style={{
              display: "inline-block",
              width: 13,
              height: 13,
              borderRadius: "50%",
              ...inactiveDotStyle,
            }}
            title="System status"
          />
        </div>
      </div>

      <div className="dashboard-tabs-row">
        <div className="dashboard-tabs">
          {TABS.map((tab) => {
            const active = tab === activeTab;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`dashboard-tab${active ? " dashboard-tab--active" : ""}`}
                style={{
                  borderBottom: active
                    ? "0.889px solid #D37F41"
                    : "0.889px solid transparent",

                  background: active
                    ? "linear-gradient(3deg, rgba(217,217,217,0.16) -143%, rgba(6,6,6,0.10) 382%)"
                    : "transparent",

                  color: active ? "#D37F41" : "#D9D9D9",

                  fontFamily: "Inter",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
