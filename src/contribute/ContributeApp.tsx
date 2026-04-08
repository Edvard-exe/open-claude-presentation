import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';

interface TileInfo {
  id: string;
  title: string;
}

type Mode = 'add-sub-item' | 'new-tile';

function useContributeSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [tiles, setTiles] = useState<TileInfo[]>([]);
  const [connected, setConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const attempt = useRef(0);

  const connect = useCallback(() => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${location.host}/ws/contribute`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      attempt.current = 0;
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'tile-list') {
        setTiles(msg.tiles);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      const delay = Math.min(1000 * 2 ** attempt.current, 10000);
      attempt.current++;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const submit = useCallback((payload: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'contribute', payload }));
    }
  }, []);

  return { tiles, connected, submit };
}

export function ContributeApp() {
  const { tiles, connected, submit } = useContributeSocket();
  const [mode, setMode] = useState<Mode>('add-sub-item');
  const [submitted, setSubmitted] = useState(false);

  const [targetTileId, setTargetTileId] = useState('');
  const [tileTitle, setTileTitle] = useState('');
  const [label, setLabel] = useState('');
  const [filePath, setFilePath] = useState('');
  const [line, setLine] = useState('');
  const [description, setDescription] = useState('');

  // Set default target tile when tiles load
  useEffect(() => {
    if (tiles.length > 0 && !targetTileId) {
      setTargetTileId(tiles[0].id);
    }
  }, [tiles, targetTileId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit({
      type: mode,
      ...(mode === 'new-tile' ? { tileTitle } : { targetTileId }),
      component: {
        label,
        filePath,
        line: parseInt(line, 10) || 0,
        description,
      },
    });
    setLabel('');
    setFilePath('');
    setLine('');
    setDescription('');
    if (mode === 'new-tile') setTileTitle('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <div className="contribute">
      <div className="contribute__header">
        <h1>Add to the Board</h1>
        <div className={`contribute__status ${connected ? 'contribute__status--on' : ''}`}>
          <span className="contribute__dot" />
          {connected ? 'Connected' : 'Connecting...'}
        </div>
      </div>

      {submitted ? (
        <div className="contribute__success">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#22c55e" strokeWidth="3" />
            <path d="M14 24l7 7 13-13" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p>Added to the board!</p>
        </div>
      ) : (
        <form className="contribute__form" onSubmit={handleSubmit}>
          <div className="contribute__mode">
            <button
              type="button"
              className={`contribute__mode-btn ${mode === 'add-sub-item' ? 'contribute__mode-btn--active' : ''}`}
              onClick={() => setMode('add-sub-item')}
            >
              Add to existing tile
            </button>
            <button
              type="button"
              className={`contribute__mode-btn ${mode === 'new-tile' ? 'contribute__mode-btn--active' : ''}`}
              onClick={() => setMode('new-tile')}
            >
              New tile
            </button>
          </div>

          {mode === 'add-sub-item' && (
            <div className="contribute__field">
              <label htmlFor="tile">Tile</label>
              <select id="tile" value={targetTileId} onChange={(e) => setTargetTileId(e.target.value)}>
                {tiles.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          {mode === 'new-tile' && (
            <div className="contribute__field">
              <label htmlFor="tileTitle">Tile title</label>
              <input
                id="tileTitle"
                value={tileTitle}
                onChange={(e) => setTileTitle(e.target.value)}
                placeholder="e.g. Memory System"
                required
              />
            </div>
          )}

          <div className="contribute__divider">Component details</div>

          <div className="contribute__field">
            <label htmlFor="label">Component name</label>
            <input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. MemoryManager"
              required
            />
          </div>

          <div className="contribute__field">
            <label htmlFor="filePath">File path</label>
            <div className="contribute__path-input">
              <span className="contribute__path-prefix">src/</span>
              <input
                id="filePath"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="e.g. tools/toolHooks.ts"
                required
              />
            </div>
          </div>

          <div className="contribute__field contribute__field--short">
            <label htmlFor="line">Line number</label>
            <input
              id="line"
              type="number"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              placeholder="42"
            />
          </div>

          <div className="contribute__field">
            <label htmlFor="desc">What does it do?</label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this component"
              rows={3}
              required
            />
          </div>

          <button type="submit" className="contribute__submit" disabled={!connected}>
            Add to board
          </button>
        </form>
      )}
    </div>
  );
}
