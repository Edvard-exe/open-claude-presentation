import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useBoardStore } from '../../store/boardStore';
import './QROverlay.css';

export function QROverlay() {
  const showQR = useBoardStore((s) => s.showQR);
  const closeQR = useBoardStore((s) => s.closeQR);
  const [contributeUrl, setContributeUrl] = useState('');

  useEffect(() => {
    fetch('/api/contribute-url')
      .then((r) => r.json())
      .then((data) => setContributeUrl(data.url))
      .catch(() => setContributeUrl(`${location.origin}/contribute/`));
  }, []);

  useEffect(() => {
    if (!showQR) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQR();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQR, closeQR]);

  if (!showQR) return null;

  return (
    <div className="qr-overlay" onClick={closeQR}>
      <div className="qr-overlay__card" onClick={(e) => e.stopPropagation()}>
        <h2 className="qr-overlay__title">Contribute a Component</h2>
        <p className="qr-overlay__subtitle">Scan to add your knowledge to the board</p>
        <div className="qr-overlay__code">
          {contributeUrl && <QRCodeSVG value={contributeUrl} size={240} level="M" />}
        </div>
        <p className="qr-overlay__url">{contributeUrl}</p>
        <button className="qr-overlay__close" onClick={closeQR}>Close</button>
      </div>
    </div>
  );
}
