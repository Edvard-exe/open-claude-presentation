import { useState, useEffect } from 'react';
import './AdvisorDemo.css';

type Phase =
  | 'idle'
  | 'opus-thinking'
  | 'opus-drafting'
  | 'advisor-call'
  | 'advisor-reviewing'
  | 'encrypted'
  | 'opus-reading'
  | 'opus-final'
  | 'done';

const DRAFT = 'I\'ll delete the old auth middleware and replace it with the new one. Let me start by removing src/middleware/auth.ts and then—';
const FINAL = 'Before touching auth.ts, let me read the existing middleware to understand what it exports. Then I\'ll check all import sites, create the replacement, migrate each site, and only delete the old file last. This way nothing breaks mid-refactor.';

function usePhaseLoop() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [draftText, setDraftText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [advisorText, setAdvisorText] = useState('');

  useEffect(() => {
    let cancelled = false;
    const go = async () => {
      const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
      const typeOut = async (target: string, setter: (s: string) => void, ms = 60) => {
        for (let i = 0; i <= target.length; i++) {
          if (cancelled) return;
          setter(target.slice(0, i));
          await delay(ms);
        }
      };

      while (!cancelled) {
        setPhase('idle'); setDraftText(''); setFinalText(''); setAdvisorText('');
        await delay(1600);

        setPhase('opus-thinking'); await delay(2800);
        setPhase('opus-drafting');
        await typeOut(DRAFT, setDraftText, 44);
        await delay(600);

        setPhase('advisor-call'); await delay(1400);
        setPhase('advisor-reviewing');
        await typeOut('⚠ High-risk destructive action detected. Recommend: read first, then migrate import sites, then delete. Do NOT delete before confirming zero usages.', setAdvisorText, 36);
        await delay(1200);

        setPhase('encrypted'); await delay(2000);
        setPhase('opus-reading'); await delay(2000);
        setPhase('opus-final');
        await typeOut(FINAL, setFinalText, 40);
        await delay(1600);

        setPhase('done'); await delay(4400);
      }
    };
    go();
    return () => { cancelled = true; };
  }, []);

  return { phase, draftText, finalText, advisorText };
}

export function AdvisorDemo() {
  const { phase, draftText, finalText, advisorText } = usePhaseLoop();

  const isVisible = (p: Phase) => {
    const order: Phase[] = ['idle','opus-thinking','opus-drafting','advisor-call','advisor-reviewing','encrypted','opus-reading','opus-final','done'];
    return order.indexOf(phase) >= order.indexOf(p);
  };

  return (
    <div className="ademo">
      <div className="ademo__labels">
        <div className="ademo__label ademo__label--opus">
          <div className="ademo__dot ademo__dot--opus" />
          Claude Opus
        </div>
        <div className="ademo__label ademo__label--api">Anthropic API</div>
        <div className="ademo__label ademo__label--haiku">
          <div className="ademo__dot ademo__dot--haiku" />
          Haiku Advisor
        </div>
      </div>

      <div className="ademo__lanes">
        {/* Opus lane */}
        <div className="ademo__lane ademo__lane--opus">
          {isVisible('opus-thinking') && (
            <div className={`ademo__bubble ademo__bubble--thinking ${phase === 'opus-thinking' ? 'ademo__bubble--active' : ''}`}>
              <div className="ademo__dots"><span /><span /><span /></div>
              <span>thinking…</span>
            </div>
          )}
          {isVisible('opus-drafting') && (
            <div className="ademo__bubble ademo__bubble--draft">
              {draftText}<span className="ademo__cursor" />
            </div>
          )}
          {isVisible('opus-reading') && (
            <div className="ademo__bubble ademo__bubble--reading">
              📨 reading advisor feedback…
            </div>
          )}
          {isVisible('opus-final') && (
            <div className="ademo__bubble ademo__bubble--final">
              {finalText}<span className="ademo__cursor" />
            </div>
          )}
        </div>

        {/* API middle lane */}
        <div className="ademo__lane ademo__lane--api">
          {isVisible('advisor-call') && (
            <div className={`ademo__event ${isVisible('advisor-reviewing') ? 'ademo__event--done' : 'ademo__event--active'}`}>
              server_tool_use("advisor")
            </div>
          )}
          {isVisible('encrypted') && (
            <div className="ademo__encrypted">
              <div className="ademo__encrypted-label">advisor_redacted_result</div>
              <div className="ademo__encrypted-blocks">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="ademo__encrypted-block" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
              <div className="ademo__encrypted-sub">encrypted · client cannot read</div>
            </div>
          )}
          {isVisible('opus-reading') && (
            <div className="ademo__arrow ademo__arrow--back">← feedback injected</div>
          )}
        </div>

        {/* Haiku lane */}
        <div className="ademo__lane ademo__lane--haiku">
          {isVisible('advisor-reviewing') && (
            <div className="ademo__bubble ademo__bubble--haiku">
              <div className="ademo__haiku-header">Haiku · $0.001</div>
              {advisorText}<span className="ademo__cursor" />
            </div>
          )}
        </div>
      </div>

      <div className="ademo__cost">
        <span className="ademo__cost-haiku">Haiku: $0.001</span>
        <span className="ademo__cost-vs">vs</span>
        <span className="ademo__cost-opus">Opus mistake avoided: ~$0.15</span>
        <span className="ademo__cost-ratio">150× ROI</span>
      </div>
    </div>
  );
}
