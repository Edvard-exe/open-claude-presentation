import { useBoardStore } from '../../store/boardStore';
import './Toolbar.css';

export function Toolbar() {
  const zoom = useBoardStore((s) => s.zoom);
  const setZoom = useBoardStore((s) => s.setZoom);
  const addTile = useBoardStore((s) => s.addTile);
  const pan = useBoardStore((s) => s.pan);

  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleResetView = () => useBoardStore.setState({ zoom: 1, pan: { x: 0, y: 0 } });

  const handleAddTile = () => {
    // Place new tile near the center of the viewport
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
    </div>
  );
}
