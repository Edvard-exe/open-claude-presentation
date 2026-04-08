import { useRef, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { Tile } from '../Tile/Tile';
import { Connections } from '../Connections/Connections';
import './Board.css';

export function Board() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pan = useBoardStore((s) => s.pan);
  const zoom = useBoardStore((s) => s.zoom);
  const tiles = useBoardStore((s) => s.tiles);
  const selectTile = useBoardStore((s) => s.selectTile);
  const presentationTransitioning = useBoardStore((s) => s.presentationTransitioning);
  const setPresentationTransitioning = useBoardStore((s) => s.setPresentationTransitioning);

  useCanvasGestures(containerRef);

  // Fallback timeout: if CSS transition doesn't fire (same position), clear flag
  useEffect(() => {
    if (!presentationTransitioning) return;
    const id = setTimeout(() => setPresentationTransitioning(false), 900);
    return () => clearTimeout(id);
  }, [presentationTransitioning, setPresentationTransitioning]);

  const handleBoardClick = () => {
    selectTile(null);
  };

  const handleTransitionEnd = () => {
    if (presentationTransitioning) {
      setPresentationTransitioning(false);
    }
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
        className={`board__world ${presentationTransitioning ? 'board__world--transitioning' : ''}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        <Connections />
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  );
}
