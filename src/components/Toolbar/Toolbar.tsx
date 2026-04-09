import { useBoardStore } from '../../store/boardStore';
import './Toolbar.css';

export function Toolbar() {
  const zoom = useBoardStore((s) => s.zoom);
  const setZoom = useBoardStore((s) => s.setZoom);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const startPresentation = useBoardStore((s) => s.startPresentation);

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleResetView = () => useBoardStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });

  if (presentationActive) return null;

  return (
    <div className="toolbar">
      <button className="toolbar__btn" onClick={handleZoomOut} title="Zoom out (-)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button className="toolbar__zoom" onClick={handleResetView} title="Reset view (0)">
        {Math.round(zoom * 100)}%
      </button>
      <button className="toolbar__btn" onClick={handleZoomIn} title="Zoom in (+)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div className="toolbar__divider" />
      <button className="toolbar__btn toolbar__btn--play" onClick={startPresentation} title="Start presentation (P)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 2.5v11l9-5.5L4 2.5z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
