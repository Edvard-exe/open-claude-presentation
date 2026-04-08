import { useEffect, useRef } from 'react';

interface HookEvent {
  y: number;
  label: string;
  phase: number;
  active: boolean;
  forks: Fork[];
}

interface Fork {
  progress: number;
  angle: number;
  length: number;
  type: 'shell' | 'prompt' | 'http';
}

interface Props {
  width: number;
  height: number;
  color: string;
}

export function HooksBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const eventsRef = useRef<HookEvent[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    const pipelineX = width * 0.3;
    const eventLabels = ['PreTool', 'PostTool', 'Stop', 'Session', 'Compact', 'Notify'];
    const spacing = (height - 60) / (eventLabels.length + 1);

    // Initialize events
    if (eventsRef.current.length === 0) {
      eventsRef.current = eventLabels.map((label, i) => ({
        y: 30 + spacing * (i + 1),
        label,
        phase: Math.random() * Math.PI * 2,
        active: false,
        forks: [],
      }));
    }

    const events = eventsRef.current;
    let triggerTimer = 0;

    function triggerEvent(ev: HookEvent) {
      ev.active = true;
      ev.forks = [];
      const forkCount = 1 + Math.floor(Math.random() * 3);
      const types: Fork['type'][] = ['shell', 'prompt', 'http'];
      for (let f = 0; f < forkCount; f++) {
        ev.forks.push({
          progress: 0,
          angle: -0.4 + (f * 0.4),
          length: 30 + Math.random() * 40,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // Draw main pipeline
      ctx!.beginPath();
      ctx!.moveTo(pipelineX, 20);
      ctx!.lineTo(pipelineX, height - 20);
      ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.1)`;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // Traveling signal down pipeline
      const signalY = ((time * 0.03) % (height + 40)) - 20;
      const sigGrad = ctx!.createLinearGradient(pipelineX, signalY - 20, pipelineX, signalY + 20);
      sigGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
      sigGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.25)`);
      sigGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx!.beginPath();
      ctx!.moveTo(pipelineX, signalY - 20);
      ctx!.lineTo(pipelineX, signalY + 20);
      ctx!.strokeStyle = sigGrad;
      ctx!.lineWidth = 3;
      ctx!.stroke();

      // Trigger events periodically
      triggerTimer++;
      if (triggerTimer > 40) {
        triggerTimer = 0;
        const candidates = events.filter(e => !e.active);
        if (candidates.length > 0) {
          triggerEvent(candidates[Math.floor(Math.random() * candidates.length)]);
        }
      }

      // Draw events
      for (const ev of events) {
        const basePulse = Math.sin(time * 0.003 + ev.phase) * 0.2 + 0.8;
        const isActive = ev.active;

        // Event dot
        const dotRadius = isActive ? 6 : 4;
        const dotAlpha = isActive ? 0.6 : 0.15 * basePulse;

        // Active glow
        if (isActive) {
          ctx!.beginPath();
          ctx!.arc(pipelineX, ev.y, 14, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
          ctx!.fill();
        }

        ctx!.beginPath();
        ctx!.arc(pipelineX, ev.y, dotRadius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${dotAlpha})`;
        ctx!.fill();

        // Lightning bolt for active events
        if (isActive) {
          ctx!.save();
          ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          const bx = pipelineX - 12;
          const by = ev.y - 5;
          ctx!.moveTo(bx + 4, by);
          ctx!.lineTo(bx + 1, by + 5);
          ctx!.lineTo(bx + 4, by + 5);
          ctx!.lineTo(bx + 1, by + 10);
          ctx!.stroke();
          ctx!.restore();
        }

        // Label
        ctx!.font = '7px SF Mono, Menlo, monospace';
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${isActive ? 0.3 : 0.1})`;
        ctx!.textAlign = 'right';
        ctx!.fillText(ev.label, pipelineX - 18, ev.y + 3);

        // Draw forks (executor lines)
        if (isActive) {
          let allDone = true;
          for (const fork of ev.forks) {
            fork.progress += 0.025;
            if (fork.progress < 1) allDone = false;

            const forkAlpha = fork.progress < 0.8 ? 0.35 : 0.35 * (1 - (fork.progress - 0.8) * 5);
            const endX = pipelineX + Math.cos(fork.angle) * fork.length * Math.min(fork.progress * 1.5, 1);
            const endY = ev.y + Math.sin(fork.angle) * fork.length * Math.min(fork.progress * 1.5, 1);

            // Fork line
            ctx!.beginPath();
            ctx!.moveTo(pipelineX + 8, ev.y);
            ctx!.lineTo(endX, endY);
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, forkAlpha)})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();

            // Executor type indicator
            if (fork.progress < 0.9) {
              ctx!.beginPath();
              ctx!.arc(endX, endY, 3, 0, Math.PI * 2);
              ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, forkAlpha)})`;
              ctx!.fill();

              // Type label
              ctx!.font = '6px SF Mono, Menlo, monospace';
              ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, forkAlpha * 0.7)})`;
              ctx!.textAlign = 'left';
              ctx!.fillText(fork.type, endX + 6, endY + 2);
            }
          }
          if (allDone) ev.active = false;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
}
