import { useState, useEffect } from 'react';
import './demos.css';

const EVENTS = [
  { type: 'start',   text: '{ "type": "message_start", "model": "claude-opus-4-6" }',              color: '#555',    delay: 800  },
  { type: 'text',    text: '{ "type": "content_block_delta", "delta": { "text": "I\'ll" } }',        color: '#aaa',    delay: 600  },
  { type: 'text',    text: '{ "type": "content_block_delta", "delta": { "text": " read" } }',        color: '#aaa',    delay: 400  },
  { type: 'text',    text: '{ "type": "content_block_delta", "delta": { "text": " the file" } }',    color: '#aaa',    delay: 400  },
  { type: 'text',    text: '{ "type": "content_block_delta", "delta": { "text": " first." } }',      color: '#aaa',    delay: 400  },
  { type: 'tool',    text: '{ "type": "content_block_start", "content_block": {',                    color: '#60a5fa', delay: 1000 },
  { type: 'tool',    text: '    "type": "tool_use", "name": "Read",',                                color: '#60a5fa', delay: 300  },
  { type: 'tool',    text: '    "input": { "file_path": "/src/utils.ts" }',                          color: '#60a5fa', delay: 300  },
  { type: 'tool',    text: '} }',                                                                     color: '#60a5fa', delay: 300  },
  { type: 'think',   text: '{ "type": "thinking", "thinking": "The file has 3 TODOs..." }',          color: '#8b5cf6', delay: 1400 },
  { type: 'stop',    text: '{ "type": "message_delta", "stop_reason": "tool_use" }',                color: '#f87171', delay: 800  },
  { type: 'stop',    text: '{ "type": "message_stop" }',                                             color: '#555',    delay: 400  },
];

export function StreamDemo() {
  const [lines, setLines] = useState<typeof EVENTS>([]);
  const [assembled, setAssembled] = useState('');

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setLines([]); setAssembled('');
        let text = '';
        for (const ev of EVENTS) {
          if (cancelled) return;
          await new Promise<void>((r) => setTimeout(r, ev.delay));
          if (cancelled) return;
          setLines((prev) => [...prev, ev]);
          if (ev.type === 'text') {
            const word = ev.text.match(/"text": "([^"]+)"/)?.[1] ?? '';
            text += word;
            setAssembled(text);
          }
        }
        await new Promise<void>((r) => setTimeout(r, 4000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="sdemo">
      <div className="sdemo__cols">
        {/* Left: raw SSE events */}
        <div className="sdemo__col">
          <div className="sdemo__col-header">Raw SSE stream</div>
          <div className="sdemo__events">
            {lines.map((l, i) => (
              <div key={i} className={`sdemo__event sdemo__event--${l.type}`} style={{ color: l.color }}>
                {l.text}
              </div>
            ))}
            {lines.length > 0 && <div className="sdemo__cursor">▌</div>}
          </div>
        </div>
        {/* Right: assembled view */}
        <div className="sdemo__col">
          <div className="sdemo__col-header">Assembled response</div>
          <div className="sdemo__assembled">
            {assembled && (
              <div className="sdemo__assembled-text">{assembled}<span className="sdemo__cur" /></div>
            )}
            {lines.some((l) => l.type === 'tool') && (
              <div className="sdemo__tool-block">
                <div className="sdemo__tool-name">⚙ Read</div>
                <div className="sdemo__tool-input">file_path: /src/utils.ts</div>
              </div>
            )}
            {lines.some((l) => l.type === 'think') && (
              <div className="sdemo__thinking">
                <div className="sdemo__think-label">💭 extended thinking</div>
                <div className="sdemo__think-text">The file has 3 TODOs on lines 42, 87, 134…</div>
              </div>
            )}
            {lines.some((l) => l.type === 'stop') && (
              <div className="sdemo__stop">stop_reason: tool_use → loop continues</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
