import { useState } from 'react';

interface SectionProps {
  number: number;
  title: string;
  subtitle: string;
  color: string;
  chips?: string[];
  children: React.ReactNode;
  id?: string;
}

export function Section({ number, title, subtitle, color, chips = [], children, id }: SectionProps) {
  const [expanded, setExpanded] = useState(false);
  const cssVar = { '--section-color': color } as React.CSSProperties;

  return (
    <div className="section" id={id} style={cssVar}>
      <div
        className={`section__header ${expanded ? 'section__header--expanded' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="section__number">{String(number).padStart(2, '0')}</div>
        <div className="section__info">
          <div className="section__title">{title}</div>
          <div className="section__subtitle">{subtitle}</div>
        </div>
        <div className="section__chips">
          {chips.map((c) => (
            <span className="section__chip" key={c}>{c}</span>
          ))}
        </div>
        <span className={`section__arrow ${expanded ? 'section__arrow--open' : ''}`}>▾</span>
      </div>

      {expanded && (
        <div className="section__body" style={{ animation: 'fadeSlideIn 0.3s ease-out' }}>
          {children}
        </div>
      )}
    </div>
  );
}
