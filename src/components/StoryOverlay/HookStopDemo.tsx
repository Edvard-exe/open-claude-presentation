import { useState, useEffect } from 'react';
import './demos.css';

type Phase = 'idle' | 'model-done' | 'hook-fire' | 'test-run' | 'test-fail' | 'blocked' | 'model-retry' | 'test-run2' | 'test-pass' | 'released' | 'complete';

const LOG: Record<Phase, { lines: Array<{ text: string; color: string }>; duration: number }> = {
  idle:        { lines: [], duration: 1200 },
  'model-done':{ lines: [{ text: '✓ Model finished task. Preparing to stop...', color: '#aaa' }], duration: 1600 },
  'hook-fire': { lines: [{ text: '⚡ Stop hook triggered: npm-test-gate', color: '#EA580C' }], duration: 1400 },
  'test-run':  { lines: [{ text: '$ npm test --silent', color: '#4ade80' }], duration: 1800 },
  'test-fail': { lines: [
    { text: 'FAIL src/auth.test.ts', color: '#f87171' },
    { text: '  ✕ login() should reject empty password (23ms)', color: '#f87171' },
    { text: '  ✕ token expiry check (11ms)', color: '#f87171' },
    { text: 'Tests: 2 failed, 14 passed', color: '#f87171' },
  ], duration: 2400 },
  blocked:     { lines: [{ text: '↩ Exit code 2 → BLOCKING feedback injected into model', color: '#EA580C' }], duration: 1800 },
  'model-retry':{ lines: [
    { text: '◎ Model receives: "Tests failing: login() empty password..."', color: '#7C3AED' },
    { text: '⚙  Edit("src/auth.ts") → added empty-string guard', color: '#60a5fa' },
    { text: '⚙  Edit("src/auth.ts") → fixed token expiry logic', color: '#60a5fa' },
  ], duration: 3600 },
  'test-run2': { lines: [{ text: '$ npm test --silent', color: '#4ade80' }], duration: 1800 },
  'test-pass': { lines: [
    { text: 'Tests: 16 passed, 0 failed', color: '#4ade80' },
    { text: '✓ All tests green.', color: '#4ade80' },
  ], duration: 2000 },
  released:    { lines: [{ text: '✓ Stop hook: exit 0 → model may stop', color: '#EA580C' }], duration: 1400 },
  complete:    { lines: [{ text: '✓ Session complete.', color: '#aaa' }], duration: 3000 },
};

const PHASE_ORDER: Phase[] = ['idle','model-done','hook-fire','test-run','test-fail','blocked','model-retry','test-run2','test-pass','released','complete'];

export function HookStopDemo() {
  const [lines, setLines] = useState<Array<{ text: string; color: string; phase: Phase }>>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setLines([]); setPhase('idle'); setBlocked(false);
        await new Promise<void>((r) => setTimeout(r, 1000));
        for (const p of PHASE_ORDER) {
          if (cancelled) return;
          setPhase(p);
          if (p === 'blocked') setBlocked(true);
          if (p === 'released') setBlocked(false);
          for (const l of LOG[p].lines) {
            if (cancelled) return;
            setLines((prev) => [...prev, { ...l, phase: p }]);
            await new Promise<void>((r) => setTimeout(r, 240));
          }
          await new Promise<void>((r) => setTimeout(r, LOG[p].duration));
        }
        await new Promise<void>((r) => setTimeout(r, 3000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="hsdemo">
      <div className="hsdemo__bar">
        <span className="hsdemo__title">Stop Hook: npm-test-gate</span>
        <span className={`hsdemo__status ${blocked ? 'hsdemo__status--blocked' : phase === 'complete' ? 'hsdemo__status--done' : 'hsdemo__status--running'}`}>
          {blocked ? '🚫 BLOCKED' : phase === 'complete' ? '✓ done' : '◎ running'}
        </span>
      </div>
      <div className="hsdemo__log">
        {lines.map((l, i) => (
          <div key={i} className="hsdemo__line" style={{ color: l.color,
            fontWeight: l.phase === 'blocked' || l.phase === 'hook-fire' || l.phase === 'released' ? 700 : 400 }}>
            {l.text}
          </div>
        ))}
        {phase !== 'idle' && phase !== 'complete' && <div className="hsdemo__cursor">▌</div>}
      </div>
      <div className="hsdemo__legend">
        <div className="hsdemo__legend-item" style={{ color: '#EA580C' }}>● Hook (exit 2 = block)</div>
        <div className="hsdemo__legend-item" style={{ color: '#7C3AED' }}>● Model</div>
        <div className="hsdemo__legend-item" style={{ color: '#60a5fa' }}>● Tool</div>
        <div className="hsdemo__legend-item" style={{ color: '#4ade80' }}>● Tests</div>
      </div>
    </div>
  );
}
