import { TABS } from "../data/mockData";

function dotStyles(isActive) {
  if (isActive) {
    return {
      background: "#6AFF79",
      border: "1px solid transparent",
      boxShadow: "0 0 8px rgba(106,255,121,0.5)",
    };
  }

  return {
    background: "transparent",
    border: "1px solid #ff6a6a",
    opacity: 0.9,
  };
}

export default function Header({
  activeTab,
  setActiveTab,
  transportConnected,
  pythonBridgeOnline,
}) {
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
              ...dotStyles(transportConnected),
            }}
            title="Frontend websocket status"
          />

          <span
            style={{
              display: "inline-block",
              width: 13,
              height: 13,
              borderRadius: "50%",
              ...dotStyles(pythonBridgeOnline),
            }}
            title="Python bridge status"
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
