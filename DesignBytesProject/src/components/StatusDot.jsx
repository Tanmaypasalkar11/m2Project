export default function StatusDot({ color = "green" }) {
  const styles = {
    green: { background: "#4ade80", boxShadow: "0 0 6px 1px rgba(74,222,128,0.6)" },
    red:   { background: "#f87171", boxShadow: "0 0 6px 1px rgba(248,113,113,0.5)" },
  };
  return (
    <span
      className="inline-block rounded-full flex-shrink-0"
      style={{ width: 9, height: 9, ...styles[color] }}
    />
  );
}
