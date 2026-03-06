// components/BottomActionIcon.jsx
// SVG icons for the bottom control bar buttons

export default function BottomActionIcon({ label }) {
  const color = "currentColor";
  const size = 18;

  if (label === "Genset OFF") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2"  y="7"  width="20" height="14" rx="2" stroke={color} strokeWidth="1.5" />
        <rect x="8"  y="3"  width="8"  height="4"  rx="1" stroke={color} strokeWidth="1.5" />
        <line x1="8"  y1="12" x2="8"  y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="11" x2="12" y2="17" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="16" y1="12" x2="16" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Power ON") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M18.36 6.64a9 9 0 1 1-12.73 0"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line x1="12" y1="2" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (label === "Power OFF") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="5" y="5" width="14" height="14" rx="2" stroke={color} strokeWidth="2" />
      </svg>
    );
  }

  if (label === "H2 Bypass") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2"  y="4"  width="20" height="3" rx="1" fill={color} opacity="0.8" />
        <rect x="2"  y="10" width="20" height="3" rx="1" fill={color} opacity="0.6" />
        <rect x="2"  y="16" width="20" height="3" rx="1" fill={color} opacity="0.4" />
      </svg>
    );
  }

  return null;
}
