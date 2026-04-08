import { useEffect, useRef, useCallback, useState } from 'react';
import mermaid from 'mermaid';
import { useBoardStore } from '../../store/boardStore';
import { diagrams } from './diagrams';
import './DiagramOverlay.css';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'system-ui, -apple-system, sans-serif',
});

function fitToViewport(
  svgW: number,
  svgH: number,
  vpW: number,
  vpH: number
) {
  const padding = 40;
  const scaleX = (vpW - padding * 2) / svgW;
  const scaleY = (vpH - padding * 2) / svgH;
  const fitZoom = Math.min(scaleX, scaleY, 1); // don't upscale past 100%

  // Center the diagram
  const panX = (vpW - svgW * fitZoom) / 2;
  const panY = (vpH - svgH * fitZoom) / 2;

  return { zoom: fitZoom, pan: { x: panX, y: panY } };
}

export function DiagramOverlay() {
  const openDiagramId = useBoardStore((s) => s.openDiagramId);
  const closeDiagram = useBoardStore((s) => s.closeDiagram);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef<string | null>(null);
  const svgSizeRef = useRef({ w: 0, h: 0 });

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handleClose = useCallback(() => {
    closeDiagram();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [closeDiagram]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    if (openDiagramId) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [openDiagramId, handleKeyDown]);

  // Wheel zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !openDiagramId) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setZoom((prevZoom) => {
        setPan((prevPan) => {
          const sensitivity = Math.abs(e.deltaY) < 10 ? 0.01 : 0.001;
          const newZoom = Math.min(Math.max(prevZoom * (1 - e.deltaY * sensitivity), 0.1), 8);

          const worldX = (cursorX - prevPan.x) / prevZoom;
          const worldY = (cursorY - prevPan.y) / prevZoom;
          const newPanX = cursorX - worldX * newZoom;
          const newPanY = cursorY - worldY * newZoom;

          // We set zoom via the return below, but need to sync
          // Use a microtask to avoid stale closure
          queueMicrotask(() => setZoom(newZoom));
          return { x: newPanX, y: newPanY };
        });
        return prevZoom; // Will be overridden by microtask
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [openDiagramId]);

  // Pointer pan
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.button !== 1) return;
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isPanning.current) {
      isPanning.current = false;
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  }, []);

  // Render mermaid
  useEffect(() => {
    if (!openDiagramId || !svgContainerRef.current) return;
    if (renderedRef.current === openDiagramId) return;

    const definition = diagrams[openDiagramId];
    if (!definition) return;

    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, definition);
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svg;
          renderedRef.current = openDiagramId;

          const svgEl = svgContainerRef.current.querySelector('svg');
          if (svgEl) {
            // Fix edge label text color (mermaid sets it to white from primaryTextColor)
            svgEl.querySelectorAll('.edgeLabel span').forEach((span) => {
              (span as HTMLElement).style.color = '#1E1B4B';
            });

            // Parse the viewBox to get natural dimensions
            const vb = svgEl.getAttribute('viewBox');
            let svgW = 0, svgH = 0;
            if (vb) {
              const parts = vb.split(/\s+/).map(Number);
              svgW = parts[2];
              svgH = parts[3];
            }

            // Set SVG to its natural pixel size (not 100%)
            svgEl.setAttribute('width', String(svgW));
            svgEl.setAttribute('height', String(svgH));
            svgEl.style.display = 'block';
            svgEl.style.overflow = 'visible';

            svgSizeRef.current = { w: svgW, h: svgH };

            // Auto-fit to viewport
            const vp = viewportRef.current;
            if (vp) {
              const rect = vp.getBoundingClientRect();
              const fit = fitToViewport(svgW, svgH, rect.width, rect.height);
              setZoom(fit.zoom);
              setPan(fit.pan);
            }
          }
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = `<p style="color: #ef4444;">Failed to render diagram</p>`;
        }
      }
    };

    renderDiagram();
  }, [openDiagramId]);

  // Reset on close
  useEffect(() => {
    if (!openDiagramId) {
      renderedRef.current = null;
    }
  }, [openDiagramId]);

  const zoomTowardCenter = useCallback((newZoom: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setPan((prev) => {
      setZoom((prevZoom) => {
        const worldX = (cx - prev.x) / prevZoom;
        const worldY = (cy - prev.y) / prevZoom;
        setPan({ x: cx - worldX * newZoom, y: cy - worldY * newZoom });
        return newZoom;
      });
      return prev;
    });
  }, []);

  const handleZoomIn = () => zoomTowardCenter(Math.min(zoom * 1.3, 8));
  const handleZoomOut = () => zoomTowardCenter(Math.max(zoom / 1.3, 0.1));

  const handleFitToView = () => {
    const vp = viewportRef.current;
    if (vp && svgSizeRef.current.w > 0) {
      const rect = vp.getBoundingClientRect();
      const fit = fitToViewport(svgSizeRef.current.w, svgSizeRef.current.h, rect.width, rect.height);
      setZoom(fit.zoom);
      setPan(fit.pan);
    }
  };

  if (!openDiagramId) return null;

  const title =
    openDiagramId === 'core-architecture'
      ? 'Claude Code — Core Architecture'
      : openDiagramId;

  return (
    <div className="diagram-overlay" onClick={handleClose}>
      <div className="diagram-overlay__backdrop" />
      <div
        className="diagram-overlay__container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="diagram-overlay__header">
          <h2 className="diagram-overlay__title">{title}</h2>
          <div className="diagram-overlay__controls">
            <button className="diagram-overlay__ctrl-btn" onClick={handleZoomOut} title="Zoom out">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="diagram-overlay__zoom-label">{Math.round(zoom * 100)}%</span>
            <button className="diagram-overlay__ctrl-btn" onClick={handleZoomIn} title="Zoom in">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button className="diagram-overlay__ctrl-btn" onClick={handleFitToView} title="Fit to view">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button className="diagram-overlay__close" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div
          className="diagram-overlay__viewport"
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            className="diagram-overlay__canvas"
            ref={svgContainerRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <div className="diagram-overlay__loading">
              <div className="diagram-overlay__spinner" />
              Rendering diagram...
            </div>
          </div>
        </div>
        <div className="diagram-overlay__hint">
          Scroll to zoom · Drag to pan
        </div>
      </div>
    </div>
  );
}
