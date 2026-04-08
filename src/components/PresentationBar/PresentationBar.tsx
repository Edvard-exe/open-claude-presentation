import { useBoardStore } from '../../store/boardStore';
import { ANIMATION_STEPS } from '../../data/animationSteps';
import './PresentationBar.css';

export function PresentationBar() {
  const active = useBoardStore((s) => s.presentationActive);
  const stepIndex = useBoardStore((s) => s.presentationStepIndex);
  const transitioning = useBoardStore((s) => s.presentationTransitioning);
  const next = useBoardStore((s) => s.presentationNext);
  const prev = useBoardStore((s) => s.presentationPrev);
  const stop = useBoardStore((s) => s.stopPresentation);
  const goToStep = useBoardStore((s) => s.goToStep);

  if (!active || stepIndex < 0) return null;

  const step = ANIMATION_STEPS[stepIndex];
  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === ANIMATION_STEPS.length - 1;

  return (
    <div className="presentation-bar">
      {/* Stop */}
      <button
        className="presentation-bar__btn presentation-bar__btn--stop"
        onClick={stop}
        title="Stop presentation (Esc)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="10" height="10" rx="1.5" fill="currentColor" />
        </svg>
      </button>

      <div className="presentation-bar__divider" />

      {/* Prev */}
      <button
        className="presentation-bar__btn"
        onClick={prev}
        disabled={isFirst || transitioning}
        title="Previous step (Left arrow)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Next */}
      <button
        className="presentation-bar__btn presentation-bar__btn--next"
        onClick={next}
        disabled={isLast || transitioning}
        title="Next step (Right arrow / Space)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="presentation-bar__divider" />

      {/* Step info */}
      <div className="presentation-bar__info">
        <span className="presentation-bar__step-num">
          {stepIndex + 1}/{ANIMATION_STEPS.length}
        </span>
        <span className="presentation-bar__label">{step.label}</span>
        <span className="presentation-bar__code-ref">{step.codeRef}</span>
      </div>

      {/* Progress dots */}
      <div className="presentation-bar__dots">
        {ANIMATION_STEPS.map((_, i) => (
          <button
            key={i}
            className={`presentation-bar__dot ${i === stepIndex ? 'presentation-bar__dot--active' : ''} ${i < stepIndex ? 'presentation-bar__dot--visited' : ''}`}
            onClick={() => goToStep(i)}
            title={ANIMATION_STEPS[i].label}
          />
        ))}
      </div>
    </div>
  );
}
