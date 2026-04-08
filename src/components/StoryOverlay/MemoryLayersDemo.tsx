import { useState, useEffect } from 'react';
import './demos.css';

const LAYERS = [
  {
    name: '~/.claude/CLAUDE.md',
    label: 'Global',
    color: '#60C0A0',
    lines: [
      'You are working in a monorepo.',
      'Always run tests before committing.',
      'Prefer TypeScript strict mode.',
    ],
  },
  {
    name: './CLAUDE.md',
    label: 'Project',
    color: '#40A0E0',
    lines: [
      'This project uses pnpm, not npm.',
      'Auth handled in src/middleware/auth.ts.',
      'Do not touch src/legacy/ — deprecated.',
    ],
  },
  {
    name: '.claude/CLAUDE.local.md',
    label: 'Local (gitignored)',
    color: '#D97706',
    lines: [
      'My API key is in .env.local.',
      'Use my fork at github.com/me/utils.',
    ],
  },
];

export function MemoryLayersDemo() {
  const [revealedLayer, setRevealedLayer] = useState(-1);
  const [revealedLines, setRevealedLines] = useState<number[][]>([[], [], []]);
  const [merged, setMerged] = useState<Array<{ text: string; color: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        setRevealedLayer(-1);
        setRevealedLines([[], [], []]);
        setMerged([]);
        await new Promise<void>((r) => setTimeout(r, 1400));

        for (let li = 0; li < LAYERS.length; li++) {
          if (cancelled) return;
          setRevealedLayer(li);
          for (let line = 0; line < LAYERS[li].lines.length; line++) {
            if (cancelled) return;
            await new Promise<void>((r) => setTimeout(r, 700));
            setRevealedLines((prev) => {
              const next = prev.map((a) => [...a]);
              next[li] = [...next[li], line];
              return next;
            });
          }
          await new Promise<void>((r) => setTimeout(r, 1000));
        }

        // Merge all into system prompt
        await new Promise<void>((r) => setTimeout(r, 800));
        const all: Array<{ text: string; color: string }> = [];
        for (const layer of LAYERS) {
          for (const line of layer.lines) {
            all.push({ text: line, color: layer.color });
          }
        }
        for (let i = 0; i < all.length; i++) {
          if (cancelled) return;
          setMerged((prev) => [...prev, all[i]]);
          await new Promise<void>((r) => setTimeout(r, 300));
        }
        await new Promise<void>((r) => setTimeout(r, 4000));
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="mldemo">
      <div className="mldemo__layers">
        {LAYERS.map((layer, li) => (
          <div key={li} className={`mldemo__layer ${revealedLayer >= li ? 'mldemo__layer--active' : ''}`}
            style={{ '--layer-color': layer.color } as React.CSSProperties}>
            <div className="mldemo__layer-header">
              <span className="mldemo__layer-badge">{layer.label}</span>
              <span className="mldemo__layer-path">{layer.name}</span>
            </div>
            <div className="mldemo__layer-lines">
              {layer.lines.map((line, i) => (
                <div key={i} className={`mldemo__layer-line ${revealedLines[li].includes(i) ? 'mldemo__layer-line--visible' : ''}`}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {merged.length > 0 && (
        <div className="mldemo__merged">
          <div className="mldemo__merged-header">↓ merged into system prompt (later overrides earlier)</div>
          {merged.map((m, i) => (
            <div key={i} className="mldemo__merged-line" style={{ color: m.color, borderLeftColor: m.color }}>
              {m.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
