import "./MR.css";
import ControlStatePanel from "./ControlStatePanel";

export default function MethanolReformerPanel({ dashboard }) {
  const systemParameters = dashboard.systemParameters;

  return (
    <div className="mr-dashboard text-white">
      <div className="mr-dashboard-top">
        <div className="mr-dashboard-visual">
          <div className="mr-dashboard-title-row">
            <h2 className="text-[18px] font-inter font-semibold text-white">MR Cell</h2>
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
            <h2 className="text-white text-[18px] font-inter font-semibold">System Parameters</h2>
          </div>

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
        </div>
      </div>

      <ControlStatePanel controlState={dashboard.controlState} />
    </div>
  );
}
