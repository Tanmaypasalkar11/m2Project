import "./MR.css";
import { useState } from "react";
import ControlStatePanel from "./ControlStatePanel";

export default function MethanolReformerPanel({ dashboard }) {
  const [rightPanelView, setRightPanelView] = useState("parameters");
  const systemParameters = dashboard.systemParameters;
  const controlSystem = dashboard.controlSystem;

  return (
    <div className="mr-dashboard text-white">
      <div className="mr-dashboard-top">
        <div className="mr-dashboard-visual">
          <div className="mr-dashboard-title-row">
            <h2 className="text-[18px] font-inter font-semibold text-white">MR Cell</h2>
            <button
              type="button"
              className="mr-dashboard-toggle"
              onClick={() =>
                setRightPanelView((currentView) =>
                  currentView === "parameters" ? "controls" : "parameters",
                )
              }
            >
              {rightPanelView === "parameters" ? "Open Control View" : "Open Parameters View"}
            </button>
          </div>

          <div className="absolute top-[85.11px] left-[39px] w-[514.02px] h-[283.37px]">
            <img
              src="/methanol/Group%201000012626.png"
              alt="Methanol Reformer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="mr-dashboard-side">
          <div className="mr-dashboard-side-header">
            <h2 className="text-white text-[18px] font-inter font-semibold">
              {rightPanelView === "parameters" ? "System Parameters" : "Control Logic"}
            </h2>
            <div className="mr-dashboard-segmented">
              <button
                type="button"
                className={`mr-dashboard-segment${rightPanelView === "parameters" ? " mr-dashboard-segment--active" : ""}`}
                onClick={() => setRightPanelView("parameters")}
              >
                Parameters
              </button>
              <button
                type="button"
                className={`mr-dashboard-segment${rightPanelView === "controls" ? " mr-dashboard-segment--active" : ""}`}
                onClick={() => setRightPanelView("controls")}
              >
                Controls
              </button>
            </div>
          </div>

          {rightPanelView === "parameters" ? (
            <div className="mr-dashboard-parameter-grid custom-scrollbar">
              {systemParameters.map((param, index) => (
                <div
                  key={param.id ?? `${param.label}-${index}`}
                  className="mr-dashboard-parameter-card"
                >
                  <div className="mr-dashboard-parameter-dot" />

                  <div className="flex flex-col">
                    <div className="text-white text-[14px] opacity-70 font-inter font-medium capitalize leading-[18.57px]">
                      {param.label}
                    </div>
                    <div className="text-white text-[22px] font-inter font-medium leading-[24.89px] mt-[15px]">
                      {param.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mr-dashboard-controls custom-scrollbar">
              <div className="mr-dashboard-controls-section">
                <h3 className="mr-dashboard-controls-title">Solenoid Outputs</h3>
                <div className="mr-dashboard-valve-grid">
                  {Object.entries(controlSystem.valves).map(([key, value]) => {
                    const isOn = value === 1;
                    const isSpare = value === null;

                    return (
                      <div key={key} className="mr-dashboard-stat-card">
                        <div className="mr-dashboard-stat-label">{key}</div>
                        <div
                          className={`mr-dashboard-stat-value ${isSpare ? "mr-dashboard-stat-value--spare" : isOn ? "mr-dashboard-stat-value--on" : "mr-dashboard-stat-value--off"}`}
                        >
                          {isSpare ? "SPARE" : isOn ? "ON" : "OFF"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mr-dashboard-controls-section">
                <h3 className="mr-dashboard-controls-title">CAN Request</h3>
                <div className="mr-dashboard-detail-list">
                  {[
                    ["CAN-ID", controlSystem.canRequest.canId],
                    ["Cycle", `${controlSystem.canRequest.cycleMs} ms`],
                    ["Output Value", `${controlSystem.canRequest.outputValueW} W`],
                    ["Upper Limit", `${controlSystem.canRequest.outputUpperLimitW} W`],
                    ["Control Code", controlSystem.canRequest.controlStateCode],
                  ].map(([label, value]) => (
                    <div key={label} className="mr-dashboard-detail-row">
                      <span className="mr-dashboard-detail-label">{label}</span>
                      <span className="mr-dashboard-detail-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mr-dashboard-controls-section">
                <h3 className="mr-dashboard-controls-title">FC CAN Signals</h3>
                <div className="mr-dashboard-signal-grid">
                  {[
                    ["Emergency", controlSystem.fcStatusSignals.emergencySwitchState],
                    ["Overheat", controlSystem.fcStatusSignals.fcOutputLimitByOverheat],
                    ["Cellvol", controlSystem.fcStatusSignals.fcOutputLimitByCellvol],
                    ["Warning D4", controlSystem.fcStatusSignals.warningD4],
                  ].map(([label, value]) => (
                    <div key={label} className="mr-dashboard-stat-card">
                      <div className="mr-dashboard-stat-label">{label}</div>
                      <div
                        className={`mr-dashboard-stat-value ${value ? "mr-dashboard-stat-value--on" : "mr-dashboard-stat-value--off"}`}
                      >
                        {value ? "1 / ON" : "0 / OFF"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ControlStatePanel controlState={dashboard.controlState} />
    </div>
  );
}
