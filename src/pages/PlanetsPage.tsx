import { useRef, useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Html } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, Info, X } from 'lucide-react';
import StarField from '@/components/universe/StarField';
import Planet from '@/components/universe/Planet';
import AnimatedCursor from '@/components/ui/animated-cursor';
import { useSpaceSound } from '@/hooks/useSound';
import * as THREE from 'three';

interface PlanetData {
  name: string;
  size: number;
  color: string;
  emissiveColor: string;
  orbitRadius: number;
  orbitSpeed: number;
  hasRing: boolean;
  ringColor?: string;
  description: string;
  facts: string[];
  moons?: number;
  detailedInfo: {
    diameter: string;
    mass: string;
    gravity: string;
    temperature: string;
  };
}

const planetsData: PlanetData[] = [
  {
    name: 'Mercury',
    size: 0.8,
    color: '#9ca3af',
    emissiveColor: '#6b7280',
    orbitRadius: 12,
    orbitSpeed: 0.8,
    hasRing: false,
    description: 'The smallest planet and closest to the Sun.',
    facts: ['Day: 59 Earth days', 'Year: 88 Earth days', 'No moons'],
    moons: 0,
    detailedInfo: {
      diameter: '4,879 km',
      mass: '3.285 × 10²³ kg',
      gravity: '3.7 m/s²',
      temperature: '-173°C to 427°C',
    },
  },
  {
    name: 'Venus',
    size: 1.2,
    color: '#fbbf24',
    emissiveColor: '#d97706',
    orbitRadius: 18,
    orbitSpeed: 0.6,
    hasRing: false,
    description: 'The hottest planet with thick toxic atmosphere.',
    facts: ['Day: 243 Earth days', 'Year: 225 Earth days', 'Rotates backwards'],
    moons: 0,
    detailedInfo: {
      diameter: '12,104 km',
      mass: '4.867 × 10²⁴ kg',
      gravity: '8.87 m/s²',
      temperature: '462°C',
    },
  },
  {
    name: 'Earth',
    size: 1.3,
    color: '#3b82f6',
    emissiveColor: '#2563eb',
    orbitRadius: 24,
    orbitSpeed: 0.5,
    hasRing: false,
    description: 'Our home - the only known planet with life.',
    facts: ['Day: 24 hours', 'Year: 365 days', '1 Moon'],
    moons: 1,
    detailedInfo: {
      diameter: '12,742 km',
      mass: '5.972 × 10²⁴ kg',
      gravity: '9.8 m/s²',
      temperature: '-88°C to 58°C',
    },
  },
  {
    name: 'Mars',
    size: 1,
    color: '#ef4444',
    emissiveColor: '#dc2626',
    orbitRadius: 30,
    orbitSpeed: 0.4,
    hasRing: false,
    description: 'The Red Planet - future home for humanity?',
    facts: ['Day: 24.6 hours', 'Year: 687 Earth days', '2 Moons'],
    moons: 2,
    detailedInfo: {
      diameter: '6,779 km',
      mass: '6.39 × 10²³ kg',
      gravity: '3.71 m/s²',
      temperature: '-125°C to 20°C',
    },
  },
  {
    name: 'Jupiter',
    size: 3.5,
    color: '#f97316',
    emissiveColor: '#ea580c',
    orbitRadius: 42,
    orbitSpeed: 0.25,
    hasRing: false,
    description: 'The largest planet with the Great Red Spot.',
    facts: ['Day: 10 hours', 'Year: 12 Earth years', '95 Moons'],
    moons: 95,
    detailedInfo: {
      diameter: '139,820 km',
      mass: '1.898 × 10²⁷ kg',
      gravity: '24.79 m/s²',
      temperature: '-145°C',
    },
  },
  {
    name: 'Saturn',
    size: 3,
    color: '#eab308',
    emissiveColor: '#ca8a04',
    orbitRadius: 55,
    orbitSpeed: 0.18,
    hasRing: true,
    ringColor: '#fde047',
    description: 'Famous for its spectacular ring system.',
    facts: ['Day: 10.7 hours', 'Year: 29 Earth years', '146 Moons'],
    moons: 146,
    detailedInfo: {
      diameter: '116,460 km',
      mass: '5.683 × 10²⁶ kg',
      gravity: '10.44 m/s²',
      temperature: '-178°C',
    },
  },
  {
    name: 'Uranus',
    size: 2,
    color: '#06b6d4',
    emissiveColor: '#0891b2',
    orbitRadius: 68,
    orbitSpeed: 0.12,
    hasRing: true,
    ringColor: '#22d3ee',
    description: 'The ice giant that rotates on its side.',
    facts: ['Day: 17 hours', 'Year: 84 Earth years', '28 Moons'],
    moons: 28,
    detailedInfo: {
      diameter: '50,724 km',
      mass: '8.681 × 10²⁵ kg',
      gravity: '8.69 m/s²',
      temperature: '-224°C',
    },
  },
  {
    name: 'Neptune',
    size: 1.9,
    color: '#3b82f6',
    emissiveColor: '#1d4ed8',
    orbitRadius: 80,
    orbitSpeed: 0.08,
    hasRing: false,
    description: 'The windiest planet with supersonic storms.',
    facts: ['Day: 16 hours', 'Year: 165 Earth years', '16 Moons'],
    moons: 16,
    detailedInfo: {
      diameter: '49,244 km',
      mass: '1.024 × 10²⁶ kg',
      gravity: '11.15 m/s²',
      temperature: '-214°C',
    },
  },
];

// Interactive planet with tooltip
const InteractivePlanet = ({ planet, onClick }: { planet: PlanetData; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const initialAngle = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      const angle = initialAngle.current + state.clock.elapsedTime * planet.orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * planet.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * planet.orbitRadius - 40;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={onClick}
        >
          <sphereGeometry args={[planet.size, 64, 64]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.emissiveColor}
            emissiveIntensity={hovered ? 1 : 0.5}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {/* Glow */}
        <mesh>
          <sphereGeometry args={[planet.size * 1.15, 32, 32]} />
          <meshBasicMaterial
            color={planet.emissiveColor}
            transparent
            opacity={hovered ? 0.4 : 0.2}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Ring */}
        {planet.hasRing && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[planet.size * 1.4, planet.size * 2, 64]} />
            <meshBasicMaterial
              color={planet.ringColor}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Label */}
        {hovered && (
          <Html center distanceFactor={15}>
            <div className="glass-panel px-4 py-2 whitespace-nowrap">
              <span className="font-orbitron text-sm text-nebula-cyan">{planet.name}</span>
            </div>
          </Html>
        )}
      </Float>
    </group>
  );
};

// Sun
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
        <sphereGeometry args={[6, 64, 64]} />
        <meshBasicMaterial color="#ffd700" />
      </mesh>
      <mesh position={[0, 0, -40]}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial color="#ffd700" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, -40]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ff8c00" transparent opacity={0.2} />
      </mesh>
      <pointLight position={[0, 0, -40]} intensity={3} color="#ffd700" distance={200} />
    </Float>
  );
};

// Orbital Ring
const OrbitRing = ({ radius }: { radius: number }) => {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -40]}>
      <ringGeometry args={[radius - 0.1, radius + 0.1, 128]} />
      <meshBasicMaterial
        color="#00d4ff"
        transparent
        opacity={0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// Detailed Planet View with Moons
const DetailedPlanet = ({ planet }: { planet: PlanetData }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Create moons based on planet's moon count
  const moons = planet.moons ? Math.min(planet.moons, 8) : 0; // Show max 8 moons for visual clarity
  const moonElements = [];
  
  // Scale planet appropriately for detailed view
  const displaySize = planet.size < 1.5 ? 3 : planet.size > 3 ? 4 : 3.5;
  
  for (let i = 0; i < moons; i++) {
    const angle = (i / moons) * Math.PI * 2;
    const distance = displaySize * 1.8 + i * 0.4;
    const moonSize = displaySize * 0.12;
    
    moonElements.push(
      <Float key={i} speed={2 + i * 0.5} rotationIntensity={0.2}>
        <mesh position={[Math.cos(angle) * distance, Math.sin(angle * 0.5) * 0.5, Math.sin(angle) * distance]}>
          <sphereGeometry args={[moonSize, 32, 32]} />
          <meshStandardMaterial color="#a0a0a0" roughness={0.9} metalness={0.1} />
        </mesh>
      </Float>
    );
  }

  return (
    <group ref={groupRef}>
      <Float speed={1} rotationIntensity={0.1}>
        {/* Main Planet */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[displaySize, 128, 128]} />
          <meshStandardMaterial
            color={planet.color}
            emissive={planet.emissiveColor}
            emissiveIntensity={0.6}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>

        {/* Glow */}
        <mesh>
          <sphereGeometry args={[displaySize * 1.1, 64, 64]} />
          <meshBasicMaterial
            color={planet.emissiveColor}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Ring if applicable */}
        {planet.hasRing && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[displaySize * 1.4, displaySize * 2.2, 128]} />
            <meshBasicMaterial
              color={planet.ringColor}
              transparent
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </Float>

      {/* Moons */}
      {moonElements}

      {/* Moon orbital paths */}
      {Array.from({ length: moons }).map((_, i) => {
        const distance = displaySize * 1.8 + i * 0.4;
        return (
          <mesh key={`orbit-${i}`} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[distance - 0.02, distance + 0.02, 128]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const PlanetsPage = () => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('soundMuted');
    return saved !== null ? saved === 'true' : true;
  });
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const { play, playAmbience, stopAmbience, setMuted } = useSpaceSound();

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

  // Handle ESC key to close detailed view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDetailedView) {
        setShowDetailedView(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDetailedView]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Animated Cursor */}
      <AnimatedCursor />
      {/* 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 20, 60], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.1} />
            <StarField count={8000} radius={150} />
            <Stars radius={200} depth={100} count={5000} factor={1} fade speed={0.1} />

            <Sun />

            {/* Orbital Rings */}
            {planetsData.map((planet) => (
              <OrbitRing key={`orbit-${planet.name}`} radius={planet.orbitRadius} />
            ))}

            {/* Planets */}
            {planetsData.map((planet) => (
              <InteractivePlanet
                key={planet.name}
                planet={planet}
                onClick={() => {
                  setSelectedPlanet(planet);
                  setShowDetailedView(true);
                  play('click', 0.4);
                }}
              />
            ))}

            <OrbitControls
              enableZoom
              enablePan
              autoRotate
              autoRotateSpeed={0.1}
              minDistance={30}
              maxDistance={120}
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

        <motion.button
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={toggleMute}
          className="p-3 glass-panel"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-nebula-cyan" />}
        </motion.button>
      </nav>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-24 left-0 right-0 z-20 text-center"
      >
        <h1 className="font-orbitron text-4xl md:text-5xl font-black">
          <span className="nebula-gradient glow-text">Solar System</span>
        </h1>
        <p className="font-exo text-muted-foreground mt-2">
          Click on planets to learn more • Drag to rotate • Scroll to zoom
        </p>
      </motion.div>

      {/* Planet Info Panel */}
      {selectedPlanet && !showDetailedView && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-6 z-50 w-80 glass-panel p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <h2 className="font-orbitron text-2xl font-bold text-foreground">
              {selectedPlanet.name}
            </h2>
            <button
              onClick={() => setSelectedPlanet(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <p className="font-exo text-muted-foreground mb-4">
            {selectedPlanet.description}
          </p>
          <div className="space-y-2 mb-4">
            {selectedPlanet.facts.map((fact, i) => (
              <div key={i} className="flex items-center gap-2">
                <Info className="w-4 h-4 text-nebula-cyan" />
                <span className="font-exo text-sm text-foreground">{fact}</span>
              </div>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowDetailedView(true);
              play('click', 0.3);
            }}
            className="w-full py-2 glass-panel font-orbitron text-nebula-cyan hover:glow-border transition-all"
          >
            View Details
          </motion.button>
        </motion.div>
      )}

      {/* Detailed Planet View Modal */}
      <AnimatePresence>
        {showDetailedView && selectedPlanet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md"
            style={{ padding: '50px' }}
            onClick={() => setShowDetailedView(false)}
          >
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[101]">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-exo text-sm text-muted-foreground text-center"
              >
                Click anywhere outside or press <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> to close
              </motion.p>
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative w-full h-full flex"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-4 right-4 z-20 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailedView(false)}
                  className="p-3 glass-panel text-foreground hover:text-nebula-cyan glow-border"
                  title="Close detailed view"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="flex gap-6 h-full w-full">
                {/* 3D View - Left Side Full */}
                <div className="w-3/5 rounded-lg overflow-hidden glow-border bg-background/20">
                  <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
                    <ambientLight intensity={0.3} />
                    <pointLight position={[15, 10, 15]} intensity={2.5} color="#ffffff" />
                    <pointLight position={[-10, -5, 10]} intensity={1} color={selectedPlanet.emissiveColor} />
                    <pointLight position={[0, 15, 5]} intensity={1} color="#00d4ff" />
                    
                    <Stars radius={150} depth={80} count={3000} factor={1} fade speed={0.1} />
                    
                    <DetailedPlanet planet={selectedPlanet} />
                    
                    <OrbitControls
                      enableZoom={true}
                      enablePan={true}
                      autoRotate
                      autoRotateSpeed={0.3}
                      minDistance={10}
                      maxDistance={35}
                      target={[0, 0, 0]}
                    />
                  </Canvas>
                </div>

                {/* Information Panel - Right Side */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-2/5 glass-panel p-6 overflow-y-auto rounded-lg"
                >
                  <h2 className="font-orbitron text-3xl font-bold text-nebula-gold mb-2">
                    {selectedPlanet.name}
                  </h2>
                  <p className="font-exo text-muted-foreground mb-6">
                    {selectedPlanet.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-orbitron text-sm text-nebula-cyan mb-2">Physical Properties</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Diameter:</span>
                          <span className="text-foreground">{selectedPlanet.detailedInfo.diameter}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mass:</span>
                          <span className="text-foreground">{selectedPlanet.detailedInfo.mass}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gravity:</span>
                          <span className="text-foreground">{selectedPlanet.detailedInfo.gravity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Temperature:</span>
                          <span className="text-foreground">{selectedPlanet.detailedInfo.temperature}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-muted pt-4">
                      <h3 className="font-orbitron text-sm text-nebula-cyan mb-2">Orbital Info</h3>
                      <div className="space-y-2">
                        {selectedPlanet.facts.map((fact, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-nebula-cyan flex-shrink-0 mt-0.5" />
                            <span className="font-exo text-sm text-foreground">{fact}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPlanet.moons && selectedPlanet.moons > 0 && (
                      <div className="border-t border-muted pt-4">
                        <h3 className="font-orbitron text-sm text-nebula-cyan mb-2">Moons</h3>
                        <p className="font-exo text-sm text-foreground">
                          {selectedPlanet.name} has <span className="text-nebula-gold font-bold">{selectedPlanet.moons}</span> known {selectedPlanet.moons === 1 ? 'moon' : 'moons'}.
                          {selectedPlanet.moons > 8 && ' (Showing 8 largest in visualization)'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planet list */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-6 z-20 flex gap-2 flex-wrap max-w-md"
      >
        {planetsData.map((planet) => (
          <motion.button
            key={planet.name}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedPlanet(planet);
              setShowDetailedView(true);
              play('click', 0.3);
            }}
            className={`px-3 py-1.5 rounded-full font-exo text-sm transition-all ${
              selectedPlanet?.name === planet.name
                ? 'bg-nebula-cyan text-primary-foreground'
                : 'glass-panel text-foreground hover:text-nebula-cyan'
            }`}
            onMouseEnter={() => !isMuted && play('hover', 0.1)}
          >
            {planet.name}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

export default PlanetsPage;
