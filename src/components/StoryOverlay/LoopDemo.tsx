import { useState, useEffect } from 'react';
import './demos.css';

const NODES = [
  { id: 'input',   label: 'User Input',     color: '#60C0A0' },
  { id: 'api',     label: 'API / Stream',   color: '#7C3AED' },
  { id: 'detect',  label: 'tool_use?',      color: '#7C3AED' },
  { id: 'execute', label: 'Execute Tools',  color: '#2563EB' },
  { id: 'results', label: 'Append Results', color: '#2563EB' },
  { id: 'done',    label: 'Done ✓',         color: '#4ade80' },
];

// Sequence: index of active node, -1 = idle
const LOOP_SEQ = [0, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 5];
const LOOP_DELAYS = [1600, 2000, 1400, 1800, 1200, 1800, 1400, 1600, 1200, 1800, 1400, 2400];

export function LoopDemo() {
  const [active, setActive] = useState(-1);
  const [seqIdx, setSeqIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        for (let i = 0; i < LOOP_SEQ.length; i++) {
          if (cancelled) return;
          setSeqIdx(i);
          setActive(LOOP_SEQ[i]);
          await new Promise<void>((r) => setTimeout(r, LOOP_DELAYS[i]));
        }
        await new Promise<void>((r) => setTimeout(r, 2000));
        setActive(-1); setSeqIdx(0);
        await new Promise<void>((r) => setTimeout(r, 1000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const nodeActive = (idx: number) => active === idx;
  const loopCount = Math.floor(seqIdx / 4);

  return (
    <div className="ldemo">
      <div className="ldemo__header">
        <span className="ldemo__badge">while(true)</span>
        {loopCount > 0 && <span className="ldemo__turns">turn {loopCount}</span>}
      </div>
      <div className="ldemo__flow">
        {NODES.map((node, i) => (
          <div key={node.id} className={`ldemo__node ${nodeActive(i) ? 'ldemo__node--active' : ''} ${active > i && i < 5 ? 'ldemo__node--visited' : ''}`}
            style={{ '--node-color': node.color } as React.CSSProperties}>
            <div className="ldemo__node-dot" />
            <div className="ldemo__node-label">{node.label}</div>
          </div>
        ))}
        {/* Back-arrow indicator for tool loop */}
        <div className={`ldemo__back-arrow ${active >= 3 && active <= 4 ? 'ldemo__back-arrow--active' : ''}`}>
          ↩ re-enter loop
        </div>
      </div>
      <div className="ldemo__log">
        {active === 0 && <span className="ldemo__log-line" style={{ color: '#60C0A0' }}>▶ "Find all TODOs in src/ and fix them"</span>}
        {active === 1 && <span className="ldemo__log-line" style={{ color: '#7C3AED' }}>⟳ streaming response from claude-opus-4…</span>}
        {active === 2 && seqIdx < 6 && <span className="ldemo__log-line" style={{ color: '#facc15' }}>? tool_use detected → needsFollowUp = true</span>}
        {active === 2 && seqIdx >= 9 && <span className="ldemo__log-line" style={{ color: '#facc15' }}>? tool_use detected → needsFollowUp = true</span>}
        {active === 3 && seqIdx < 7 && <span className="ldemo__log-line" style={{ color: '#2563EB' }}>⚙ Glob("**/*.ts") → 47 files</span>}
        {active === 4 && seqIdx < 8 && <span className="ldemo__log-line" style={{ color: '#2563EB' }}>✓ results appended to messages</span>}
        {active === 3 && seqIdx >= 8 && <span className="ldemo__log-line" style={{ color: '#2563EB' }}>⚙ Edit("src/utils.ts") → applied 3 changes</span>}
        {active === 4 && seqIdx >= 8 && <span className="ldemo__log-line" style={{ color: '#2563EB' }}>✓ results appended to messages</span>}
        {active === 5 && <span className="ldemo__log-line" style={{ color: '#4ade80' }}>✓ no tool_use → loop exits</span>}
      </div>
    </div>
  );
}
