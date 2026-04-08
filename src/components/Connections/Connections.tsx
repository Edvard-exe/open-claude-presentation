import { useBoardStore } from '../../store/boardStore';
import './Connections.css';

export function Connections() {
  const tiles = useBoardStore((s) => s.tiles);
  const connections = useBoardStore((s) => s.connections);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const activeConnection = useBoardStore((s) => s.activeConnection);

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

        const isActive = presentationActive &&
          activeConnection !== null &&
          conn.from === activeConnection.from &&
          conn.to === activeConnection.to;
        const isDimmed = presentationActive && !isActive;

        // Calculate edge midpoints
        const fromCX = from.position.x + from.width / 2;
        const fromCY = from.position.y + from.height / 2;
        const toCX = to.position.x + to.width / 2;
        const toCY = to.position.y + to.height / 2;

        // Direction vector
        const dx = toCX - fromCX;
        const dy = toCY - fromCY;

        // Pick exit/entry edges based on direction
        let fromX: number, fromY: number, toX: number, toY: number;

        if (Math.abs(dx) > Math.abs(dy)) {
          // Horizontal-dominant: use left/right edges
          if (dx > 0) {
            fromX = from.position.x + from.width;
            fromY = from.position.y + from.height / 2;
            toX = to.position.x;
            toY = to.position.y + to.height / 2;
          } else {
            fromX = from.position.x;
            fromY = from.position.y + from.height / 2;
            toX = to.position.x + to.width;
            toY = to.position.y + to.height / 2;
          }
        } else {
          // Vertical-dominant: use top/bottom edges
          if (dy > 0) {
            fromX = from.position.x + from.width / 2;
            fromY = from.position.y + from.height;
            toX = to.position.x + to.width / 2;
            toY = to.position.y;
          } else {
            fromX = from.position.x + from.width / 2;
            fromY = from.position.y;
            toX = to.position.x + to.width / 2;
            toY = to.position.y + to.height;
          }
        }

        // Bezier curve control points
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        let path: string;

        if (Math.abs(dx) > Math.abs(dy)) {
          path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        } else {
          path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        }

        // Label position
        const labelX = midX;
        const labelY = midY - 12;

        return (
          <g key={`${conn.from}-${conn.to}-${i}`} className={isActive ? 'connection__group--active' : isDimmed ? 'connection__group--dimmed' : ''}>
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
                <animateMotion dur="3.5s" repeatCount="indefinite" path={path} />
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
