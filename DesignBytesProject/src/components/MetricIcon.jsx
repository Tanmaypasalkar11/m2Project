export default function MetricIcon({ type }) {
  if (type === "arrow-up") return (
    <img
      src="/OutputValueLogo.svg"
      alt=""
      aria-hidden="true"
      style={{
        width: "21.884px",
        height: "21.333px",
        aspectRatio: "21.88 / 21.33",
        display: "block",
      }}
    />
  );
  if (type === "gauge") return (
    <img
      src="/outputUpperLimitLogo.svg"
      alt=""
      aria-hidden="true"
      style={{
        width: "30px",
        height: "22px",
        display: "block",
      }}
    />
  );
  if (type === "signal") return (
    <img
      src="/ExternalDetectorDensityLogo.svg"
      alt=""
      aria-hidden="true"
      style={{
        width: "27px",
        height: "22px",
        display: "block",
      }}
    />
  );
  return null;
}
