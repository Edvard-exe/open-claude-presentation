import { useRef, useCallback } from 'react';
import { useBoardStore } from '../../store/boardStore';
import { useTileDrag } from '../../hooks/useTileDrag';
import { NeuralBackground } from './NeuralBackground';
import { OrbitalBackground } from './OrbitalBackground';
import { CacheBackground } from './CacheBackground';
import { ShieldBackground } from './ShieldBackground';
import { MailboxBackground } from './MailboxBackground';
import { HooksBackground } from './HooksBackground';
import { CompactorBackground } from './CompactorBackground';
import { deleteTilePermanently } from '../../hooks/useContributions';
import type { TileData } from '../../types/board';
import './Tile.css';

interface TileProps {
  tile: TileData;
}

export function Tile({ tile }: TileProps) {
  const selectedTileId = useBoardStore((s) => s.selectedTileId);
  const activeTileId = useBoardStore((s) => s.activeTileId);
  const openDiagram = useBoardStore((s) => s.openDiagram);
  const openSubItem = useBoardStore((s) => s.openSubItem);
  const diveTile = useBoardStore((s) => s.diveTile);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const isSelected = selectedTileId === tile.id;
  const isPresenting = activeTileId === tile.id;
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

      if (pointerDownPos.current) {
        const dx = Math.abs(e.clientX - pointerDownPos.current.x);
        const dy = Math.abs(e.clientY - pointerDownPos.current.y);
        if (dx < 5 && dy < 5) {
          // Click (not drag) — dive into story if available, otherwise open diagram
          if (tile.storySteps?.length) {
            diveTile(tile.id);
          } else if (tile.diagramId) {
            openDiagram(tile.diagramId);
          }
        }
      }
      pointerDownPos.current = null;
    },
    [dragHandlers, tile.diagramId, tile.storySteps, tile.id, openDiagram, diveTile]
  );

  const accentColor = tile.color || '#4A90D9';
  const hasSubItems = tile.subItems && tile.subItems.length > 0;
  const bgType = tile.backgroundType || (hasSubItems ? 'orbital' : 'neural');

  return (
    <div
      className={`tile ${isSelected ? 'tile--selected' : ''} ${tile.animated ? 'tile--animated' : ''} ${isPresenting ? 'tile--presenting' : ''}`}
      style={{
        left: tile.position.x,
        top: tile.position.y,
        width: tile.width,
        minHeight: tile.height,
        '--tile-accent': accentColor,
      } as React.CSSProperties}
      data-tile-id={tile.id}
      onPointerDown={handlePointerDown}
      onPointerMove={dragHandlers.onPointerMove}
      onPointerUp={handlePointerUp}
    >
      {tile.animated && (() => {
        const bgProps = { width: tile.width, height: tile.height, color: accentColor };
        switch (bgType) {
          case 'shield': return <ShieldBackground {...bgProps} />;
          case 'cache': return <CacheBackground {...bgProps} />;
          case 'orbital': return <OrbitalBackground {...bgProps} />;
          case 'mailbox': return <MailboxBackground {...bgProps} />;
          case 'hooks': return <HooksBackground {...bgProps} />;
          case 'compactor': return <CompactorBackground {...bgProps} />;
          default: return <NeuralBackground {...bgProps} />;
        }
      })()}
      {!presentationActive && tile.id.startsWith('tile-contrib-') && (
        <button
          className="tile__remove"
          onClick={(e) => { e.stopPropagation(); deleteTilePermanently(tile.id); }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Remove tile"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <div className="tile__body">
        <div className="tile__header">
          {tile.animated && <div className="tile__pulse" />}
          <span className="tile__title">{tile.title}</span>
          {tile.diagramId && (
            <button
              className="tile__diagram-btn"
              title="View architecture diagram"
              onClick={(e) => { e.stopPropagation(); openDiagram(tile.diagramId!); }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="5.5" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3.5 6v2.5a1 1 0 001 1h3M12.5 6v2.5a1 1 0 01-1 1h-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
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
        {tile.storySteps?.length ? (
          <div className="tile__cta">
            Click to explore story
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : tile.diagramId ? (
          <div className="tile__cta">
            Click to explore
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : null}
      </div>
    </div>
  );
}
