import { useEffect, useRef, useCallback } from 'react';
import { useBoardStore } from '../store/boardStore';

export function useCanvasGestures(containerRef: React.RefObject<HTMLDivElement | null>) {
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const spaceHeld = useRef(false);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const { pan, zoom, setPan, setZoom } = useBoardStore.getState();

    // Zoom toward cursor
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Sensitivity: trackpad sends small fractional deltas, mouse sends large integers
    const sensitivity = Math.abs(e.deltaY) < 10 ? 0.01 : 0.001;
    const newZoom = Math.min(Math.max(zoom * (1 - e.deltaY * sensitivity), 0.1), 5);

    // Adjust pan so the world point under cursor stays fixed
    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;
    const newPanX = cursorX - worldX * newZoom;
    const newPanY = cursorY - worldY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, []);

  const handlePointerDown = useCallback((e: PointerEvent) => {
    // Middle button or Space+left button
    if (e.button === 1 || (e.button === 0 && spaceHeld.current)) {
      e.preventDefault();
      isPanning.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isPanning.current) return;

    const { pan, setPan } = useBoardStore.getState();
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };

    setPan({ x: pan.x + dx, y: pan.y + dy });
  }, []);

  const handlePointerUp = useCallback((e: PointerEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space' && !e.repeat) {
      spaceHeld.current = true;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }

    const { zoom, setZoom, selectedTileId, removeTile } = useBoardStore.getState();

    if (e.key === '=' || e.key === '+') {
      e.preventDefault();
      setZoom(zoom * 1.2);
    } else if (e.key === '-') {
      e.preventDefault();
      setZoom(zoom / 1.2);
    } else if (e.key === '0') {
      e.preventDefault();
      useBoardStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedTileId) {
      e.preventDefault();
      removeTile(selectedTileId);
    }
  }, [containerRef]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      spaceHeld.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = '';
      }
    }
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Must use addEventListener for passive: false on wheel
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [containerRef, handleWheel, handlePointerDown, handlePointerMove, handlePointerUp, handleKeyDown, handleKeyUp]);
}
