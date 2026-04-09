export function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero">
      <h1 className="hero__title">Claude Code Internals</h1>
      <p className="hero__subtitle">
        What actually happens when you type a message into Claude Code? The agent loop, 53+ tools,
        multi-agent orchestration, and unreleased features — mapped straight from the source.
      </p>

      <div className="hero__stats">
        {([
          ['1,900+', 'Files'],
          ['519K+', 'Lines of Code'],
          ['53+', 'Tools'],
          ['27', 'Hook Events'],
          ['23', 'Security Checks'],
        ] as const).map(([value, label]) => (
          <div className="hero__stat" key={label}>
            <div className="hero__stat-value">{value}</div>
            <div className="hero__stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="hero__cta" onClick={onStart}>
        Start exploring
        <span>↓</span>
      </div>
    </section>
  );
}
