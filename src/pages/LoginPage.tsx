import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, Float } from '@react-three/drei';
import { Volume2, VolumeX } from 'lucide-react';
import ShatteringText from '@/components/login/ShatteringText';
import LoginForm from '@/components/login/LoginForm';
import StarField from '@/components/universe/StarField';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { useSpaceSound } from '@/hooks/useSound';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

type LoginPhase = 'intro' | 'assembling' | 'form' | 'launching';

// Sun Component
const Sun = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.1}>
      <mesh ref={meshRef} position={[0, 0, -40]}>
        <sphereGeometry args={[4, 64, 64]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
      <mesh position={[0, 0, -40]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, -40]}>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.2} />
      </mesh>
      <pointLight position={[0, 0, -40]} intensity={3} color="#ffd700" distance={200} />
    </Float>
  );
};

// OrbitRing Component for visible orbital paths around the sun
const OrbitRing = ({ radius, color, opacity = 0.4 }: { radius: number; color: string; opacity?: number }) => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -40]}>
      <ringGeometry args={[radius - 0.1, radius + 0.1, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Orbiting Planet Component
const OrbitingPlanet = ({ 
  size, 
  color, 
  emissiveColor, 
  orbitRadius, 
  orbitSpeed, 
  hasRing, 
  ringColor 
}: { 
  size: number; 
  color: string; 
  emissiveColor: string; 
  orbitRadius: number; 
  orbitSpeed: number; 
  hasRing?: boolean; 
  ringColor?: string; 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const initialAngle = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      const angle = initialAngle.current + state.clock.elapsedTime * orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * orbitRadius - 40;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      {hasRing && (
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <ringGeometry args={[size * 1.4, size * 2, 64]} />
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

const LoginPage = () => {
  const [phase, setPhase] = useState<LoginPhase>('intro');
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved !== null ? saved === 'true' : true;
  });
  const { play, playAmbience, stopAmbience, setMuted } = useSpaceSound();
  const navigate = useNavigate();

  useEffect(() => {
    // Start intro after a brief delay
    const timer = setTimeout(() => {
      setPhase('assembling');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isMuted) {
      playAmbience();
    }
    return () => stopAmbience();
  }, [isMuted, playAmbience, stopAmbience]);

  const handleTextComplete = useCallback(() => {
    play('success', 0.3);
    // Wait 5 seconds after UNIVERSE assembles, then show login form
    setTimeout(() => {
      setPhase('form');
      play('whoosh', 0.4);
    }, 3000);
  }, [play]);

  const handleLogin = useCallback(
    (email: string, password: string) => {
      play('click', 0.5);
      setPhase('launching');
      play('whoosh', 0.6);

      // Simulate login and navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    },
    [play, navigate]
  );

  const handleSignup = useCallback(
    (name: string, email: string, password: string) => {
      play('click', 0.5);
      setPhase('launching');
      play('whoosh', 0.6);

      // Simulate signup and navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    },
    [play, navigate]
  );

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    localStorage.setItem('soundMuted', String(newMuted));
    if (!newMuted) {
      play('click', 0.3);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Animated Cursor */}
      <AnimatedCursor />

      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />

          <StarField count={2000} radius={60} />
          <Stars radius={100} depth={50} count={1000} factor={4} fade speed={1} />

          {/* Sun, Orbital Rings and Planets - only show during form phase */}
          {phase === 'form' ? (
            <>
              {/* Central Sun */}
              <Sun />

              {/* Orbital Rings around the sun */}
              <OrbitRing radius={8} color="#9ca3af" opacity={0.3} />
              <OrbitRing radius={12} color="#fbbf24" opacity={0.35} />
              <OrbitRing radius={16} color="#3b82f6" opacity={0.4} />
              <OrbitRing radius={20} color="#ef4444" opacity={0.35} />
              <OrbitRing radius={26} color="#f97316" opacity={0.3} />
              <OrbitRing radius={32} color="#eab308" opacity={0.35} />

              {/* Planets orbiting the sun */}
              <OrbitingPlanet
                size={0.6}
                color="#9ca3af"
                emissiveColor="#6b7280"
                orbitRadius={8}
                orbitSpeed={0.5}
                hasRing
                ringColor="#d1d5db"
              />
              <OrbitingPlanet
                size={0.8}
                color="#fbbf24"
                emissiveColor="#d97706"
                orbitRadius={12}
                orbitSpeed={0.4}
                hasRing
                ringColor="#fcd34d"
              />
              <OrbitingPlanet
                size={0.9}
                color="#3b82f6"
                emissiveColor="#2563eb"
                orbitRadius={16}
                orbitSpeed={0.35}
                hasRing
                ringColor="#60a5fa"
              />
              <OrbitingPlanet
                size={0.7}
                color="#ef4444"
                emissiveColor="#dc2626"
                orbitRadius={20}
                orbitSpeed={0.3}
                hasRing
                ringColor="#f87171"
              />
              <OrbitingPlanet
                size={2}
                color="#f97316"
                emissiveColor="#ea580c"
                orbitRadius={26}
                orbitSpeed={0.2}
                hasRing
                ringColor="#fb923c"
              />
              <OrbitingPlanet
                size={1.8}
                color="#eab308"
                emissiveColor="#ca8a04"
                orbitRadius={32}
                orbitSpeed={0.15}
                hasRing
                ringColor="#fde047"
              />
            </>
          ) : null}

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Canvas>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* Sound Toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={toggleMute}
        className="absolute top-6 right-6 z-50 p-3 glass-panel hover:bg-muted/30 transition-all duration-300"
        onMouseEnter={() => !isMuted && play('hover', 0.2)}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-muted-foreground" />
        ) : (
          <Volume2 className="w-6 h-6 text-nebula-cyan" />
        )}
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Shattering Universe Text */}
        <AnimatePresence>
          {(phase === 'assembling' || phase === 'intro') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="mb-12"
            >
              <ShatteringText
                text="UNIVERSE"
                isAnimating={phase !== 'intro'}
                onComplete={handleTextComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connecting text - fixed position, independent of UNIVERSE animation */}
        <AnimatePresence>
          {phase === 'assembling' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                delay: 1.5, 
                duration: 0.6,
                ease: "easeInOut",
                exit: { duration: 0.8, ease: "easeInOut" } 
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-16"
            >
              <p className="text-center text-muted-foreground font-exo text-lg whitespace-nowrap">
                
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <AnimatePresence>
          {phase === 'form' && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.9 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 120,
                opacity: { duration: 0.6, ease: "easeInOut" }
              }}
              className="glass-panel p-8 md:p-12 glow-border"
            >
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.3, 
                  duration: 0.5, 
                  ease: "easeOut" 
                }}
                className="text-2xl md:text-3xl font-orbitron font-bold text-center mb-8 text-foreground"
              >
                Enter the <span className="text-nebula-cyan">Mysterious</span> Universe
              </motion.h2>

              <LoginForm onLogin={handleLogin} onSignup={handleSignup} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Launching Animation */}
        <AnimatePresence>
          {phase === 'launching' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-nebula-cyan via-nebula-magenta to-nebula-gold"
                style={{
                  boxShadow:
                    '0 0 40px rgba(0, 212, 255, 0.6), 0 0 80px rgba(255, 0, 255, 0.4), 0 0 120px rgba(255, 215, 0, 0.3)',
                }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-orbitron text-2xl text-nebula-cyan glow-text"
              >
                Launching into Universe...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Particle overlay effects */}
      <div className="absolute inset-0 z-[5] pointer-events-none star-field opacity-30" />
    </div>
  );
};

export default LoginPage;
