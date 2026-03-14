import { useState } from "react";
import Header from "./components/Header";
import FuelCellPanel from "./components/FuelCellPanel";
import SystemECUPanel from "./components/SystemECUPanel";
import ActiveAlertsPanel from "./components/ActiveAlertsPanel";
import ControlStatePanel from "./components/ControlStatePanel";
import BottomBar from "./components/BottomBar";
import MethanolReformerPanel from "./components/MethanolReformerPanel";
import useHmiDashboard from "./hooks/useHmiDashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("Fuel Cell");
  const {
    dashboardState,
    transportConnected,
    pendingActionId,
    lastError,
    sendCommand,
  } = useHmiDashboard(activeTab);

  return (
    <div className="dashboard-shell">
      <div className="dashboard-frame">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          systemPower={dashboardState.meta.systemPower}
          activeControlState={dashboardState.fuelCell.controlState.active}
        />

        <main className="dashboard-main">
          {lastError ? (
            <div
              style={{
                color: "#fca5a5",
                fontSize: 13,
                marginBottom: 4,
              }}
            >
              Backend status: {lastError}
            </div>
          ) : null}

          {activeTab === "Fuel Cell" ? (
            <>
              <div className="dashboard-main-grid">
                <FuelCellPanel
                  statusItems={dashboardState.fuelCell.status}
                  metrics={dashboardState.fuelCell.metrics}
                />

                <div className="dashboard-main-stack">
                  <SystemECUPanel systemEcu={dashboardState.fuelCell.systemEcu} />
                  <ActiveAlertsPanel alerts={dashboardState.fuelCell.activeAlerts} />
                </div>
              </div>

              <ControlStatePanel controlState={dashboardState.fuelCell.controlState} />
            </>
          ) : (
            <MethanolReformerPanel
              dashboard={{
                ...dashboardState.methanolReformer,
                controlSystem: dashboardState.controlSystem,
              }}
            />
          )}
        </main>

        <BottomBar
          actions={dashboardState.fuelCell.commands}
          meta={dashboardState.meta}
          pendingActionId={pendingActionId}
          onAction={sendCommand}
        />
      </div>
    </div>
  );
}
