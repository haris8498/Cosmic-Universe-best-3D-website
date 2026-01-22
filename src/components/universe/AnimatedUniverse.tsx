import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import StarField from './StarField';
import Planet from './Planet';

interface AnimatedUniverseProps {
  showText?: boolean;
  intensity?: number;
}

const AnimatedUniverse = ({ showText = true, intensity = 1 }: AnimatedUniverseProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff00ff" />
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffd700" />

      {/* Star field */}
      <StarField count={3000 * intensity} radius={80} />

      {/* Planets */}
      <group ref={groupRef}>
        <Planet
          position={[-8, 2, -10]}
          size={1.5}
          color="#3b82f6"
          emissiveColor="#1d4ed8"
          orbitRadius={5}
          orbitSpeed={0.3}
          hasRing
          ringColor="#60a5fa"
        />
        <Planet
          position={[10, -3, -15]}
          size={2}
          color="#8b5cf6"
          emissiveColor="#7c3aed"
          orbitRadius={8}
          orbitSpeed={0.2}
        />
        <Planet
          position={[5, 5, -20]}
          size={1}
          color="#f97316"
          emissiveColor="#ea580c"
          orbitRadius={3}
          orbitSpeed={0.5}
        />
        <Planet
          position={[-12, -5, -25]}
          size={2.5}
          color="#14b8a6"
          emissiveColor="#0d9488"
          orbitRadius={6}
          orbitSpeed={0.15}
          hasRing
          ringColor="#2dd4bf"
        />
        <Planet
          position={[0, 0, -30]}
          size={3}
          color="#ec4899"
          emissiveColor="#db2777"
          orbitRadius={0}
          orbitSpeed={0}
        />
      </group>

      {/* Floating 3D Text */}
      {showText && (
        <Float
          speed={2}
          rotationIntensity={0.2}
          floatIntensity={0.5}
        >
          <Center position={[0, 0, -5]}>
            <Text3D
              font="/fonts/helvetiker_bold.typeface.json"
              size={1.5}
              height={0.3}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.02}
              bevelSize={0.02}
              bevelOffset={0}
              bevelSegments={5}
            >
              UNIVERSE
              <meshStandardMaterial
                color="#00d4ff"
                emissive="#00d4ff"
                emissiveIntensity={0.8}
                metalness={0.8}
                roughness={0.2}
              />
            </Text3D>
          </Center>
        </Float>
      )}
    </>
  );
};

export default AnimatedUniverse;
