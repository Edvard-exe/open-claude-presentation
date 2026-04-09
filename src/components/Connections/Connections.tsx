import { useBoardStore } from '../../store/boardStore';
import type { TileData } from '../../types/board';
import './Connections.css';

/**
 * Compute the best edge pair for a connection between two tiles.
 */
function getEdgePoints(from: TileData, to: TileData) {
  const fromCX = from.position.x + from.width / 2;
  const fromCY = from.position.y + from.height / 2;
  const toCX = to.position.x + to.width / 2;
  const toCY = to.position.y + to.height / 2;

  const dx = toCX - fromCX;
  const dy = toCY - fromCY;

  let fromX: number, fromY: number, toX: number, toY: number;

  if (Math.abs(dx) > Math.abs(dy)) {
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

  return { fromX, fromY, toX, toY, horizontal: Math.abs(dx) > Math.abs(dy) };
}

export function Connections() {
  const tiles = useBoardStore((s) => s.tiles);
  const connections = useBoardStore((s) => s.connections);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const activeConnection = useBoardStore((s) => s.activeConnection);

  const tileMap = new Map(tiles.map((t) => [t.id, t]));

  return (
    <svg className="connections" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }}>
      <defs>
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

        const isActive = presentationActive &&
          activeConnection !== null &&
          conn.from === activeConnection.from &&
          conn.to === activeConnection.to;
        const isDimmed = presentationActive && !isActive;
        const color = from.color || '#8B5CF6';

        const { fromX, fromY, toX, toY, horizontal } = getEdgePoints(from, to);

        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        let path: string;

        if (horizontal) {
          path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
        } else {
          path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
        }

        const labelX = midX;
        const labelY = midY - 12;

        return (
          <g key={`${conn.from}-${conn.to}-${i}`} className={isActive ? 'connection__group--active' : isDimmed ? 'connection__group--dimmed' : ''}>
            <path d={path} fill="none" stroke={color} strokeWidth={isActive ? 8 : 4} opacity={isActive ? 0.25 : 0.08} className="connection__glow" />
            <path d={path} fill="none" stroke={color} strokeWidth={isActive ? 3 : 1.5} strokeDasharray="6 4" markerEnd={`url(#arrowhead-${i})`}
              className={`connection__line ${isActive ? 'connection__line--active' : ''} ${!presentationActive ? 'connection__line--static' : ''}`} />
            {isActive && (
              <circle r={5} fill={color} opacity={0.9} className="connection__dot">
                <animateMotion dur="3.5s" repeatCount="indefinite" path={path} />
              </circle>
            )}
            {conn.label && (
              <g transform={`translate(${labelX}, ${labelY})`}>
                <rect x={-conn.label.length * 4 - 8} y="-10" width={conn.label.length * 8 + 16} height="20" rx="4"
                  fill="white" stroke={isActive ? color : '#DDD6FE'} strokeWidth={isActive ? 2 : 1} />
                <text textAnchor="middle" dominantBaseline="central" fontSize="11"
                  fontFamily="'SF Mono', Menlo, monospace" fontWeight="600" fill={color}>
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
