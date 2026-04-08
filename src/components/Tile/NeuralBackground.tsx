import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Props {
  width: number;
  height: number;
  color: string;
}

export function NeuralBackground({ width, height, color }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Parse the hex color to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Constrain nodes to the white space between content text and the links section
    const nodeCount = 12;
    const bandTop = 170;  // below the content text
    const bandBottom = Math.min(height - 10, 195); // well above /src/query.ts
    const bandHeight = bandBottom - bandTop;
    if (nodesRef.current.length === 0) {
      nodesRef.current = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width,
        y: bandTop + Math.random() * bandHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
    }

    const nodes = nodesRef.current;
    const connectionDistance = 90;

    function animate(time: number) {
      ctx!.clearRect(0, 0, width, height);

      // Update positions — keep nodes below safe zone
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce within the header-to-content band
        if (node.x < 10 || node.x > width - 10) node.vx *= -1;
        if (node.y < bandTop || node.y > bandBottom) node.vy *= -1;

        node.x = Math.max(10, Math.min(width - 10, node.x));
        node.y = Math.max(bandTop, Math.min(bandBottom, node.y));
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15;
            // Pulsing signal along connections
            const pulse = Math.sin(time * 0.002 + nodes[i].pulsePhase) * 0.5 + 0.5;
            const finalAlpha = alpha * (0.5 + pulse * 0.5);

            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(nodes[j].x, nodes[j].y);
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();

            // Draw a traveling signal dot on some connections
            if (alpha > 0.1) {
              const signalPos = (Math.sin(time * 0.003 + i * 0.7) * 0.5 + 0.5);
              const sx = nodes[i].x + (nodes[j].x - nodes[i].x) * signalPos;
              const sy = nodes[i].y + (nodes[j].y - nodes[i].y) * signalPos;
              ctx!.beginPath();
              ctx!.arc(sx, sy, 1.5, 0, Math.PI * 2);
              ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha * 2})`;
              ctx!.fill();
            }
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = Math.sin(time * 0.003 + node.pulsePhase) * 0.5 + 0.5;
        const currentRadius = node.radius * (0.8 + pulse * 0.4);

        // Glow
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, currentRadius * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.03 + pulse * 0.03})`;
        ctx!.fill();

        // Core
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + pulse * 0.2})`;
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
