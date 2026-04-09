import { useState, useEffect, useRef } from 'react';
import './KairosDemo.css';

interface LogLine {
  id: number;
  type: 'tick' | 'think' | 'tool' | 'sleep' | 'result' | 'msg' | 'permission';
  text: string;
}

const SEQUENCE: Array<Omit<LogLine, 'id'> & { delay: number }> = [
  { type: 'tick',   text: '<tick>09:14:02</tick>',                                              delay: 1200 },
  { type: 'think',  text: 'Reviewing PR #247 status…',                                          delay: 1800 },
  { type: 'tool',   text: 'Bash("gh pr view 247 --json state,reviews")',                        delay: 1400 },
  { type: 'result', text: '{ "state": "OPEN", "reviews": [], "isDraft": false }',               delay: 1000 },
  { type: 'think',  text: 'No reviews yet. I should ping the team.',                             delay: 1600 },
  { type: 'tool',   text: 'Bash("gh pr comment 247 --body \'Ready for review\'")',              delay: 1200 },
  { type: 'permission', text: '⚡ YOLO classifier → safe ✓ (auto-approved)',                   delay: 800  },
  { type: 'result', text: 'Comment posted on PR #247',                                          delay: 1400 },
  { type: 'msg',    text: 'SendUserMessage("Pinged reviewers on PR #247")',                      delay: 1000 },
  { type: 'sleep',  text: 'Sleep(300)  ← waiting 5 min, cache-aware pacing',                   delay: 2400 },
  { type: 'tick',   text: '<tick>09:19:02</tick>',                                              delay: 1200 },
  { type: 'think',  text: 'Nothing urgent. Cache still warm. Sleeping again.',                  delay: 1400 },
  { type: 'sleep',  text: 'Sleep(300)',                                                          delay: 2000 },
  { type: 'tick',   text: '<tick>09:24:03</tick>',                                              delay: 1200 },
  { type: 'think',  text: 'Checking if CI passed…',                                             delay: 1400 },
  { type: 'tool',   text: 'Bash("gh pr checks 247")',                                           delay: 1000 },
  { type: 'result', text: '✓ All checks passed',                                               delay: 1200 },
  { type: 'msg',    text: 'SendUserMessage("PR #247 CI green. Ready to merge.")',               delay: 800  },
  { type: 'sleep',  text: 'Sleep(600)  ← longer wait, less urgent now',                        delay: 1600 },
];

export function KairosDemo() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const run = async () => {
      setLines([]);
      counterRef.current = 0;
      for (const item of SEQUENCE) {
        if (cancelled) return;
        await new Promise<void>((r) => setTimeout(r, item.delay));
        if (cancelled) return;
        const id = counterRef.current++;
        setLines((prev) => [...prev, { id, type: item.type, text: item.text }]);
      }
      // loop
      await new Promise<void>((r) => setTimeout(r, 4000));
      if (!cancelled) { setLines([]); run(); }
    };
    run();
    return () => { cancelled = true; };
  }, [running]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="kdemo">
      <div className="kdemo__bar">
        <div className="kdemo__bar-left">
          <div className="kdemo__status-dot" />
          <span>Kairos · autonomous session</span>
        </div>
        <div className="kdemo__bar-right">
          <span className="kdemo__mode">--permission-mode auto</span>
          <button className="kdemo__toggle" onClick={() => setRunning((r) => !r)}>
            {running ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>
      </div>

      <div className="kdemo__log">
        {lines.map((line) => (
          <div key={line.id} className={`kdemo__line kdemo__line--${line.type}`}>
            <span className="kdemo__gutter">{lineGlyph(line.type)}</span>
            <span className="kdemo__text">{line.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
        {running && <div className="kdemo__cursor">▌</div>}
      </div>

      <div className="kdemo__footer">
        <div className="kdemo__legend">
          <span className="kdemo__badge kdemo__badge--tick">tick</span>
          <span className="kdemo__badge kdemo__badge--think">think</span>
          <span className="kdemo__badge kdemo__badge--tool">tool</span>
          <span className="kdemo__badge kdemo__badge--permission">yolo</span>
          <span className="kdemo__badge kdemo__badge--sleep">sleep</span>
          <span className="kdemo__badge kdemo__badge--msg">msg</span>
        </div>
        <span className="kdemo__note">Bash(*) and Agent(*) stripped before session starts</span>
      </div>
    </div>
  );
}

function lineGlyph(type: LogLine['type']) {
  switch (type) {
    case 'tick':       return '⏰';
    case 'think':      return '💭';
    case 'tool':       return '⚙';
    case 'permission': return '⚡';
    case 'sleep':      return '😴';
    case 'result':     return '◦';
    case 'msg':        return '📨';
  }
}
