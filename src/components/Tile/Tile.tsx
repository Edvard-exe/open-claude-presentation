import { useRef, useCallback } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useTileDrag } from '../../hooks/useTileDrag';
import { NeuralBackground } from './NeuralBackground';
import type { TileData } from '../../types/board';
import './Tile.css';

interface TileProps {
  tile: TileData;
}

export function Tile({ tile }: TileProps) {
  const selectedTileId = useBoardStore((s) => s.selectedTileId);
  const openDiagram = useBoardStore((s) => s.openDiagram);
  const isSelected = selectedTileId === tile.id;
  const dragHandlers = useTileDrag(tile.id);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      dragHandlers.onPointerDown(e);
    },
    [dragHandlers]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      dragHandlers.onPointerUp(e);

      // Only open diagram if it was a click (not a drag)
      if (tile.diagramId && pointerDownPos.current) {
        const dx = Math.abs(e.clientX - pointerDownPos.current.x);
        const dy = Math.abs(e.clientY - pointerDownPos.current.y);
        if (dx < 5 && dy < 5) {
          openDiagram(tile.diagramId);
        }
      }
      pointerDownPos.current = null;
    },
    [dragHandlers, tile.diagramId, openDiagram]
  );

  const accentColor = tile.color || '#4A90D9';

  return (
    <div
      className={`tile ${isSelected ? 'tile--selected' : ''} ${tile.animated ? 'tile--animated' : ''}`}
      style={{
        left: tile.position.x,
        top: tile.position.y,
        width: tile.width,
        height: tile.height,
        '--tile-accent': accentColor,
      } as React.CSSProperties}
      onPointerDown={handlePointerDown}
      onPointerMove={dragHandlers.onPointerMove}
      onPointerUp={handlePointerUp}
    >
      {tile.animated && (
        <NeuralBackground
          width={tile.width}
          height={tile.height}
          color={accentColor}
        />
      )}
      <div className="tile__body">
        <div className="tile__header">
          {tile.animated && <div className="tile__pulse" />}
          <span className="tile__title">{tile.title}</span>
        </div>
        {tile.content && <div className="tile__content">{tile.content}</div>}
        {tile.filePath && (
          <div className="tile__path">{tile.filePath}</div>
        )}
        {tile.diagramId && (
          <div className="tile__cta">
            Click to explore
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
