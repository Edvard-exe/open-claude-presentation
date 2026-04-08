import { useRef } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Tile } from '../Tile/Tile';
import './Board.css';

export function Board() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pan = useBoardStore((s) => s.pan);
  const zoom = useBoardStore((s) => s.zoom);
  const tiles = useBoardStore((s) => s.tiles);
  const selectTile = useBoardStore((s) => s.selectTile);

  useCanvasGestures(containerRef);

  const handleBoardClick = () => {
    selectTile(null);
  };

  return (
    <div
      ref={containerRef}
      className="board"
      onClick={handleBoardClick}
      style={{
        '--pan-x': `${pan.x}px`,
        '--pan-y': `${pan.y}px`,
        '--zoom': zoom,
        '--grid-size': `${24 * zoom}px`,
      } as React.CSSProperties}
    >
      <div
        className="board__world"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  );
}
