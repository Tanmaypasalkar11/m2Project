import "./MR.css";
import ControlStatePanel from "./ControlStatePanel";

export default function MethanolReformerPanel({ dashboard }) {
  const systemParameters = dashboard.systemParameters;

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
                key={param.id ?? `${param.label}-${index}`}
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

      <ControlStatePanel controlState={dashboard.controlState} />
    </div>
  );
}
