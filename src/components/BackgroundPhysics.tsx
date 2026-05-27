import { useEffect, useRef } from 'react';

interface BackgroundPhysicsProps {
  opacity: number;
  scrollY?: number;
  neonStyle?: 'cyan' | 'purple';
}

export default function BackgroundPhysics({ opacity, scrollY = 0, neonStyle = 'cyan' }: BackgroundPhysicsProps) {
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
        ctx.fillStyle = neonStyle === 'cyan' 
          ? `rgba(6, 182, 212, ${pulsatingOpacity})`
          : `rgba(168, 85, 247, ${pulsatingOpacity})`;
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
  }, [neonStyle]);

  return (
    <>
      {/* Enhanced Liquid Glass Flow Background System */}
      <div className="fixed inset-0 -z-25 overflow-hidden bg-[#030712] select-none pointer-events-none">
        
        {/* Orb 1 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * 0.15}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out">
          <div 
            className={`liquid-flow-orb transition-all duration-[1500ms] ${neonStyle === 'cyan' ? 'bg-[#06b6d4]' : 'bg-[#c084fc]'}`}
            style={{ 
              width: '50vw', 
              height: '50vh', 
              top: '-5vh', 
              left: '-5vw', 
              opacity: opacity * 1.5,
              filter: 'blur(160px)'
            }} 
          />
        </div>

        {/* Orb 2 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * -0.1}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out">
          <div 
            className={`liquid-flow-orb transition-all duration-[1500ms] ${neonStyle === 'cyan' ? 'bg-[#3b82f6]' : 'bg-[#ec4899]'}`}
            style={{ 
              width: '60vw', 
              height: '60vh', 
              top: '25vh', 
              right: '-10vw', 
              opacity: opacity * 1.4,
              filter: 'blur(160px)'
            }} 
          />
        </div>

        {/* Orb 3 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * 0.1}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out">
          <div 
            className={`liquid-flow-orb transition-all duration-[1500ms] ${neonStyle === 'cyan' ? 'bg-[#0b7285]' : 'bg-[#673ab7]'}`}
            style={{ 
              width: '45vw', 
              height: '45vh', 
              bottom: '-8vh', 
              left: '15vw', 
              opacity: opacity * 1.2,
              filter: 'blur(150px)'
            }} 
          />
        </div>

        {/* Orb 4 Parallax Wrapper */}
        <div style={{ transform: `translate3d(0, ${scrollY * -0.15}px, 0)` }} className="absolute inset-0 pointer-events-none transition-transform duration-150 ease-out">
          <div 
            className={`liquid-flow-orb transition-all duration-[1500ms] ${neonStyle === 'cyan' ? 'bg-[#1e40af]' : 'bg-[#db2777]'}`}
            style={{ 
              width: '65vw', 
              height: '65vh', 
              top: '15vh', 
              left: '10vw', 
              opacity: opacity * 0.8,
              filter: 'blur(170px)'
            }} 
          />
        </div>
      </div>

      <div className="fixed inset-0 -z-20 backdrop-blur-[72px] pointer-events-none bg-[#030712]/10" />
      <div className="glass-noise" />
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none opacity-40 mix-blend-screen" />
    </>
  );
}
