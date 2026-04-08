import { useEffect, useRef } from 'react';

interface Orbit {
  angle: number;
  speed: number;
  radius: number;
  size: number;
  phase: number;
  trailLength: number;
}

interface Props {
  width: number;
  height: number;
  color: string;
}

export function OrbitalBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const orbitsRef = useRef<Orbit[]>([]);

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

    const cx = width / 2;
    const cy = height / 2;

    // Create orbiting agents
    if (orbitsRef.current.length === 0) {
      orbitsRef.current = [
        { angle: 0, speed: 0.008, radius: 50, size: 4, phase: 0, trailLength: 0.8 },
        { angle: Math.PI * 0.66, speed: 0.006, radius: 70, size: 3.5, phase: 1, trailLength: 0.6 },
        { angle: Math.PI * 1.33, speed: 0.01, radius: 35, size: 3, phase: 2, trailLength: 0.7 },
        // Outer slower ones
        { angle: Math.PI * 0.3, speed: 0.004, radius: 90, size: 2.5, phase: 3, trailLength: 0.5 },
        { angle: Math.PI * 1.1, speed: 0.005, radius: 85, size: 2, phase: 4, trailLength: 0.4 },
      ];
    }

    const orbits = orbitsRef.current;

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // Draw orbit paths (subtle rings)
      const radii = [35, 50, 70, 90];
      for (const rad of radii) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Draw central hub
      const hubPulse = Math.sin(time * 0.002) * 0.3 + 0.7;

      // Hub glow
      const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 20);
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.15 * hubPulse})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx!.beginPath();
      ctx!.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx!.fillStyle = gradient;
      ctx!.fill();

      // Hub core
      ctx!.beginPath();
      ctx!.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + hubPulse * 0.2})`;
      ctx!.fill();

      // Update and draw orbiting agents
      for (const orbit of orbits) {
        orbit.angle += orbit.speed;

        const ox = cx + Math.cos(orbit.angle) * orbit.radius;
        const oy = cy + Math.sin(orbit.angle) * orbit.radius;

        // Trail
        const trailSteps = 12;
        for (let i = trailSteps; i >= 0; i--) {
          const trailAngle = orbit.angle - (i * orbit.trailLength / trailSteps) * orbit.speed * 60;
          const tx = cx + Math.cos(trailAngle) * orbit.radius;
          const ty = cy + Math.sin(trailAngle) * orbit.radius;
          const alpha = (1 - i / trailSteps) * 0.15;
          const trailSize = orbit.size * (1 - i / trailSteps * 0.6);
          ctx!.beginPath();
          ctx!.arc(tx, ty, trailSize, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx!.fill();
        }

        // Connection line to hub (pulsing)
        const connAlpha = 0.05 + Math.sin(time * 0.003 + orbit.phase) * 0.03;
        ctx!.beginPath();
        ctx!.moveTo(cx, cy);
        ctx!.lineTo(ox, oy);
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${connAlpha})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();

        // Agent dot
        const agentPulse = Math.sin(time * 0.004 + orbit.phase * 2) * 0.3 + 0.7;
        ctx!.beginPath();
        ctx!.arc(ox, oy, orbit.size * agentPulse, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 + agentPulse * 0.3})`;
        ctx!.fill();

        // Agent glow
        ctx!.beginPath();
        ctx!.arc(ox, oy, orbit.size * 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.04 * agentPulse})`;
        ctx!.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
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
