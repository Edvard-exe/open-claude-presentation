import { useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import './SubItemOverlay.css';

export function SubItemOverlay() {
  const item = useBoardStore((s) => s.openSubItemData);
  const close = useBoardStore((s) => s.closeSubItem);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, close]);

  if (!item) return null;

  const color = item.color || '#2563EB';

  const handleOpenInCursor = () => {
    if (item.filePath) {
      const url = `cursor://file${item.filePath}${item.line ? `:${item.line}:1` : ''}`;
      window.location.href = url;
    }
  };

  return (
    <div className="subitem-overlay" onClick={close}>
      <div
        className="subitem-overlay__card"
        style={{ '--si-color': color } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="subitem-overlay__header">
          <div className="subitem-overlay__dot" />
          <h2 className="subitem-overlay__title">{item.label}</h2>
          <button className="subitem-overlay__close" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {item.description && (
          <div className="subitem-overlay__body">
            <p className="subitem-overlay__desc">{item.description}</p>
          </div>
        )}

        {item.filePath && (
          <div className="subitem-overlay__footer">
            <button className="subitem-overlay__link" onClick={handleOpenInCursor}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M6 1H3A2 2 0 001 3v8a2 2 0 002 2h8a2 2 0 002-2V8M8 1h5v5M13 1L6.5 7.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Open in Cursor
            </button>
            <span className="subitem-overlay__filepath">
              {item.filePath.split('/').pop()}{item.line ? `:${item.line}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
