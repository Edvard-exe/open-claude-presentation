import { useState, useEffect } from 'react';
import './demos.css';

type Phase = 'filling' | 'warning' | 'micro' | 'compact' | 'summary' | 'done';

const MESSAGES = [
  { label: 'User: Find TODOs',        size: 4,  color: '#60C0A0' },
  { label: 'Assistant: Searching…',   size: 6,  color: '#7C3AED' },
  { label: 'Tool: Glob result',       size: 18, color: '#2563EB' },
  { label: 'Tool: Read src/auth.ts',  size: 22, color: '#2563EB' },
  { label: 'Tool: Read src/utils.ts', size: 20, color: '#2563EB' },
  { label: 'Assistant: Found 3…',     size: 8,  color: '#7C3AED' },
  { label: 'Tool: Edit auth.ts',      size: 16, color: '#2563EB' },
  { label: 'Tool: Bash npm test',     size: 24, color: '#2563EB' },
  { label: 'Assistant: Done ✓',       size: 5,  color: '#7C3AED' },
];
const TOTAL = MESSAGES.reduce((s, m) => s + m.size, 0);
const WINDOW = 100;
const THRESHOLD = 70;

export function CompactionDemo() {
  const [shown, setShown] = useState(0);
  const [phase, setPhase] = useState<Phase>('filling');
  const [compacted, setCompacted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setShown(0); setPhase('filling'); setCompacted(false);
        await new Promise<void>((r) => setTimeout(r, 1000));

        for (let i = 0; i < MESSAGES.length; i++) {
          if (cancelled) return;
          setShown(i + 1);
          const used = MESSAGES.slice(0, i + 1).reduce((s, m) => s + m.size, 0);
          const pct = (used / WINDOW) * 100;
          if (pct >= THRESHOLD && !compacted) {
            setPhase('warning');
            await new Promise<void>((r) => setTimeout(r, 1600));
            if (cancelled) return;
            setPhase('micro');
            await new Promise<void>((r) => setTimeout(r, 1800));
            if (cancelled) return;
            setPhase('compact');
            await new Promise<void>((r) => setTimeout(r, 1800));
            if (cancelled) return;
            setPhase('summary');
            setCompacted(true);
            await new Promise<void>((r) => setTimeout(r, 3000));
            if (cancelled) return;
            setPhase('done');
          } else {
            await new Promise<void>((r) => setTimeout(r, 700));
          }
        }
        await new Promise<void>((r) => setTimeout(r, 4000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const usedTokens = MESSAGES.slice(0, shown).reduce((s, m) => s + m.size, 0);
  const pct = Math.min((usedTokens / WINDOW) * 100, 100);

  return (
    <div className="compdemo">
      {/* Context window bar */}
      <div className="compdemo__window">
        <div className="compdemo__window-label">
          Context window
          <span className="compdemo__window-pct" style={{ color: pct >= THRESHOLD ? '#f87171' : '#aaa' }}>
            {Math.round(pct)}%
          </span>
        </div>
        <div className="compdemo__window-bar">
          <div className="compdemo__window-fill"
            style={{
              width: `${compacted ? 15 : pct}%`,
              background: pct >= THRESHOLD && !compacted ? '#f87171' : '#059669',
              transition: 'width 0.4s ease',
            }}
          />
          <div className="compdemo__threshold" style={{ left: `${THRESHOLD}%` }} title="70% threshold" />
        </div>
        <div className="compdemo__window-legend">
          <span style={{ color: '#666' }}>0</span>
          <span style={{ color: '#f59e0b', fontSize: '0.6rem' }}>autoCompact at 70%</span>
          <span style={{ color: '#666' }}>{WINDOW}K tokens</span>
        </div>
      </div>

      {/* Message list */}
      <div className="compdemo__messages">
        {MESSAGES.slice(0, shown).map((m, i) => (
          <div key={i} className={`compdemo__msg ${compacted && i < 7 ? 'compdemo__msg--compacted' : ''}`}
            style={{ '--msg-color': m.color, width: `${(m.size / TOTAL) * 100}%` } as React.CSSProperties}>
            <span className="compdemo__msg-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Phase indicators */}
      {phase === 'warning' && (
        <div className="compdemo__phase compdemo__phase--warn">
          ⚠ Context at 70% — autoCompact triggered
        </div>
      )}
      {phase === 'micro' && (
        <div className="compdemo__phase compdemo__phase--micro">
          ↩ Microcompact: deleting old tool results from server cache…
        </div>
      )}
      {phase === 'compact' && (
        <div className="compdemo__phase compdemo__phase--compact">
          ✦ Full compact: sending 8 messages to Claude for 9-section summary…
        </div>
      )}
      {(phase === 'summary' || phase === 'done') && (
        <div className="compdemo__summary">
          <div className="compdemo__summary-header">📝 Compact summary (replaces 8 messages)</div>
          <div className="compdemo__summary-body">
            <div>• Primary Request: Fix 3 TODOs in src/</div>
            <div>• Files Modified: src/auth.ts, src/utils.ts</div>
            <div>• Errors Fixed: empty-string check, token expiry</div>
            <div>• Current Work: tests passing ✓</div>
          </div>
        </div>
      )}
    </div>
  );
}
