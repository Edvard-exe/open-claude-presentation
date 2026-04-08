import { useRef, useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';

export function useTileDrag(tileId: string) {
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    useBoardStore.getState().selectTile(tileId);
  }, [tileId]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();

    const { zoom, tiles, updateTilePosition } = useBoardStore.getState();
    const tile = tiles.find((t) => t.id === tileId);
    if (!tile) return;

    const dx = (e.clientX - lastPointer.current.x) / zoom;
    const dy = (e.clientY - lastPointer.current.y) / zoom;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    updateTilePosition(tileId, {
      x: tile.position.x + dx,
      y: tile.position.y + dy,
    });
  }, [tileId]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  return {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
  };
}
