import { useState, useEffect } from 'react';
import { useBoardStore } from '../../store/boardStore';
import type { StoryStep } from '../../types/board';
import { AdvisorDemo } from './AdvisorDemo';
import { KairosDemo } from './KairosDemo';
import { LoopDemo } from './LoopDemo';
import { StreamDemo } from './StreamDemo';
import { ParallelToolsDemo } from './ParallelToolsDemo';
import { CacheCostDemo } from './CacheCostDemo';
import { HookStopDemo } from './HookStopDemo';
import { PermissionGateDemo } from './PermissionGateDemo';
import { CompactionDemo } from './CompactionDemo';
import { MailboxRouteDemo } from './MailboxRouteDemo';
import { MemoryLayersDemo } from './MemoryLayersDemo';
import './StoryOverlay.css';

const SOURCE_ROOT = import.meta.env.VITE_SOURCE_ROOT || '/Users/illiafilipas/code/collection-claude-code-source-code/claude-code-source-code';

function SourceLink({ source, className }: { source: string; className?: string }) {
  const match = source.match(/^(.+?):(\d+)$/);
  const filePath = match ? match[1] : source;
  const line = match ? match[2] : undefined;
  const cursorHref = `cursor://file${SOURCE_ROOT}/${filePath}${line ? `:${line}:1` : ''}`;
  return (
    <a className={className} href={cursorHref} onClick={(e) => e.stopPropagation()} title="Open in Cursor">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ marginRight: 4, verticalAlign: 'middle' }}>
        <path d="M3 1H1.5A.5.5 0 001 1.5v7a.5.5 0 00.5.5h7a.5.5 0 00.5-.5V7M6 1h3v3M9 1L4.5 5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {source}
    </a>
  );
}

export function StoryOverlay() {
  const divedTileId = useBoardStore((s) => s.divedTileId);
  const tiles = useBoardStore((s) => s.tiles);
  const undive = useBoardStore((s) => s.undive);

  const tile = tiles.find((t) => t.id === divedTileId);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Reset step when tile changes
  useEffect(() => { setActive(0); setPlaying(false); }, [divedTileId]);

  // Auto-advance
  useEffect(() => {
    if (!playing || !tile?.storySteps) return;
    const timer = setInterval(() => {
      setActive((a) => {
        if (a >= (tile.storySteps!.length - 1)) { setPlaying(false); return a; }
        return a + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [playing, tile]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') undive();
      if (e.key === 'ArrowRight') setActive((a) => Math.min(a + 1, (tile?.storySteps?.length ?? 1) - 1));
      if (e.key === 'ArrowLeft') setActive((a) => Math.max(a - 1, 0));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undive, tile]);

  if (!tile || !tile.storySteps?.length) return null;

  const steps = tile.storySteps;
  const step = steps[active];
  const color = tile.color || '#c9a84c';
  const cssVar = { '--tile-color': color } as React.CSSProperties;

  return (
    <div className="story-overlay" style={cssVar}>
      <div className="story-overlay__inner">
        {/* Header */}
        <div className="story-overlay__header">
          <button className="story-overlay__back" onClick={undive}>← Back</button>
          <h1 className="story-overlay__title">{tile.title}</h1>
          {tile.filePath && <SourceLink source={tile.filePath} className="story-overlay__source" />}
        </div>

        {tile.content && <p className="story-overlay__desc">{tile.content}</p>}

        {/* Timeline circles */}
        <div className="story-tl">
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="story-tl__step" onClick={() => setActive(i)}>
                <div className={`story-tl__circle ${i === active ? 'story-tl__circle--active' : i < active ? 'story-tl__circle--visited' : ''}`}>
                  {i + 1}
                </div>
                <div className={`story-tl__label ${i === active ? 'story-tl__label--active' : ''}`}>{s.label}</div>
              </div>
              {i < steps.length - 1 && <div className={`story-tl__line ${i < active ? 'story-tl__line--active' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="story-controls">
          <button type="button" aria-label="Previous step" className="story-controls__btn" onClick={() => setActive(Math.max(0, active - 1))}>‹</button>
          <button type="button" aria-label={playing ? 'Pause' : 'Play'} className={`story-controls__btn ${!playing ? 'story-controls__btn--play' : ''}`} onClick={() => setPlaying(!playing)}>
            {playing ? '⏸' : '▶'}
          </button>
          <button type="button" aria-label="Next step" className="story-controls__btn" onClick={() => setActive(Math.min(steps.length - 1, active + 1))}>›</button>
          <span className="story-controls__counter">{active + 1} / {steps.length}</span>
        </div>

        {/* Step Card */}
        {step && <StepCard step={step} index={active} />}
      </div>
    </div>
  );
}

function StepCard({ step, index }: { step: StoryStep; index: number }) {
  return (
    <div className="story-card" key={index}>
      <div className="story-card__top">
        <div>
          <span className="story-card__num">{index + 1}</span>
          <span className="story-card__title">{step.title}</span>
        </div>
        {step.source && <SourceLink source={step.source} className="story-card__src" />}
      </div>

      <p className="story-card__desc">{step.description}</p>

      {/* Spark callout */}
      {step.spark && <div className="story-spark">{step.spark}</div>}

      {/* Code block */}
      {step.code && (
        <div className="story-code">
          <div className="story-code__header">{step.codeLang || 'code'} {step.source && <> · <SourceLink source={step.source} /></>}</div>
          <div className="story-code__body">{step.code}</div>
        </div>
      )}

      {/* Terminal mockup */}
      {step.terminal && (
        <div className="story-term">
          <div className="story-term__bar">
            <span className="story-term__dot" style={{ background: '#f87171' }} />
            <span className="story-term__dot" style={{ background: '#facc15' }} />
            <span className="story-term__dot" style={{ background: '#4ade80' }} />
          </div>
          <div className="story-term__body">
            <span style={{ color: '#4ade80' }}>$ </span>
            <span style={{ color: '#e0e0f0' }}>{step.terminal.command}</span>
            {'\n'}
            <span style={{ color: '#888' }}>{step.terminal.output}</span>
          </div>
        </div>
      )}

      {/* Animated demos */}
      {step.demo === 'advisor'          && <AdvisorDemo />}
      {step.demo === 'kairos'           && <KairosDemo />}
      {step.demo === 'loop'             && <LoopDemo />}
      {step.demo === 'stream'           && <StreamDemo />}
      {step.demo === 'parallel-tools'   && <ParallelToolsDemo />}
      {step.demo === 'cache-cost'       && <CacheCostDemo />}
      {step.demo === 'hook-stop'        && <HookStopDemo />}
      {step.demo === 'permission-gate'  && <PermissionGateDemo />}
      {step.demo === 'compaction'       && <CompactionDemo />}
      {step.demo === 'mailbox-route'    && <MailboxRouteDemo />}
      {step.demo === 'memory-layers'    && <MemoryLayersDemo />}

      {/* Footer */}
      {step.footer && (
        <div className="story-card__footer">{step.footer}</div>
      )}
    </div>
  );
}
