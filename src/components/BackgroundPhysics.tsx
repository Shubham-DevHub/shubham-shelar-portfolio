import { useEffect, useRef } from 'react';

interface BackgroundPhysicsProps {
  opacity: number;
  scrollY?: number;
}

export default function BackgroundPhysics({ opacity, scrollY = 0 }: BackgroundPhysicsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const particleCount = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: Math.random() * 0.3 - 0.15,
          speedY: Math.random() * 0.3 - 0.15,
          opacity: Math.random() * 0.3 + 0.1,
        });
      }
    };

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Fluctuating brightness
        const pulsatingOpacity = p.opacity * (0.5 + Math.sin(Date.now() * 0.002 + p.x) * 0.5);
        ctx.fillStyle = `rgba(0, 223, 192, ${pulsatingOpacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    const handleResize = () => {
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      {/* Enhanced Liquid Glass Flow Background System */}
      <div className="fixed inset-0 -z-20 overflow-hidden bg-background">
        {/* Orb 1 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * 0.18}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out">
          <div 
            className="liquid-flow-orb bg-[#00dfc0] transition-colors duration-500" 
            style={{ 
              width: '70vw', 
              height: '70vh', 
              top: '-10vh', 
              left: '-10vw', 
              animationDelay: '0s',
              opacity: opacity * 0.6
            }} 
          />
        </div>

        {/* Orb 2 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * -0.12}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out">
          <div 
            className="liquid-flow-orb bg-[#8b9dff]" 
            style={{ 
              width: '80vw', 
              height: '80vh', 
              top: '20vh', 
              right: '-20vw', 
              animationDelay: '-10s',
              opacity: opacity * 0.5
            }} 
          />
        </div>

        {/* Orb 3 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out">
          <div 
            className="liquid-flow-orb bg-[#01dfc0]" 
            style={{ 
              width: '60vw', 
              height: '60vh', 
              bottom: '-10vh', 
              left: '20vw', 
              animationDelay: '-20s',
              opacity: opacity * 0.6
            }} 
          />
        </div>

        {/* Orb 4 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * -0.2}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out">
          <div 
            className="liquid-flow-orb bg-[#dee8ff]" 
            style={{ 
              width: '90vw', 
              height: '90vh', 
              top: '10vh', 
              left: '5vw', 
              animationDelay: '-30s', 
              opacity: opacity * 0.3 
            }} 
          />
        </div>
      </div>

      <div className="fixed inset-0 -z-10 backdrop-blur-[64px] pointer-events-none" />
      <div className="glass-noise" />
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none opacity-60" />
    </>
  );
}
