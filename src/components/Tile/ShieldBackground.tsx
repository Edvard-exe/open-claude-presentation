import { useEffect, useRef } from 'react';

interface Props {
  width: number;
  height: number;
  color: string;
}

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  allowed: boolean; // true = checkmark particle, false = blocked particle
  life: number;
  maxLife: number;
  fadeIn: number;
}

export function ShieldBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef(0);

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
    const shieldRadius = Math.min(width, height) * 0.28;

    const particles = particlesRef.current;

    function spawnParticle() {
      const angle = Math.random() * Math.PI * 2;
      const allowed = Math.random() > 0.25; // 75% allowed, 25% blocked
      particles.push({
        angle,
        radius: shieldRadius + 40 + Math.random() * 30,
        speed: 0.3 + Math.random() * 0.4,
        size: 2 + Math.random() * 2,
        allowed,
        life: 0,
        maxLife: 120 + Math.random() * 80,
        fadeIn: 0,
      });
    }

    // Seed initial particles
    if (particles.length === 0) {
      for (let i = 0; i < 8; i++) {
        const p: Particle = {
          angle: Math.random() * Math.PI * 2,
          radius: shieldRadius + Math.random() * 40,
          speed: 0.3 + Math.random() * 0.4,
          size: 2 + Math.random() * 2,
          allowed: Math.random() > 0.25,
          life: Math.random() * 100,
          maxLife: 120 + Math.random() * 80,
          fadeIn: 1,
        };
        particles.push(p);
      }
    }

    function drawShield(time: number) {
      const pulse = Math.sin(time * 0.002) * 0.15 + 0.85;

      // Outer scanning ring
      const scanAngle = (time * 0.001) % (Math.PI * 2);
      ctx!.beginPath();
      ctx!.arc(cx, cy, shieldRadius + 8, scanAngle, scanAngle + Math.PI * 0.4);
      ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * pulse})`;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // Second scanning ring (opposite)
      ctx!.beginPath();
      ctx!.arc(cx, cy, shieldRadius + 8, scanAngle + Math.PI, scanAngle + Math.PI + Math.PI * 0.3);
      ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.2 * pulse})`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Shield circle
      ctx!.beginPath();
      ctx!.arc(cx, cy, shieldRadius, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.15 * pulse})`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Shield fill
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, shieldRadius);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.06 * pulse})`);
      grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${0.03 * pulse})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx!.fillStyle = grad;
      ctx!.fill();

      // Inner hexagonal grid pattern
      const hexSize = 16;
      ctx!.save();
      ctx!.globalAlpha = 0.04 * pulse;
      ctx!.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx!.lineWidth = 0.5;
      for (let hx = cx - shieldRadius; hx < cx + shieldRadius; hx += hexSize * 1.5) {
        for (let hy = cy - shieldRadius; hy < cy + shieldRadius; hy += hexSize * 1.73) {
          const offsetX = (Math.floor((hy - cy) / (hexSize * 1.73)) % 2) * hexSize * 0.75;
          const px = hx + offsetX;
          const py = hy;
          const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
          if (dist < shieldRadius - 5) {
            drawHexagon(ctx!, px, py, hexSize * 0.45);
          }
        }
      }
      ctx!.restore();

      // Shield icon in center
      ctx!.save();
      ctx!.globalAlpha = 0.12 * pulse;
      ctx!.fillStyle = `rgb(${r}, ${g}, ${b})`;
      // Simple shield shape
      ctx!.beginPath();
      ctx!.moveTo(cx, cy - 14);
      ctx!.lineTo(cx + 12, cy - 8);
      ctx!.lineTo(cx + 12, cy + 2);
      ctx!.quadraticCurveTo(cx + 10, cy + 12, cx, cy + 16);
      ctx!.quadraticCurveTo(cx - 10, cy + 12, cx - 12, cy + 2);
      ctx!.lineTo(cx - 12, cy - 8);
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    function drawHexagon(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + size * Math.cos(a);
        const hy = y + size * Math.sin(a);
        if (i === 0) c.moveTo(hx, hy);
        else c.lineTo(hx, hy);
      }
      c.closePath();
      c.stroke();
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      drawShield(time);

      // Spawn new particles
      spawnTimerRef.current++;
      if (spawnTimerRef.current > 25) {
        spawnTimerRef.current = 0;
        if (particles.length < 15) spawnParticle();
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.fadeIn = Math.min(1, p.fadeIn + 0.05);

        // Move toward shield center
        p.radius -= p.speed;

        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius;

        // Check if reached shield boundary
        if (p.radius <= shieldRadius) {
          if (p.allowed) {
            // Pass through — continue shrinking and fade out
            p.radius -= p.speed * 0.5;
            const fadeOut = Math.max(0, p.radius / shieldRadius);
            ctx!.beginPath();
            ctx!.arc(px, py, p.size * 0.8, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * fadeOut * p.fadeIn})`;
            ctx!.fill();

            if (p.radius < shieldRadius * 0.3) {
              particles.splice(i, 1);
            }
          } else {
            // Blocked — flash and remove
            // Draw a brief red flash
            ctx!.beginPath();
            ctx!.arc(px, py, p.size * 3, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(239, 68, 68, ${0.3 * p.fadeIn})`;
            ctx!.fill();

            // Draw X
            ctx!.save();
            ctx!.strokeStyle = `rgba(239, 68, 68, ${0.5 * p.fadeIn})`;
            ctx!.lineWidth = 1.5;
            ctx!.beginPath();
            ctx!.moveTo(px - 3, py - 3);
            ctx!.lineTo(px + 3, py + 3);
            ctx!.moveTo(px + 3, py - 3);
            ctx!.lineTo(px - 3, py + 3);
            ctx!.stroke();
            ctx!.restore();

            particles.splice(i, 1);
            continue;
          }
        } else {
          // Approaching — draw as dot with trail
          const alpha = p.fadeIn * (p.life < 10 ? p.life / 10 : 1) * 0.5;

          // Trail
          const trailLen = 12;
          const tx = cx + Math.cos(p.angle) * (p.radius + trailLen);
          const ty = cy + Math.sin(p.angle) * (p.radius + trailLen);
          const trailGrad = ctx!.createLinearGradient(tx, ty, px, py);
          trailGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
          trailGrad.addColorStop(1, p.allowed
            ? `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`
            : `rgba(239, 68, 68, ${alpha * 0.6})`
          );
          ctx!.beginPath();
          ctx!.moveTo(tx, ty);
          ctx!.lineTo(px, py);
          ctx!.strokeStyle = trailGrad;
          ctx!.lineWidth = p.size * 0.6;
          ctx!.stroke();

          // Dot
          ctx!.beginPath();
          ctx!.arc(px, py, p.size, 0, Math.PI * 2);
          ctx!.fillStyle = p.allowed
            ? `rgba(${r}, ${g}, ${b}, ${alpha})`
            : `rgba(239, 68, 68, ${alpha})`;
          ctx!.fill();
        }

        // Remove expired
        if (p.life > p.maxLife) {
          particles.splice(i, 1);
        }
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
