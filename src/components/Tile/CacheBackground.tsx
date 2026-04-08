import { useEffect, useRef } from 'react';

interface Block {
  y: number;
  width: number;
  height: number;
  cached: boolean;
  shimmerTime: number;
  invalidateTime: number;
}

interface Particle {
  x: number;
  y: number;
  speed: number;
  size: number;
  blockIndex: number;
}

interface Props {
  width: number;
  height: number;
  color: string;
}

export function CacheBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const blocksRef = useRef<Block[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const cr = parseInt(color.slice(1, 3), 16);
    const cg = parseInt(color.slice(3, 5), 16);
    const cb = parseInt(color.slice(5, 7), 16);

    const padX = 24;
    const padY = 28;
    const blockGap = 6;
    const blockCount = 7;
    const usableH = height - padY * 2;
    const blockH = (usableH - blockGap * (blockCount - 1)) / blockCount;
    const cachedCount = 5;

    if (blocksRef.current.length === 0) {
      const maxW = width - padX * 2;
      blocksRef.current = Array.from({ length: blockCount }, (_, i) => ({
        y: padY + i * (blockH + blockGap),
        width: maxW * (0.55 + Math.random() * 0.45),
        height: blockH,
        cached: i < cachedCount,
        shimmerTime: 0,
        invalidateTime: 0,
      }));
    }

    const blocks = blocksRef.current;
    const particles = particlesRef.current;
    const breakpointY = padY + cachedCount * (blockH + blockGap) - blockGap / 2;

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // --- shimmer / invalidation triggers ---
      if (Math.random() < 0.006) {
        const cached = blocks.filter((b) => b.cached);
        if (cached.length) cached[Math.floor(Math.random() * cached.length)].shimmerTime = time;
      }
      if (Math.random() < 0.0015) {
        const targets = blocks.filter((b) => b.cached && blocks.indexOf(b) >= 3);
        if (targets.length) targets[Math.floor(Math.random() * targets.length)].invalidateTime = time;
      }

      // --- spawn particles ---
      if (Math.random() < 0.025 && particles.length < 12) {
        const bi = Math.floor(Math.random() * cachedCount);
        const blk = blocks[bi];
        particles.push({
          x: padX,
          y: blk.y + blk.height / 2,
          speed: 0.4 + Math.random() * 0.5,
          size: 1.2 + Math.random() * 0.8,
          blockIndex: bi,
        });
      }

      // --- draw blocks ---
      for (let i = 0; i < blocks.length; i++) {
        const blk = blocks[i];
        const isCached = blk.cached;

        // fill
        ctx!.beginPath();
        ctx!.roundRect(padX, blk.y, blk.width, blk.height, 4);
        ctx!.fillStyle = isCached
          ? `rgba(${cr}, ${cg}, ${cb}, 0.06)`
          : `rgba(160, 160, 160, 0.03)`;
        ctx!.fill();

        // border
        ctx!.beginPath();
        ctx!.roundRect(padX, blk.y, blk.width, blk.height, 4);
        ctx!.strokeStyle = isCached
          ? `rgba(${cr}, ${cg}, ${cb}, 0.12)`
          : `rgba(160, 160, 160, 0.06)`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();

        // shimmer sweep
        const shimmerAge = time - blk.shimmerTime;
        if (blk.shimmerTime > 0 && shimmerAge < 1400) {
          const p = shimmerAge / 1400;
          const sx = padX + blk.width * p;
          const grad = ctx!.createLinearGradient(sx - 50, 0, sx + 50, 0);
          grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0)`);
          grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${0.12 * (1 - p)})`);
          grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
          ctx!.save();
          ctx!.beginPath();
          ctx!.roundRect(padX, blk.y, blk.width, blk.height, 4);
          ctx!.clip();
          ctx!.fillStyle = grad;
          ctx!.fillRect(padX, blk.y, blk.width, blk.height);
          ctx!.restore();
        }

        // invalidation flash
        const invAge = time - blk.invalidateTime;
        if (blk.invalidateTime > 0 && invAge < 700) {
          const f = Math.sin((invAge / 700) * Math.PI);
          ctx!.save();
          ctx!.beginPath();
          ctx!.roundRect(padX, blk.y, blk.width, blk.height, 4);
          ctx!.clip();
          ctx!.fillStyle = `rgba(239, 68, 68, ${f * 0.08})`;
          ctx!.fillRect(padX, blk.y, blk.width, blk.height);
          ctx!.restore();
          ctx!.strokeStyle = `rgba(239, 68, 68, ${f * 0.2})`;
          ctx!.lineWidth = 0.8;
          ctx!.beginPath();
          ctx!.roundRect(padX, blk.y, blk.width, blk.height, 4);
          ctx!.stroke();
        }
      }

      // --- breakpoint line ---
      const pulse = Math.sin(time * 0.0025) * 0.1 + 0.35;
      ctx!.setLineDash([6, 4]);
      ctx!.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${pulse})`;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(padX, breakpointY);
      ctx!.lineTo(width - padX, breakpointY);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // soft glow along breakpoint
      const bpGrad = ctx!.createLinearGradient(0, breakpointY - 5, 0, breakpointY + 5);
      bpGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      bpGrad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${0.03 * pulse})`);
      bpGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx!.fillStyle = bpGrad;
      ctx!.fillRect(padX, breakpointY - 5, width - padX * 2, 10);

      // --- draw particles ---
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.speed;
        const blk = blocks[pt.blockIndex];

        if (pt.x > padX + blk.width + 5) {
          particles.splice(i, 1);
          continue;
        }

        if (pt.x >= padX && pt.x <= padX + blk.width) {
          const edgeFade = Math.min(
            (pt.x - padX) / 15,
            (padX + blk.width - pt.x) / 15,
            1,
          );
          const a = edgeFade * 0.5;

          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, pt.size * 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * 0.12})`;
          ctx!.fill();

          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a})`;
          ctx!.fill();
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
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
