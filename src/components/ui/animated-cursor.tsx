import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

const AnimatedCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>();
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let particleId = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      // Create glitter particles
      const colors = ['#00d4ff', '#ff00ff', '#ffd700', '#ffffff'];
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < 3; i++) {
        newParticles.push({
          id: particleId++,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2,
        });
      }

      setParticles((prev) => [...(prev || []), ...newParticles].slice(-50));

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsMoving(false), 100);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  // Clean up old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => (prev || []).slice(-30));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Glitter particles */}
      <AnimatePresence>
        {particles?.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              y: particle.y + (Math.random() - 0.5) * 50,
              x: particle.x + (Math.random() - 0.5) * 50,
              opacity: 0,
              scale: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: Math.random() * 0.5 + 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AnimatedCursor;
