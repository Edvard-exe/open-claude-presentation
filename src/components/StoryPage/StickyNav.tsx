import { useState, useEffect } from 'react';

interface StickyNavProps {
  sections: { id: string; label: string; color: string }[];
}

export function StickyNav({ sections }: StickyNavProps) {
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);

      // Find which section is in view
      for (const sec of [...sections].reverse()) {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveId(sec.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className={`sticky-nav ${visible ? 'sticky-nav--visible' : ''}`}>
      {sections.map((sec, i) => (
        <button
          key={sec.id}
          className={`sticky-nav__dot ${activeId === sec.id ? 'sticky-nav__dot--active' : ''}`}
          style={{ borderColor: activeId === sec.id ? sec.color : undefined, background: activeId === sec.id ? sec.color : undefined }}
          onClick={() => scrollTo(sec.id)}
          title={sec.label}
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );
}
