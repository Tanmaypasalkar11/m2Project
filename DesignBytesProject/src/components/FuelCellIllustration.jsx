// components/FuelCellIllustration.jsx
// Isometric SVG illustration of a hydrogen fuel cell stack

export default function FuelCellIllustration() {
  return (
    <div className="flex items-center justify-center w-44 h-44 select-none flex-shrink-0">
      <svg
        viewBox="0 0 220 200"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 18px rgba(0,255,200,0.15))" }}
        aria-label="Fuel Cell Diagram"
      >
        {/* ── Blue body (left face) ── */}
        <polygon points="10,140 80,170 80,110 10,80" fill="#4e9cc7" />
        {/* ── Blue body (top face) ── */}
        <polygon points="10,80 80,110 140,80 70,50" fill="#6cb8d9" />
        {/* ── Blue body (right face) ── */}
        <polygon points="80,110 140,80 140,140 80,170" fill="#3a7ea8" />

        {/* ── Yellow membrane stack panels ── */}
        {[0, 1, 2, 3].map((i) => (
          <g key={`mem-${i}`} transform={`translate(${72 + i * 14}, 0)`}>
            <polygon
              points="0,90 14,84 14,150 0,156"
              fill="#f5c842"
              opacity="0.92"
            />
            <polygon
              points="0,90 14,84 20,90 6,96"
              fill="#f9d966"
              opacity="0.92"
            />
          </g>
        ))}

        {/* ── Blue fin stack (right side) ── */}
        {[0, 1, 2].map((i) => (
          <g key={`fin-${i}`} transform={`translate(${125 + i * 12}, 0)`}>
            <polygon
              points="0,75 10,70 10,145 0,150"
              fill="#5b9fd4"
              opacity="0.85"
            />
          </g>
        ))}

        {/* ── Ion particles (red O² / white H⁺) ── */}
        {[
          [55, 95, "red"],
          [65, 130, "white"],
          [90, 100, "red"],
          [100, 140, "white"],
          [115, 105, "red"],
          [130, 125, "white"],
        ].map(([x, y, fill], i) => (
          <circle key={`particle-${i}`} cx={x} cy={y} r="5" fill={fill} opacity="0.85" />
        ))}

        {/* ── Electron labels ── */}
        {[
          [88, 115],
          [100, 130],
          [113, 118],
          [100, 100],
        ].map(([x, y], i) => (
          <text
            key={`e-${i}`}
            x={x}
            y={y}
            fontSize="9"
            fill="#fff"
            fontWeight="bold"
            textAnchor="middle"
          >
            e⁻
          </text>
        ))}

        {/* ── H⁺ proton labels ── */}
        {[
          [105, 108],
          [105, 128],
        ].map(([x, y], i) => (
          <text
            key={`h-${i}`}
            x={x}
            y={y}
            fontSize="8"
            fill="#fff"
            fontWeight="bold"
            textAnchor="middle"
          >
            H⁺
          </text>
        ))}

        {/* ── FUEL CELL label ── */}
        <text x="28" y="118" fontSize="9" fill="#fff" fontWeight="700" letterSpacing="0.5">
          FUEL
        </text>
        <text x="26" y="130" fontSize="9" fill="#fff" fontWeight="700" letterSpacing="0.5">
          CELL
        </text>

        {/* ── H₂ gas bubbles (right) ── */}
        {[
          [168, 72],
          [178, 80],
          [185, 68],
        ].map(([x, y], i) => (
          <circle key={`h2-${i}`} cx={x} cy={y} r="5" fill="#e8f4ff" opacity="0.8" />
        ))}

        {/* ── O₂ molecules (left) ── */}
        <circle cx="18" cy="108" r="5" fill="#f87171" opacity="0.7" />
        <circle cx="26" cy="103" r="5" fill="#f87171" opacity="0.7" />

        {/* ── Top external circuit wire ── */}
        <polyline
          points="80,55 80,38 160,38 160,60"
          stroke="#94a3b8"
          strokeWidth="2"
          fill="none"
        />
        {/* Resistor symbol */}
        <rect x="100" y="28" width="22" height="12" rx="2" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="104" y1="34" x2="118" y2="34" stroke="#94a3b8" strokeWidth="1.5" />

        {/* ── Charge flow labels ── */}
        <text x="84" y="48" fontSize="8" fill="#94a3b8">e⁻</text>
        <text x="150" y="48" fontSize="8" fill="#94a3b8">e⁺</text>

        {/* ── By-product labels ── */}
        <text x="48" y="168" fontSize="8" fill="#94a3b8">H₂O</text>
        <text x="162" y="67" fontSize="8" fill="#cbd5e1">H₂</text>
        <text x="6"   y="100" fontSize="8" fill="#fca5a5">O₂</text>
      </svg>
    </div>
  );
}
