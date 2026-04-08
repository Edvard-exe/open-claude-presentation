import { useEffect, useRef } from 'react';

interface Block {
  x: number;
  width: number;
  height: number;
  targetHeight: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface Props {
  width: number;
  height: number;
  color: string;
}

export function CompactorBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const blocksRef = useRef<Block[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const sweepRef = useRef(-0.1);
  const cycleRef = useRef(0);

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

    const blockCount = 10;
    const blockGap = 4;
    const baseY = height * 0.35;
    const maxBlockH = height * 0.35;
    const blockW = (width - 40 - blockGap * (blockCount - 1)) / blockCount;
    const particles = particlesRef.current;

    function resetBlocks() {
      blocksRef.current = Array.from({ length: blockCount }, (_, i) => {
        const h = maxBlockH * (0.3 + Math.random() * 0.7);
        return {
          x: 20 + i * (blockW + blockGap),
          width: blockW,
          height: h,
          targetHeight: h,
          opacity: 0.2,
        };
      });
    }

    if (blocksRef.current.length === 0) resetBlocks();
    const blocks = blocksRef.current;

    function spawnParticles(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        particles.push({
          x,
          y: y + Math.random() * 20,
          vx: 0.5 + Math.random() * 1.5,
          vy: (Math.random() - 0.5) * 2,
          life: 40 + Math.random() * 30,
          size: 1 + Math.random() * 1.5,
        });
      }
    }

    function animate(_time: number) {
      ctx!.clearRect(0, 0, width, height);

      const sweep = sweepRef.current;

      // Draw blocks
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const blockCenter = (block.x + block.width / 2) / width;

        // Compress blocks that the sweep has passed
        if (sweep > blockCenter && block.targetHeight > maxBlockH * 0.1) {
          block.targetHeight = maxBlockH * 0.08;
          spawnParticles(block.x + block.width, baseY + maxBlockH - block.height, 3);
        }

        // Animate toward target
        block.height += (block.targetHeight - block.height) * 0.05;

        const blockY = baseY + maxBlockH - block.height;
        const isCompressed = block.targetHeight < maxBlockH * 0.15;

        // Block fill
        const alpha = isCompressed ? 0.08 : 0.15;
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx!.fillRect(block.x, blockY, block.width, block.height);

        // Block border
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${isCompressed ? 0.1 : 0.2})`;
        ctx!.lineWidth = 0.5;
        ctx!.strokeRect(block.x, blockY, block.width, block.height);

        // Text lines inside tall blocks
        if (!isCompressed && block.height > 20) {
          const lineCount = Math.floor(block.height / 8);
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
          for (let l = 0; l < Math.min(lineCount, 6); l++) {
            const lw = block.width * (0.4 + Math.random() * 0.4);
            ctx!.fillRect(block.x + 3, blockY + 4 + l * 8, lw, 3);
          }
        }
      }

      // Draw summary block (appears after sweep passes ~60%)
      if (sweep > 0.6) {
        const summaryAlpha = Math.min(1, (sweep - 0.6) * 3) * 0.25;
        const summaryX = width * 0.35;
        const summaryW = width * 0.3;
        const summaryH = maxBlockH * 0.25;
        const summaryY = baseY + maxBlockH - summaryH;

        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${summaryAlpha})`;
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${summaryAlpha * 1.5})`;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.roundRect(summaryX, summaryY, summaryW, summaryH, 4);
        ctx!.fill();
        ctx!.stroke();

        // Summary label
        ctx!.font = '8px SF Mono, Menlo, monospace';
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${summaryAlpha * 2})`;
        ctx!.textAlign = 'center';
        ctx!.fillText('summary', summaryX + summaryW / 2, summaryY + summaryH / 2 + 3);
      }

      // Sweep line
      if (sweep >= 0 && sweep <= 1) {
        const sx = 20 + sweep * (width - 40);
        const grad = ctx!.createLinearGradient(sx - 10, 0, sx + 10, 0);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx!.beginPath();
        ctx!.moveTo(sx, baseY - 10);
        ctx!.lineTo(sx, baseY + maxBlockH + 10);
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 2;
        ctx!.stroke();
      }

      // Update sweep
      sweepRef.current += 0.002;
      if (sweepRef.current > 1.3) {
        cycleRef.current++;
        sweepRef.current = -0.3;
        resetBlocks();
        particles.length = 0;
      }

      // Draw and update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03; // gravity
        p.life--;

        const pAlpha = Math.min(1, p.life / 20) * 0.3;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${pAlpha})`;
        ctx!.fill();

        if (p.life <= 0) particles.splice(i, 1);
      }

      // Token counter
      const totalTokens = blocks.reduce((s, b) => s + b.height, 0);
      const maxTokens = maxBlockH * blockCount;
      const pct = Math.round((totalTokens / maxTokens) * 100);
      ctx!.font = '8px SF Mono, Menlo, monospace';
      ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.12)`;
      ctx!.textAlign = 'right';
      ctx!.fillText(`${pct}% context`, width - 20, baseY - 16);

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
