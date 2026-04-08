interface TerminalMockupProps {
  title?: string;
  children: React.ReactNode;
}

export function TerminalMockup({ title = 'claude-code', children }: TerminalMockupProps) {
  return (
    <div className="terminal">
      <div className="terminal__bar">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">{title}</span>
      </div>
      <div className="terminal__body">{children}</div>
    </div>
  );
}
