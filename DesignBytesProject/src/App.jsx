import { useState } from "react";
import Header from "./components/Header";
import FuelCellPanel from "./components/FuelCellPanel";
import SystemECUPanel from "./components/SystemECUPanel";
import ActiveAlertsPanel from "./components/ActiveAlertsPanel";
import ControlStatePanel from "./components/ControlStatePanel";
import BottomBar from "./components/BottomBar";
import MethanolReformerPanel from "./components/MethanolReformerPanel";

export default function App() {
  const [activeTab, setActiveTab] = useState("Fuel Cell");

  return (
    <div className="dashboard-shell">
      <div className="dashboard-frame">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="dashboard-main">
          {activeTab === "Fuel Cell" ? (
            <>
              <div className="dashboard-main-grid">
                <FuelCellPanel />

                <div className="dashboard-main-stack">
                  <SystemECUPanel />
                  <ActiveAlertsPanel />
                </div>
              </div>

              <ControlStatePanel />
            </>
          ) : (
            <MethanolReformerPanel />
          )}
        </main>

        <BottomBar />
      </div>
    </div>
  );
}
