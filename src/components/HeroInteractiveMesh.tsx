import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
}

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface HeroInteractiveMeshProps {
  isDarkMode: boolean;
}

export default function HeroInteractiveMesh({ isDarkMode }: HeroInteractiveMeshProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: Point[] = [];
    let orbs: Orb[] = [];
    let width = 0;
    let height = 0;

    // Define colors relative to the theme
    const getColors = () => {
      if (isDarkMode) {
        return {
          particleColor: 'rgba(0, 223, 192, 0.4)',
          lineColor: 'rgba(0, 223, 192, 0.06)',
          hoverLineColor: 'rgba(139, 157, 255, 0.18)',
          orb1: 'rgba(0, 223, 192, 0.06)',
          orb2: 'rgba(139, 157, 255, 0.05)',
          orb3: 'rgba(78, 83, 86, 0.03)',
        };
      } else {
        return {
          particleColor: 'rgba(0, 107, 91, 0.25)',
          lineColor: 'rgba(0, 107, 91, 0.04)',
          hoverLineColor: 'rgba(68, 87, 179, 0.12)',
          orb1: 'rgba(0, 107, 91, 0.03)',
          orb2: 'rgba(68, 87, 179, 0.02)',
          orb3: 'rgba(195, 199, 203, 0.015)',
        };
      }
    };

    const colors = getColors();

    // Initialize particles and floating gradient orbs
    const init = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;

      // Clean, low-density premium count to maintain fast calculation & performance
      const particleDensity = Math.min(45, Math.floor((width * height) / 25000));
      points = [];
      for (let i = 0; i < particleDensity; i++) {
        const radius = Math.random() * 1.5 + 0.8;
        points.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius,
          baseRadius: radius,
        });
      }

      // 3 Massive soft background orbs
      orbs = [
        {
          x: width * 0.25,
          y: height * 0.35,
          vx: 0.06,
          vy: -0.04,
          radius: Math.min(width, height) * 0.3,
          color: colors.orb1,
        },
        {
          x: width * 0.75,
          y: height * 0.65,
          vx: -0.05,
          vy: 0.05,
          radius: Math.min(width, height) * 0.28,
          color: colors.orb2,
        },
        {
          x: width * 0.5,
          y: height * 0.15,
          vx: 0.03,
          vy: 0.03,
          radius: Math.min(width, height) * 0.22,
          color: colors.orb3,
        }
      ];
    };

    // Use ResizeObserver for perfect fluid container sizing
    const resizeObserver = new ResizeObserver(() => {
      init();
    });
    resizeObserver.observe(container);

    // Initial setup
    init();

    // Mouse interactive events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // We'll update colors again in case system settings toggle
      const currentColors = getColors();

      // Draw and move massive soft ambient backlighting orbs
      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Soft bounce off virtual bounds
        if (orb.x < orb.radius * 0.2 || orb.x > width - orb.radius * 0.2) orb.vx *= -1;
        if (orb.y < orb.radius * 0.2 || orb.y > height - orb.radius * 0.2) orb.vy *= -1;

        const radialGrad = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        radialGrad.addColorStop(0, orb.color);
        radialGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ease current mouse coordinates toward targets for sub-pixel liquid response
      const m = mouseRef.current;
      if (m.targetX !== -1000) {
        if (m.x === -1000) {
          m.x = m.targetX;
          m.y = m.targetY;
        } else {
          m.x += (m.targetX - m.x) * 0.08;
          m.y += (m.targetY - m.y) * 0.08;
        }
      } else {
        m.x = -1000;
        m.y = -1000;
      }

      // Render particle connection lines first
      const connectionDist = Math.min(145, width * 0.15);
      const cursorInteractDist = 180;

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          if (dist < connectionDist) {
            // Stronger distance scaling for subtle presentation
            const opValue = (1 - dist / connectionDist) * 0.85;
            ctx.strokeStyle = currentColors.lineColor;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw connections to cursor
        if (m.x !== -1000) {
          const dx = p1.x - m.x;
          const dy = p1.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cursorInteractDist) {
            const op = (1 - dist / cursorInteractDist) * 0.7;
            ctx.strokeStyle = currentColors.hoverLineColor;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();

            // Attract particle slightly towards cursor
            p1.x -= dx * 0.012;
            p1.y -= dy * 0.012;
          }
        }
      }

      // Draw and move points
      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Standard bounds loop
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Soft pulse variation
        const scale = 1 + Math.sin(Date.now() * 0.0015 + p.x) * 0.3;
        p.radius = p.baseRadius * scale;

        ctx.fillStyle = currentColors.particleColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  return (
    <div 
      ref={containerRef} 
      id="hero-interactive-mesh-container"
      className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-hidden"
    >
      <canvas 
        ref={canvasRef} 
        id="hero-interactive-mesh-canvas"
        className="w-full h-full block" 
      />
    </div>
  );
}
