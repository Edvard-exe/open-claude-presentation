import { useBoardStore } from '../../store/boardStore';
import './Connections.css';

export function Connections() {
  const tiles = useBoardStore((s) => s.tiles);
  const connections = useBoardStore((s) => s.connections);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const activeConnectionIndex = useBoardStore((s) => s.activeConnectionIndex);

  const tileMap = new Map(tiles.map((t) => [t.id, t]));

  return (
    <svg className="connections" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="8"
          refY="4"
          orient="auto"
        >
          <path d="M0 0 L10 4 L0 8 L2 4 Z" fill="#8B5CF6" />
        </marker>
      </defs>
      {connections.map((conn, i) => {
        const from = tileMap.get(conn.from);
        const to = tileMap.get(conn.to);
        if (!from || !to) return null;

        const isActive = presentationActive && i === activeConnectionIndex;
        const isDimmed = presentationActive && i !== activeConnectionIndex;

        // Calculate edge connection points (right edge of from → left edge of to)
        const fromX = from.position.x + from.width;
        const fromY = from.position.y + from.height / 2;
        const toX = to.position.x;
        const toY = to.position.y + to.height / 2;

        // Bezier curve control points
        const midX = (fromX + toX) / 2;
        const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

        // Label position
        const labelX = midX;
        const labelY = (fromY + toY) / 2 - 12;

        return (
          <g key={i} className={isActive ? 'connection__group--active' : isDimmed ? 'connection__group--dimmed' : ''}>
            {/* Glow line */}
            <path
              d={path}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth={isActive ? 8 : 4}
              opacity={isActive ? 0.25 : 0.1}
              className="connection__glow"
            />
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth={isActive ? 3 : 2}
              strokeDasharray="6 4"
              markerEnd="url(#arrowhead)"
              className={`connection__line ${isActive ? 'connection__line--active' : ''} ${!presentationActive ? 'connection__line--static' : ''}`}
            />
            {/* Traveling dot — only shown on the active connection during presentation */}
            {isActive && (
              <circle r={5} fill="#8B5CF6" opacity={0.9} className="connection__dot">
                <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
              </circle>
            )}
            {/* Label */}
            {conn.label && (
              <g transform={`translate(${labelX}, ${labelY})`}>
                <rect
                  x={-conn.label.length * 4 - 8}
                  y="-10"
                  width={conn.label.length * 8 + 16}
                  height="20"
                  rx="4"
                  fill="white"
                  stroke={isActive ? '#A78BFA' : '#DDD6FE'}
                  strokeWidth={isActive ? 2 : 1}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontFamily="'SF Mono', Menlo, monospace"
                  fontWeight="600"
                  fill="#6D28D9"
                >
                  {conn.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
