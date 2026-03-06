import { useState } from "react";
import "./MR.css";

function StatusButton({ statusButtons, active, setActive }) {
  return (
    <div className="control-state-panel">
      <h2 className="panel-title control-state-title">Control State</h2>

      <div className="control-state-actions">
        {statusButtons.map((btn, index) => {
          const isActive = btn.label === active;
          return (
            <button
              key={index}
              onClick={() => setActive(btn.label)}
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
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function MethanolReformerPanel() {
  const systemParameters = [
    { label: "H2 Pressure", value: "10%" },
    { label: "H2 Flow", value: "10%" },
    { label: "Reformer In", value: "30%" },
    { label: "Reformer Out", value: "30%" },
    { label: "Membrane In", value: "30%" },
    { label: "Membrane Out", value: "25%" },
    { label: "Major Fault Code", value: "213%" },
    { label: "Thermal Cycle Temp", value: "30%" },
    { label: "Membrane Out", value: "25%" },
    { label: "Major Fault Code", value: "None" },
  ];

  const statusButtons = [
    { label: "Stopped", action: "on" },
    { label: "Sleep", action: "off" },
    { label: "Service Mode", action: "off" },
    { label: "PS Available", action: "off" },
    { label: "Start Processing", action: "off" },
    { label: "Idle", action: "off" },
    { label: "Stop Processing", action: "off" },
  ];
  const [activeControlState, setActiveControlState] = useState("Stopped");

  return (
    <div className="text-white flex flex-col gap-6">
      <div className="flex flex-row gap-6">
        <div className="w-[593px] h-[422px] bg-[#0A181A] border border-[#1E2D2F] rounded-[10px] p-6 relative">
          <h2 className="text-[18px] font-inter font-semibold text-white">MR Cell</h2>
          <div className="absolute top-[85.11px] left-[39px] w-[514.02px] h-[283.37px]">
            <img
              src="/methanol/Group%201000012626.png"
              alt="Methanol Reformer"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="w-[551px] h-[422px] rounded-[10px] p-6 flex flex-col bg-[#0A181A] relative">
          <h2 className="text-white text-[18px] font-inter font-semibold mb-4">
            System Parameters
          </h2>

          <div className="w-[497px] h-[346px] grid grid-cols-2 gap-[10px] overflow-y-auto overflow-x-hidden pr-[20px] custom-scrollbar">
            {systemParameters.map((param, index) => (
              <div
                key={index}
                className="w-full max-w-[240px] h-[100px] bg-[#102629] rounded-[6.22px] flex flex-row gap-[10px] pl-[27.45px] pt-[15px]"
              >
                <div className="w-[12.14px] h-[12.14px] bg-[#96969680] rounded-full mt-[5px]" />

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
        </div>
      </div>

      <StatusButton
        statusButtons={statusButtons}
        active={activeControlState}
        setActive={setActiveControlState}
      />
    </div>
  );
}
