import { useEffect, useRef } from 'react';

interface Message {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  progress: number;
  channel: 'direct' | 'file';
  queued: boolean;
  draining: boolean;
  size: number;
}

interface Props {
  width: number;
  height: number;
  color: string;
}

export function MailboxBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const messagesRef = useRef<Message[]>([]);
  const spawnRef = useRef(0);
  const drainRef = useRef(0);

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

    // Two nodes: coordinator (left) and agent (right)
    const nodeA = { x: width * 0.2, y: height * 0.45 };
    const nodeB = { x: width * 0.8, y: height * 0.45 };
    const messages = messagesRef.current;

    function spawnMessage() {
      const toRight = Math.random() > 0.35;
      const channel: 'direct' | 'file' = Math.random() > 0.4 ? 'direct' : 'file';
      const from = toRight ? nodeA : nodeB;
      const to = toRight ? nodeB : nodeA;
      messages.push({
        x: from.x,
        y: from.y,
        targetX: to.x,
        targetY: to.y,
        speed: 0.004 + Math.random() * 0.003,
        progress: 0,
        channel,
        queued: false,
        draining: false,
        size: 3 + Math.random() * 2,
      });
    }

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // Draw connection channels
      // Direct channel (solid)
      ctx!.beginPath();
      ctx!.moveTo(nodeA.x, nodeA.y - 8);
      ctx!.lineTo(nodeB.x, nodeB.y - 8);
      ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
      ctx!.lineWidth = 2;
      ctx!.stroke();

      // File channel (dotted arc)
      ctx!.beginPath();
      ctx!.setLineDash([4, 4]);
      const arcMid = height * 0.65;
      ctx!.moveTo(nodeA.x, nodeA.y + 8);
      ctx!.quadraticCurveTo(width * 0.5, arcMid, nodeB.x, nodeB.y + 8);
      ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Draw nodes
      for (const node of [nodeA, nodeB]) {
        const pulse = Math.sin(time * 0.001 + (node === nodeA ? 0 : Math.PI)) * 0.3 + 0.7;

        // Glow
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 18, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.06 * pulse})`;
        ctx!.fill();

        // Ring
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 12, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.2 * pulse})`;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        // Core
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, 5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * pulse})`;
        ctx!.fill();
      }

      // Labels
      ctx!.font = '8px SF Mono, Menlo, monospace';
      ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
      ctx!.textAlign = 'center';
      ctx!.fillText('coordinator', nodeA.x, nodeA.y - 22);
      ctx!.fillText('agent', nodeB.x, nodeB.y - 22);

      // Spawn messages
      spawnRef.current++;
      if (spawnRef.current > 18 && messages.length < 12) {
        spawnRef.current = 0;
        spawnMessage();
      }

      // Periodic drain burst
      drainRef.current++;
      if (drainRef.current > 120) {
        drainRef.current = 0;
        for (const m of messages) {
          if (m.queued) m.draining = true;
        }
      }

      // Update and draw messages
      for (let i = messages.length - 1; i >= 0; i--) {
        const m = messages[i];

        if (m.draining) {
          m.progress += m.speed * 2;
        } else if (!m.queued) {
          m.progress += m.speed;
        }

        // Queue at ~75% progress
        if (m.progress > 0.75 && !m.queued && !m.draining) {
          m.queued = true;
        }

        // Calculate position
        let px: number, py: number;
        const t = Math.min(m.progress, 1);

        if (m.channel === 'direct') {
          px = m.x + (m.targetX - m.x) * t;
          py = (m.y - 8) + (m.targetY - 8 - (m.y - 8)) * t;
        } else {
          // Quadratic bezier along arc
          const cpY = height * 0.65;
          px = (1 - t) * (1 - t) * m.x + 2 * (1 - t) * t * (width * 0.5) + t * t * m.targetX;
          py = (1 - t) * (1 - t) * (m.y + 8) + 2 * (1 - t) * t * cpY + t * t * (m.targetY + 8);
        }

        // Draw message particle
        const alpha = m.queued && !m.draining
          ? 0.3 + Math.sin(time * 0.0025 + i) * 0.15
          : 0.4 * (1 - Math.max(0, t - 0.8) * 5);

        // Trail
        if (!m.queued || m.draining) {
          const trailT = Math.max(0, t - 0.05);
          let tx: number, ty: number;
          if (m.channel === 'direct') {
            tx = m.x + (m.targetX - m.x) * trailT;
            ty = (m.y - 8) + (m.targetY - 8 - (m.y - 8)) * trailT;
          } else {
            tx = (1 - trailT) * (1 - trailT) * m.x + 2 * (1 - trailT) * trailT * (width * 0.5) + trailT * trailT * m.targetX;
            ty = (1 - trailT) * (1 - trailT) * (m.y + 8) + 2 * (1 - trailT) * trailT * (height * 0.65) + trailT * trailT * (m.targetY + 8);
          }
          const grad = ctx!.createLinearGradient(tx, ty, px, py);
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
          ctx!.beginPath();
          ctx!.moveTo(tx, ty);
          ctx!.lineTo(px, py);
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = m.size * 0.5;
          ctx!.stroke();
        }

        // Envelope shape (small rectangle)
        ctx!.save();
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx!.fillRect(px - m.size, py - m.size * 0.7, m.size * 2, m.size * 1.4);
        // Flap
        ctx!.beginPath();
        ctx!.moveTo(px - m.size, py - m.size * 0.7);
        ctx!.lineTo(px, py);
        ctx!.lineTo(px + m.size, py - m.size * 0.7);
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`;
        ctx!.lineWidth = 0.5;
        ctx!.stroke();
        ctx!.restore();

        // Remove completed
        if (m.progress >= 1) {
          messages.splice(i, 1);
        }
      }

      // Draw queue count near nodeB
      const queuedCount = messages.filter(m => m.queued && !m.draining).length;
      if (queuedCount > 0) {
        ctx!.font = 'bold 9px SF Mono, Menlo, monospace';
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
        ctx!.textAlign = 'center';
        ctx!.fillText(`${queuedCount} queued`, nodeB.x, nodeB.y + 28);
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
