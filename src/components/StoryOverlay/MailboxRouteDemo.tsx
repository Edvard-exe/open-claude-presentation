import { useState, useEffect } from 'react';
import './demos.css';

type Msg = { id: number; text: string; route: 'inprocess' | 'file'; status: 'sending' | 'queued' | 'delivered'; };

const SEQUENCE: Array<{ text: string; route: 'inprocess' | 'file'; delay: number }> = [
  { text: 'Plan approved, starting phase 2',        route: 'inprocess', delay: 1600 },
  { text: 'Urgent: redirect to auth bug',           route: 'inprocess', delay: 2400 },
  { text: 'Agent B: PR #247 ready for review',      route: 'file',      delay: 2000 },
  { text: 'Permission request: write to /etc',      route: 'file',      delay: 1800 },
  { text: 'Phase 2 complete, results attached',     route: 'inprocess', delay: 2200 },
  { text: 'Shutdown: session ending',               route: 'file',      delay: 1400 },
];

let globalId = 0;

export function MailboxRouteDemo() {
  const [msgs, setMsgs] = useState<Msg[]>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setMsgs([]);
        globalId = 0;
        for (const item of SEQUENCE) {
          if (cancelled) return;
          await new Promise<void>((r) => setTimeout(r, item.delay));
          const id = globalId++;
          setMsgs((prev) => [...prev, { id, text: item.text, route: item.route, status: 'sending' }]);
          await new Promise<void>((r) => setTimeout(r, 500));
          setMsgs((prev) => prev.map((m) => m.id === id ? { ...m, status: 'queued' } : m));
          await new Promise<void>((r) => setTimeout(r, 800));
          setMsgs((prev) => prev.map((m) => m.id === id ? { ...m, status: 'delivered' } : m));
        }
        await new Promise<void>((r) => setTimeout(r, 4000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const inProcess = msgs.filter((m) => m.route === 'inprocess');
  const fileBased = msgs.filter((m) => m.route === 'file');

  return (
    <div className="mbdemo">
      <div className="mbdemo__cols">
        {/* In-process */}
        <div className="mbdemo__col">
          <div className="mbdemo__col-header mbdemo__col-header--ip">
            <span>⚡ In-process queue</span>
            <span className="mbdemo__col-sub">queuePendingMessage()</span>
          </div>
          <div className="mbdemo__col-body">
            {inProcess.map((m) => (
              <div key={m.id} className={`mbdemo__msg mbdemo__msg--${m.status} mbdemo__msg--ip`}>
                <div className="mbdemo__msg-status">
                  {m.status === 'sending' ? '○' : m.status === 'queued' ? '◎' : '✓'}
                </div>
                <div className="mbdemo__msg-text">{m.text}</div>
              </div>
            ))}
            <div className="mbdemo__col-note">Drained at tool boundaries<br/>No disk I/O</div>
          </div>
        </div>

        {/* File-based */}
        <div className="mbdemo__col">
          <div className="mbdemo__col-header mbdemo__col-header--file">
            <span>📁 File mailbox</span>
            <span className="mbdemo__col-sub">~/.claude/teams/…</span>
          </div>
          <div className="mbdemo__col-body">
            {fileBased.map((m) => (
              <div key={m.id} className={`mbdemo__msg mbdemo__msg--${m.status} mbdemo__msg--file`}>
                <div className="mbdemo__msg-status">
                  {m.status === 'sending' ? '○' : m.status === 'queued' ? '◎' : '✓'}
                </div>
                <div className="mbdemo__msg-text">{m.text}</div>
              </div>
            ))}
            <div className="mbdemo__col-note">1-second polling<br/>File-locked writes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
