import { useBoardStore } from '../../store/boardStore';
import './Toolbar.css';

export function Toolbar() {
  const zoom = useBoardStore((s) => s.zoom);
  const setZoom = useBoardStore((s) => s.setZoom);
  const addTile = useBoardStore((s) => s.addTile);
  const pan = useBoardStore((s) => s.pan);
  const presentationActive = useBoardStore((s) => s.presentationActive);
  const startPresentation = useBoardStore((s) => s.startPresentation);
  const toggleQR = useBoardStore((s) => s.toggleQR);

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleResetView = () => useBoardStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });

  const handleAddTile = () => {
    const centerX = (window.innerWidth / 2 - pan.x) / zoom;
    const centerY = (window.innerHeight / 2 - pan.y) / zoom;

    addTile({
      position: { x: centerX - 120, y: centerY - 80 },
      width: 240,
      height: 160,
      title: 'New Tile',
      content: 'Double-click to edit (coming soon)',
    });
  };

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
      <button className="toolbar__btn toolbar__btn--add" onClick={handleAddTile} title="Add tile">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <button className="toolbar__btn" onClick={toggleQR} title="Show QR code (Q)">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="10" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="1" y="10" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="3" y="3" width="1.5" height="1.5" fill="currentColor" />
          <rect x="12" y="3" width="1.5" height="1.5" fill="currentColor" />
          <rect x="3" y="12" width="1.5" height="1.5" fill="currentColor" />
          <rect x="10" y="10" width="2" height="2" fill="currentColor" />
          <rect x="13" y="10" width="2" height="2" fill="currentColor" />
          <rect x="10" y="13" width="2" height="2" fill="currentColor" />
          <rect x="13" y="13" width="2" height="2" fill="currentColor" />
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
