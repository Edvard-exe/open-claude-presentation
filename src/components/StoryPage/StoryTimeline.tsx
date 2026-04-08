import { useState, useEffect, useRef } from 'react';

export interface StoryStepData {
  label: string;
  title: string;
  source?: string;
  description: string;
  footer?: string;
  content?: React.ReactNode;
}

interface StoryTimelineProps {
  steps: StoryStepData[];
  color: string;
  activeStep: number;
  onStepChange: (i: number) => void;
}

export function StoryTimeline({ steps, color, activeStep, onStepChange }: StoryTimelineProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      onStepChange(activeStep + 1);
    }, 4000 / speed);
    return () => clearInterval(timerRef.current);
  }, [playing, activeStep, speed, onStepChange]);

  // Stop playing when reaching last step
  useEffect(() => {
    if (activeStep >= steps.length - 1) setPlaying(false);
  }, [activeStep, steps.length]);

  const cssVar = { '--section-color': color } as React.CSSProperties;

  return (
    <div style={cssVar}>
      {/* Step circles */}
      <div className="timeline">
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div className="timeline__step" onClick={() => onStepChange(i)}>
              <div
                className={`timeline__circle ${i === activeStep ? 'timeline__circle--active' : i < activeStep ? 'timeline__circle--visited' : ''}`}
              >
                {i + 1}
              </div>
              <div className={`timeline__label ${i === activeStep ? 'timeline__label--active' : ''}`}>
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className={`timeline__line ${i < activeStep ? 'timeline__line--active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="timeline__controls">
        <button className="timeline__btn" onClick={() => onStepChange(Math.max(0, activeStep - 1))}>‹</button>
        <button
          className={`timeline__btn ${playing ? '' : 'timeline__btn--play'}`}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <button className="timeline__btn" onClick={() => onStepChange(Math.min(steps.length - 1, activeStep + 1))}>›</button>
        <span className="timeline__counter">{activeStep + 1} / {steps.length}</span>
        <div className="timeline__speed">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              className={`timeline__speed-btn ${speed === s ? 'timeline__speed-btn--active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Active step content */}
      {steps[activeStep] && (
        <div className="step-card">
          <div className="step-card__header">
            <div>
              <span className="step-card__number">{activeStep + 1}</span>
              <span className="step-card__title">{steps[activeStep].title}</span>
            </div>
            {steps[activeStep].source && (() => {
              const src = steps[activeStep].source!;
              const m = src.match(/^(.+?):(\d+)$/);
              const filePath = m ? m[1] : src;
              const line = m ? m[2] : undefined;
              const cursorHref = `cursor://file/Users/illiafilipas/code/collection-claude-code-source-code/claude-code-source-code/${filePath}${line ? `:${line}:1` : ''}`;
              return (
                <a className="step-card__source" href={cursorHref} onClick={(e) => e.stopPropagation()} title="Open in Cursor" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {src}
                </a>
              );
            })()}
          </div>
          <div className="step-card__description">{steps[activeStep].description}</div>
          {steps[activeStep].content && (
            <div className="step-card__content">{steps[activeStep].content}</div>
          )}
          {steps[activeStep].footer && (
            <div className="step-card__footer" dangerouslySetInnerHTML={{ __html: steps[activeStep].footer! }} />
          )}
        </div>
      )}
    </div>
  );
}
