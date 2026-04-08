import { useRef, useCallback } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useTileDrag } from '../../hooks/useTileDrag';
import { NeuralBackground } from './NeuralBackground';
import { OrbitalBackground } from './OrbitalBackground';
import { CacheBackground } from './CacheBackground';
import type { TileData } from '../../types/board';
import './Tile.css';

interface TileProps {
  tile: TileData;
}

export function Tile({ tile }: TileProps) {
  const selectedTileId = useBoardStore((s) => s.selectedTileId);
  const openDiagram = useBoardStore((s) => s.openDiagram);
  const openSubItem = useBoardStore((s) => s.openSubItem);
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
  const hasSubItems = tile.subItems && tile.subItems.length > 0;
  const bgType = tile.backgroundType || (hasSubItems ? 'orbital' : 'neural');

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
        bgType === 'cache'
          ? <CacheBackground width={tile.width} height={tile.height} color={accentColor} />
          : bgType === 'orbital'
            ? <OrbitalBackground width={tile.width} height={tile.height} color={accentColor} />
            : <NeuralBackground width={tile.width} height={tile.height} color={accentColor} />
      )}
      <div className="tile__body">
        <div className="tile__header">
          {tile.animated && <div className="tile__pulse" />}
          <span className="tile__title">{tile.title}</span>
        </div>
        {tile.content && <div className="tile__content">{tile.content}</div>}
        {hasSubItems && (
          <div className="tile__sub-items">
            {tile.subItems!.map((item, i) => (
              <div
                key={i}
                className="tile__sub-item tile__sub-item--clickable"
                style={{ '--sub-color': item.color || accentColor } as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  openSubItem(item);
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="tile__sub-dot" />
                <div className="tile__sub-info">
                  <span className="tile__sub-label">{item.label}</span>
                  {item.description && (
                    <span className="tile__sub-desc">{item.description}</span>
                  )}
                  {item.filePath && (
                    <span className="tile__sub-file">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M3 1H1.5A.5.5 0 001 1.5v7a.5.5 0 00.5.5h7a.5.5 0 00.5-.5V7M6 1h3v3M9 1L4.5 5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item.filePath.split('/').pop()}{item.line ? `:${item.line}` : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {(tile.filePath || tile.url) && (
          <div className="tile__links">
            {tile.filePath && (
              <div className="tile__path">{tile.filePath}</div>
            )}
            {tile.url && (
              <a
                className="tile__url"
                href={tile.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M5 1H2.5A1.5 1.5 0 001 2.5v7A1.5 1.5 0 002.5 11h7A1.5 1.5 0 0011 9.5V7M7 1h4v4M11 1L5.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {tile.url.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
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
