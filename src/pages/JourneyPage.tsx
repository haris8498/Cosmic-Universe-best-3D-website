import { useRef, useEffect, useState, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Trail } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Rocket } from 'lucide-react';
import StarField from '@/components/universe/StarField';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { useSpaceSound } from '@/hooks/useSound';
import * as THREE from 'three';

// Warp speed effect with trails
const WarpTunnel = ({ speed }: { speed: number }) => {
  const tunnelRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particles = new Float32Array(3000 * 3);
  for (let i = 0; i < 3000; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 50 + 10;
    const theta = Math.random() * Math.PI * 2;
    particles[i3] = Math.cos(theta) * radius;
    particles[i3 + 1] = Math.sin(theta) * radius;
    particles[i3 + 2] = (Math.random() - 0.5) * 200;
  }

  useFrame((state, delta) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < 3000; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += speed * delta * 50;
        if (positions[i3 + 2] > 100) {
          positions[i3 + 2] = -100;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (tunnelRef.current) {
      tunnelRef.current.rotation.z += delta * 0.1;
    }
  });

  return (
    <group ref={tunnelRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={3000}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          color="#00d4ff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

// Spaceship
const Spaceship = () => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[0, 0, 5]}>
      {/* Ship body */}
      <mesh>
        <coneGeometry args={[0.5, 2, 6]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Engine glow */}
      <Trail
        width={2}
        length={6}
        color="#00d4ff"
        attenuation={(t) => t * t}
      >
        <mesh position={[0, -1.2, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="#00d4ff" />
        </mesh>
      </Trail>
      {/* Wings */}
      <mesh position={[-0.8, -0.5, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.8} />
      </mesh>
      <mesh position={[0.8, -0.5, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.8, 0.1, 0.3]} />
        <meshStandardMaterial color="#8b5cf6" metalness={0.8} />
      </mesh>
    </group>
  );
};

// Camera that follows scroll
const ScrollCamera = ({ scrollProgress }: { scrollProgress: number }) => {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.z = 20 - scrollProgress * 100;
    camera.rotation.x = scrollProgress * 0.3;
  });

  return null;
};

const JourneyPage = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved !== null ? saved === 'true' : true;
  });
  const [warpSpeed, setWarpSpeed] = useState(1);
  const { play, playAmbience, stopAmbience, setMuted } = useSpaceSound();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.3]);

  useEffect(() => {
    if (!isMuted) playAmbience();
    return () => stopAmbience();
  }, [isMuted, playAmbience, stopAmbience]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setMuted(newMuted);
    localStorage.setItem('soundMuted', String(newMuted));
    if (!newMuted) play('click', 0.3);
  };

  const journeyStages = [
    {
      title: 'Departure',
      description: 'Leave Earth orbit and begin your cosmic adventure.',
      icon: '🚀',
    },
    {
      title: 'Asteroid Belt',
      description: 'Navigate through millions of rocky debris.',
      icon: '☄️',
    },
    {
      title: 'Gas Giants',
      description: 'Pass Jupiter and Saturn in all their glory.',
      icon: '🪐',
    },
    {
      title: 'Outer Reaches',
      description: 'Enter the mysterious Kuiper Belt.',
      icon: '❄️',
    },
    {
      title: 'Interstellar',
      description: 'Cross into the vast space between stars.',
      icon: '✨',
    },
    {
      title: 'New Horizons',
      description: 'Discover uncharted worlds and phenomena.',
      icon: '🌌',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative min-h-[400vh] w-full overflow-x-hidden bg-background"
    >
      {/* Animated Cursor */}
      <AnimatedCursor />

      {/* Fixed 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, 10]} intensity={2} color="#00d4ff" />

            <StarField count={2000} radius={100} />
            <Stars radius={150} depth={100} count={3000} factor={5} fade speed={warpSpeed} />

            <WarpTunnel speed={warpSpeed} />
            <Spaceship />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={false}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-6 right-6 z-50 flex justify-between items-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 glass-panel font-exo text-foreground hover:text-nebula-cyan transition-colors"
            onClick={() => play('click', 0.3)}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
        </motion.div>

        <div className="flex items-center gap-4">
          {/* Speed control */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 glass-panel px-4 py-2"
          >
            <Rocket className="w-5 h-5 text-nebula-cyan" />
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={warpSpeed}
              onChange={(e) => setWarpSpeed(parseFloat(e.target.value))}
              className="w-24 accent-nebula-cyan"
            />
            <span className="font-orbitron text-sm text-foreground">{warpSpeed}x</span>
          </motion.div>

          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            onClick={toggleMute}
            className="p-3 glass-panel"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-nebula-cyan" />}
          </motion.button>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <motion.section
          style={{ opacity }}
          className="h-screen flex items-center justify-center text-center px-6"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-orbitron text-5xl md:text-7xl font-black mb-6"
            >
              <span className="nebula-gradient glow-text">Cosmic</span>
              <br />
              <span className="text-foreground">Journey</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-exo text-xl text-muted-foreground max-w-xl mx-auto mb-8"
            >
              Scroll down to travel through space and time.
              Use the speed slider to control your velocity.
            </motion.p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-muted-foreground"
            >
              ↓ Scroll to begin journey ↓
            </motion.div>
          </div>
        </motion.section>

        {/* Journey stages */}
        {journeyStages.map((stage, index) => (
          <motion.section
            key={stage.title}
            initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-20%' }}
            transition={{ duration: 0.8 }}
            className="min-h-screen flex items-center justify-center px-6"
          >
            <div
              className={`glass-panel p-8 md:p-12 max-w-lg ${
                index % 2 === 0 ? 'mr-auto ml-6 md:ml-20' : 'ml-auto mr-6 md:mr-20'
              }`}
            >
              <div className="text-6xl mb-4">{stage.icon}</div>
              <h2 className="font-orbitron text-3xl font-bold text-foreground mb-4">
                {stage.title}
              </h2>
              <p className="font-exo text-lg text-muted-foreground">
                {stage.description}
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1 flex-1 bg-gradient-to-r from-nebula-cyan to-nebula-magenta rounded-full" />
                <span className="font-orbitron text-sm text-nebula-cyan">
                  Stage {index + 1}/6
                </span>
              </div>
            </div>
          </motion.section>
        ))}

        {/* Final destination */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="min-h-screen flex items-center justify-center text-center px-6"
        >
          <div className="glass-panel p-12 max-w-2xl">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-r from-nebula-cyan via-nebula-magenta to-nebula-gold"
              style={{
                boxShadow: '0 0 60px rgba(0, 212, 255, 0.6)',
              }}
            />
            <h2 className="font-orbitron text-4xl font-black mb-4">
              <span className="nebula-gradient glow-text">Journey Complete</span>
            </h2>
            <p className="font-exo text-xl text-muted-foreground mb-8">
              You've traveled across the cosmos. The universe awaits your next adventure.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nebula-cyan to-nebula-magenta text-primary-foreground font-orbitron rounded-xl hover:opacity-90 transition-opacity"
              onClick={() => play('click', 0.4)}
            >
              Return Home
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default JourneyPage;
