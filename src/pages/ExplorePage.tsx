import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Sparkles, X } from 'lucide-react';
import StarField from '@/components/universe/StarField';
import Planet from '@/components/universe/Planet';
import Constellation, { CONSTELLATIONS } from '@/components/universe/Constellation';
import AsteroidField from '@/components/universe/AsteroidField';
import BlackHole from '@/components/universe/BlackHole';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { useSpaceSound } from '@/hooks/useSound';
import * as THREE from 'three';

// Parallax camera that responds to mouse
const ParallaxCamera = () => {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 8 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.current.y * 5 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -30);
  });

  return null;
};

// Nebula effect
const Nebula = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -80]}>
      <planeGeometry args={[150, 150]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

interface ConstellationInfo {
  name: string;
  description: string;
  facts: string[];
}

const constellationInfo: Record<string, ConstellationInfo> = {
  Orion: {
    name: 'Orion - The Hunter',
    description: 'One of the most recognizable constellations in the night sky, visible throughout the world.',
    facts: [
      'Contains the famous Orion Nebula',
      'Betelgeuse is a red supergiant star',
      'Best visible in January',
    ],
  },
  'Big Dipper': {
    name: 'Big Dipper - Ursa Major',
    description: 'Part of the larger Ursa Major constellation, used for navigation for centuries.',
    facts: [
      'Points to the North Star',
      'Never sets in northern latitudes',
      'Known in many cultures worldwide',
    ],
  },
  Cassiopeia: {
    name: 'Cassiopeia - The Queen',
    description: 'A W-shaped constellation named after a vain queen in Greek mythology.',
    facts: [
      'Visible year-round in the Northern Hemisphere',
      'Contains several star clusters',
      'Supernova observed here in 1572',
    ],
  },
  Scorpius: {
    name: 'Scorpius - The Scorpion',
    description: 'A zodiac constellation resembling a scorpion with a curved tail.',
    facts: [
      'Contains Antares, a red supergiant',
      'Best visible in summer',
      'Mythologically killed Orion',
    ],
  },
};

const ExplorePage = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedConstellation, setSelectedConstellation] = useState<ConstellationInfo | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showFeature, setShowFeature] = useState<string | null>(null);
  const { play, playAmbience, stopAmbience, setMuted } = useSpaceSound();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleConstellationClick = (name: string) => {
    play('success', 0.4);
    setSelectedConstellation(constellationInfo[name] || null);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-background"
    >
      {/* Animated Cursor */}
      <AnimatedCursor />

      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
          <ambientLight intensity={0.15} />
          <pointLight position={[20, 20, 20]} intensity={1.5} color="#00d4ff" />
          <pointLight position={[-20, -20, -20]} intensity={0.8} color="#ff00ff" />
          <pointLight position={[0, 0, -50]} intensity={1} color="#ffd700" />

          <StarField count={5000} radius={100} />
          <Stars radius={150} depth={80} count={3000} factor={5} fade speed={0.3} />
          <Nebula />

          {/* Constellations */}
          <Constellation 
            {...CONSTELLATIONS.orion} 
            position={[-25, 10, -40]} 
            scale={2}
            onClick={() => handleConstellationClick('Orion')}
          />
          <Constellation 
            {...CONSTELLATIONS.bigDipper} 
            position={[20, 15, -45]} 
            scale={1.8}
            onClick={() => handleConstellationClick('Big Dipper')}
          />
          <Constellation 
            {...CONSTELLATIONS.cassiopeia} 
            position={[0, 25, -50]} 
            scale={2}
            onClick={() => handleConstellationClick('Cassiopeia')}
          />
          <Constellation 
            {...CONSTELLATIONS.scorpius} 
            position={[-30, -10, -35]} 
            scale={1.5}
            onClick={() => handleConstellationClick('Scorpius')}
          />

          {/* Asteroid Field */}
          <AsteroidField 
            count={300} 
            radius={60} 
            thickness={15} 
            position={[0, 0, -60]}
            rotationSpeed={0.15}
          />

          {/* Black Hole */}
          <BlackHole 
            position={[40, -20, -70]} 
            size={4}
            accretionDiskSize={12}
            gravitationalStrength={0.6}
          />

          {/* Floating planets */}
          <Float speed={0.5} rotationIntensity={0.3}>
            <Planet
              position={[-35, -15, -50]}
              size={5}
              color="#00d4ff"
              emissiveColor="#0891b2"
              orbitRadius={8}
              orbitSpeed={0.1}
              glowIntensity={0.7}
              hasRing
              ringColor="#22d3ee"
            />
          </Float>

          <Float speed={0.8} rotationIntensity={0.2}>
            <Planet
              position={[30, 10, -55]}
              size={6}
              color="#8b5cf6"
              emissiveColor="#7c3aed"
              glowIntensity={0.6}
            />
          </Float>

          <ParallaxCamera />
          <OrbitControls
            enableZoom
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.1}
            minDistance={20}
            maxDistance={80}
          />
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

        <div className="flex items-center gap-3">
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setShowInfo(!showInfo);
              play('click', 0.3);
            }}
            className="px-4 py-2 glass-panel font-exo text-foreground hover:text-nebula-cyan transition-colors"
          >
            <Sparkles className="w-5 h-5 inline mr-2" />
            {showInfo ? 'Hide Info' : 'Show Info'}
          </motion.button>

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
      <AnimatePresence>
        {showInfo && (
          <div className="relative z-10 pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <motion.header
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-16"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-16 h-16 text-nebula-cyan" />
                </motion.div>
                <h1 className="font-orbitron text-5xl md:text-7xl font-black mb-6">
                  <span className="nebula-gradient glow-text">Explore</span>
                  <br />
                  <span className="text-foreground">The Cosmos</span>
                </h1>
                <p className="font-exo text-xl text-muted-foreground max-w-2xl mx-auto">
                  Click on constellations to learn about them • Observe the asteroid belt • 
                  Witness the gravitational power of a black hole
                </p>
              </motion.header>

              {/* Interactive Guide */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-3 gap-6 mb-12"
              >
                {[
                  { icon: '⭐', title: 'Constellations', desc: 'Click the glowing star patterns', id: 'constellations' },
                  { icon: '☄️', title: 'Asteroid Belt', desc: 'Watch rocks orbit in space', id: 'asteroid' },
                  { icon: '🕳️', title: 'Black Hole', desc: 'See gravitational lensing effects', id: 'blackhole' },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    onClick={() => {
                      play('click', 0.3);
                      setShowFeature(item.id);
                    }}
                    className="glass-panel p-6 text-center cursor-pointer hover:glow-border transition-all"
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-orbitron text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="font-exo text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Constellation Info Modal */}
      <AnimatePresence>
        {selectedConstellation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/50 backdrop-blur-sm"
            onClick={() => setSelectedConstellation(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel p-8 max-w-md glow-border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="font-orbitron text-2xl font-bold text-nebula-gold">
                  {selectedConstellation.name}
                </h2>
                <button
                  onClick={() => setSelectedConstellation(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="font-exo text-muted-foreground mb-6">
                {selectedConstellation.description}
              </p>
              <div className="space-y-3">
                {selectedConstellation.facts.map((fact, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <Sparkles className="w-4 h-4 text-nebula-cyan flex-shrink-0" />
                    <span className="font-exo text-foreground">{fact}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Showcase Modals */}
      <AnimatePresence>
        {showFeature === 'blackhole' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
            style={{ padding: '20px' }}
            onClick={() => setShowFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFeature(null)}
                className="absolute top-4 right-4 z-10 p-2 glass-panel text-foreground hover:text-nebula-cyan"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-full h-full rounded-lg overflow-hidden glow-border">
                <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
                  <ambientLight intensity={0.1} />
                  <pointLight position={[15, 15, 15]} intensity={1.2} color="#ffd700" />
                  <pointLight position={[-15, -15, 10]} intensity={0.6} color="#ff00ff" />
                  
                  <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
                  
                  <BlackHole 
                    position={[0, 0, -10]} 
                    size={6}
                    accretionDiskSize={18}
                    gravitationalStrength={0.8}
                  />
                  
                  <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    autoRotate
                    autoRotateSpeed={0.5}
                    target={[0, 0, -10]}
                  />
                </Canvas>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 glass-panel p-6"
              >
                <h2 className="font-orbitron text-2xl font-bold text-nebula-gold mb-3">
                  🕳️ Black Hole - Gravitational Lensing
                </h2>
                <p className="font-exo text-muted-foreground">
                  Witness the immense gravitational power of a black hole. Notice how light bends around it, 
                  creating the gravitational lensing effect. The swirling accretion disk shows matter being 
                  pulled into the event horizon at incredible speeds.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {showFeature === 'asteroid' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
            style={{ padding: '20px' }}
            onClick={() => setShowFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFeature(null)}
                className="absolute top-4 right-4 z-10 p-2 glass-panel text-foreground hover:text-nebula-cyan"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-full h-full rounded-lg overflow-hidden glow-border">
                <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
                  <ambientLight intensity={0.2} />
                  <pointLight position={[10, 10, 10]} intensity={1.5} color="#00d4ff" />
                  
                  <Stars radius={100} depth={50} count={1000} factor={4} fade speed={1} />
                  
                  <AsteroidField 
                    count={500} 
                    radius={30} 
                    thickness={10} 
                    position={[0, 0, 0]}
                    rotationSpeed={0.2}
                  />
                  
                  <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.3}
                  />
                </Canvas>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 glass-panel p-6"
              >
                <h2 className="font-orbitron text-2xl font-bold text-nebula-gold mb-3">
                  ☄️ Asteroid Belt
                </h2>
                <p className="font-exo text-muted-foreground">
                  Observe thousands of rocky asteroids orbiting in a ring formation. These space rocks vary in 
                  size and tumble chaotically as they travel through the void, remnants from the early solar system.
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {showFeature === 'constellations' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
            style={{ padding: '20px' }}
            onClick={() => setShowFeature(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowFeature(null)}
                className="absolute top-4 right-4 z-10 p-2 glass-panel text-foreground hover:text-nebula-cyan"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-full h-full rounded-lg overflow-hidden glow-border">
                <Canvas camera={{ position: [0, 0, 40], fov: 60 }}>
                  <ambientLight intensity={0.15} />
                  <pointLight position={[20, 20, 20]} intensity={1} color="#00d4ff" />
                  <pointLight position={[-20, -20, -20]} intensity={0.5} color="#ff00ff" />
                  
                  <Stars radius={150} depth={80} count={2000} factor={5} fade speed={0.3} />
                  
                  {/* All constellations in view */}
                  <Constellation 
                    {...CONSTELLATIONS.orion} 
                    position={[-15, 5, -20]} 
                    scale={2.5}
                    onClick={() => handleConstellationClick('Orion')}
                  />
                  <Constellation 
                    {...CONSTELLATIONS.bigDipper} 
                    position={[12, 8, -25]} 
                    scale={2.2}
                    onClick={() => handleConstellationClick('Big Dipper')}
                  />
                  <Constellation 
                    {...CONSTELLATIONS.cassiopeia} 
                    position={[0, 15, -30]} 
                    scale={2.5}
                    onClick={() => handleConstellationClick('Cassiopeia')}
                  />
                  <Constellation 
                    {...CONSTELLATIONS.scorpius} 
                    position={[-18, -8, -22]} 
                    scale={2}
                    onClick={() => handleConstellationClick('Scorpius')}
                  />
                  
                  <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.2}
                  />
                </Canvas>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 right-6 glass-panel p-6"
              >
                <h2 className="font-orbitron text-2xl font-bold text-nebula-gold mb-3">
                  ⭐ Constellations - Star Patterns
                </h2>
                <p className="font-exo text-muted-foreground mb-4">
                  Click on the glowing star patterns to learn about famous constellations like Orion, 
                  the Big Dipper, Cassiopeia, and Scorpius. Each constellation tells a story from ancient mythology.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-exo">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      play('click', 0.3);
                      handleConstellationClick('Orion');
                    }}
                    className="text-center p-2 bg-background/30 rounded hover:bg-background/50 hover:glow-border transition-all cursor-pointer"
                  >
                    <span className="text-nebula-cyan">⭐ Orion</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      play('click', 0.3);
                      handleConstellationClick('Big Dipper');
                    }}
                    className="text-center p-2 bg-background/30 rounded hover:bg-background/50 hover:glow-border transition-all cursor-pointer"
                  >
                    <span className="text-nebula-cyan">⭐ Big Dipper</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      play('click', 0.3);
                      handleConstellationClick('Cassiopeia');
                    }}
                    className="text-center p-2 bg-background/30 rounded hover:bg-background/50 hover:glow-border transition-all cursor-pointer"
                  >
                    <span className="text-nebula-cyan">⭐ Cassiopeia</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      play('click', 0.3);
                      handleConstellationClick('Scorpius');
                    }}
                    className="text-center p-2 bg-background/30 rounded hover:bg-background/50 hover:glow-border transition-all cursor-pointer"
                  >
                    <span className="text-nebula-cyan">⭐ Scorpius</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExplorePage;
