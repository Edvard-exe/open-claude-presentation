import { useBoardStore } from '../../store/boardStore';
import type { TileData } from '../../types/board';
import './Connections.css';

/**
 * Compute the best edge pair for a connection between two tiles.
 * Picks the pair that gives the shortest, most direct path.
 */
function getEdgePoints(from: TileData, to: TileData) {
  const fromCX = from.position.x + from.width / 2;
  const fromCY = from.position.y + from.height / 2;
  const toCX = to.position.x + to.width / 2;
  const toCY = to.position.y + to.height / 2;

  const dx = toCX - fromCX;
  const dy = toCY - fromCY;

  // Determine primary direction based on which axis has larger delta
  const horizontal = Math.abs(dx) > Math.abs(dy);

  let fromX: number, fromY: number, toX: number, toY: number;

  if (horizontal) {
    if (dx > 0) {
      // Target is to the right → exit right edge, enter left edge
      fromX = from.position.x + from.width;
      fromY = from.position.y + from.height / 2;
      toX = to.position.x;
      toY = to.position.y + to.height / 2;
    } else {
      // Target is to the left → exit left edge, enter right edge
      fromX = from.position.x;
      fromY = from.position.y + from.height / 2;
      toX = to.position.x + to.width;
      toY = to.position.y + to.height / 2;
    }
  } else {
    if (dy > 0) {
      // Target is below → exit bottom edge, enter top edge
      fromX = from.position.x + from.width / 2;
      fromY = from.position.y + from.height;
      toX = to.position.x + to.width / 2;
      toY = to.position.y;
    } else {
      // Target is above → exit top edge, enter bottom edge
      fromX = from.position.x + from.width / 2;
      fromY = from.position.y;
      toX = to.position.x + to.width / 2;
      toY = to.position.y + to.height;
    }
  }

  return { fromX, fromY, toX, toY, horizontal };
}

export function Connections() {
  const tiles = useBoardStore((s) => s.tiles);
  const connections = useBoardStore((s) => s.connections);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const activeConnectionIndex = useBoardStore((s) => s.activeConnectionIndex);

  const tileMap = new Map(tiles.map((t) => [t.id, t]));

  return (
    <svg className="connections" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
        {/* Dynamic arrow markers — one per connection color */}
        {connections.map((conn, i) => {
          const from = tileMap.get(conn.from);
          const color = from?.color || '#8B5CF6';
          return (
            <marker
              key={`arrow-${i}`}
              id={`arrowhead-${i}`}
              markerWidth="10"
              markerHeight="8"
              refX="8"
              refY="4"
              orient="auto"
            >
              <path d="M0 0 L10 4 L0 8 L2 4 Z" fill={color} />
            </marker>
          );
        })}
      </defs>
      {connections.map((conn, i) => {
        const from = tileMap.get(conn.from);
        const to = tileMap.get(conn.to);
        if (!from || !to) return null;

        const isActive = presentationActive && i === activeConnectionIndex;
        const isDimmed = presentationActive && i !== activeConnectionIndex;
        const color = from.color || '#8B5CF6';

        // Smart edge routing
        const { fromX, fromY, toX, toY, horizontal } = getEdgePoints(from, to);

        // Bezier curve — control points depend on direction
        let path: string;
        if (horizontal) {
          const midX = (fromX + toX) / 2;
          path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        } else {
          const midY = (fromY + toY) / 2;
          path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        }

        // Label position at midpoint
        const labelX = (fromX + toX) / 2;
        const labelY = (fromY + toY) / 2 - 12;

        return (
          <g key={i} className={isActive ? 'connection__group--active' : isDimmed ? 'connection__group--dimmed' : ''}>
            {/* Glow line */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 8 : 4}
              opacity={isActive ? 0.25 : 0.08}
              className="connection__glow"
            />
            {/* Main line */}
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? 3 : 1.5}
              strokeDasharray="6 4"
              markerEnd={`url(#arrowhead-${i})`}
              className={`connection__line ${isActive ? 'connection__line--active' : ''} ${!presentationActive ? 'connection__line--static' : ''}`}
            />
            {/* Traveling dot — only shown on the active connection during presentation */}
            {isActive && (
              <circle r={5} fill={color} opacity={0.9} className="connection__dot">
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
                  stroke={isActive ? color : '#DDD6FE'}
                  strokeWidth={isActive ? 2 : 1}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="11"
                  fontFamily="'SF Mono', Menlo, monospace"
                  fontWeight="600"
                  fill={color}
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
