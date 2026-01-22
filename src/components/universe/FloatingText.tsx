import { motion } from 'framer-motion';

interface FloatingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const FloatingText = ({ text, className = '', delay = 0 }: FloatingTextProps) => {
  const letters = text.split('');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      y: 100,
      rotateX: 90,
      scale: 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
        duration: 0.8,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className={`flex justify-center items-center perspective-1000 ${className}`}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={letterAnimation}
          className="inline-block font-orbitron text-6xl md:text-8xl font-bold glow-text nebula-gradient preserve-3d"
          style={{ 
            textShadow: '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.6), 0 0 60px rgba(255, 0, 255, 0.4)',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default FloatingText;
