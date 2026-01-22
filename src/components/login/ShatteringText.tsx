import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface ShatteringTextProps {
  text: string;
  isAnimating: boolean;
  onComplete?: () => void;
}

const ShatteringText = ({ text, isAnimating, onComplete }: ShatteringTextProps) => {
  const letters = text.split('');

  const randomPositions = useMemo(() => {
    return letters.map(() => ({
      x: (Math.random() - 0.5) * 1000,
      y: (Math.random() - 0.5) * 800,
      z: (Math.random() - 0.5) * 500,
      rotateX: Math.random() * 720 - 360,
      rotateY: Math.random() * 720 - 360,
      rotateZ: Math.random() * 720 - 360,
    }));
  }, [letters.length]);

  return (
    <div className="relative perspective-1000">
      <motion.div className="flex justify-center items-center">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={randomPositions[index]}
            animate={
              isAnimating
                ? {
                    x: 0,
                    y: 0,
                    z: 0,
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    opacity: 1,
                    scale: 1,
                  }
                : {
                    ...randomPositions[index],
                    opacity: 0,
                    scale: 0.5,
                  }
            }
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 80,
              delay: isAnimating ? index * 0.08 : 0,
              duration: 1.2,
            }}
            onAnimationComplete={index === letters.length - 1 && isAnimating ? onComplete : undefined}
            className="inline-block font-orbitron text-5xl md:text-7xl lg:text-8xl font-black preserve-3d"
            style={{
              color: '#ffffff',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.4), 0 0 60px rgba(0, 212, 255, 0.2)',
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.div>

      {/* Glow effect underneath */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isAnimating ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ delay: letters.length * 0.08, duration: 0.8 }}
        className="absolute inset-0 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.4) 0%, rgba(255, 0, 255, 0.2) 50%, transparent 80%)',
          transform: 'translateY(30px)',
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default ShatteringText;
