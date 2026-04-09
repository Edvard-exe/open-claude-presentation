import { useState, useEffect } from 'react';
import './demos.css';

export function CacheCostDemo() {
  const [call, setCall] = useState(0);
  const [running, setRunning] = useState(true);

  const MAX_CALLS = 50;
  const PRICE_NO_CACHE = 1.50;
  const PRICE_FIRST_CALL = 1.50;
  const PRICE_CACHE_HIT = 0.15;

  useEffect(() => {
    if (!running) return;
    if (call >= MAX_CALLS) { setRunning(false); return; }
    const t = setTimeout(() => setCall((c) => c + 1), call === 0 ? 1600 : 440);
    return () => clearTimeout(t);
  }, [call, running]);

  const resetDemo = () => { setCall(0); setRunning(true); };

  const noCache = call * PRICE_NO_CACHE;
  const withCache = call === 0 ? 0 : PRICE_FIRST_CALL + (call - 1) * PRICE_CACHE_HIT;
  const saved = noCache - withCache;
  const savePct = noCache > 0 ? Math.round((saved / noCache) * 100) : 0;

  const barMax = MAX_CALLS * PRICE_NO_CACHE;

  return (
    <div className="ccdemo">
      <div className="ccdemo__calls">
        <div className="ccdemo__call-counter">{call}</div>
        <div className="ccdemo__call-label">API calls</div>
        {call >= MAX_CALLS && (
          <button className="ccdemo__reset" onClick={resetDemo}>↺ replay</button>
        )}
      </div>

      <div className="ccdemo__bars">
        {/* No cache */}
        <div className="ccdemo__track">
          <div className="ccdemo__track-label">Without cache</div>
          <div className="ccdemo__track-bg">
            <div className="ccdemo__track-fill ccdemo__track-fill--bad"
              style={{ width: `${Math.min((noCache / barMax) * 100, 100)}%` }} />
          </div>
          <div className="ccdemo__track-val ccdemo__val--bad">${noCache.toFixed(2)}</div>
        </div>

        {/* With cache */}
        <div className="ccdemo__track">
          <div className="ccdemo__track-label">With caching</div>
          <div className="ccdemo__track-bg">
            <div className="ccdemo__track-fill ccdemo__track-fill--good"
              style={{ width: `${Math.min((withCache / barMax) * 100, 100)}%` }} />
          </div>
          <div className="ccdemo__track-val ccdemo__val--good">${withCache.toFixed(2)}</div>
        </div>
      </div>

      <div className="ccdemo__savings">
        <div className="ccdemo__save-box">
          <div className="ccdemo__save-label">saved</div>
          <div className="ccdemo__save-val">${saved.toFixed(2)}</div>
        </div>
        <div className="ccdemo__save-box">
          <div className="ccdemo__save-label">reduction</div>
          <div className="ccdemo__save-pct">{savePct}%</div>
        </div>
        <div className="ccdemo__save-note">
          First call: ${PRICE_FIRST_CALL.toFixed(2)}<br/>
          Cache hits: ${PRICE_CACHE_HIT.toFixed(2)} each
        </div>
      </div>

      {call >= 10 && (
        <div className="ccdemo__hint">
          💡 At {call} calls: caching is {(noCache / withCache).toFixed(1)}× cheaper
        </div>
      )}
    </div>
  );
}
