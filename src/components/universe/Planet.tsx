import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  position: [number, number, number];
  size: number;
  color: string;
  emissiveColor?: string;
  orbitRadius?: number;
  orbitSpeed?: number;
  rotationSpeed?: number;
  hasRing?: boolean;
  ringColor?: string;
  glowIntensity?: number;
}

const Planet = ({
  position,
  size,
  color,
  emissiveColor,
  orbitRadius = 0,
  orbitSpeed = 0.5,
  rotationSpeed = 0.01,
  hasRing = false,
  ringColor = '#ffffff',
  glowIntensity = 0.5,
}: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed;
    }

    if (groupRef.current && orbitRadius > 0) {
      const angle = initialAngle + state.clock.elapsedTime * orbitSpeed;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius + position[0];
      groupRef.current.position.z = Math.sin(angle) * orbitRadius + position[2];
    }

    if (ringRef.current) {
      ringRef.current.rotation.z += 0.001;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Planet glow */}
      <Sphere args={[size * 1.2, 32, 32]}>
        <meshBasicMaterial
          color={emissiveColor || color}
          transparent
          opacity={glowIntensity * 0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main planet */}
      <Sphere ref={meshRef} args={[size, 64, 64]}>
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor || color}
          emissiveIntensity={glowIntensity}
          roughness={0.7}
          metalness={0.3}
        />
      </Sphere>

      {/* Ring */}
      {hasRing && (
        <Ring
          ref={ringRef}
          args={[size * 1.4, size * 2, 64]}
          rotation={[Math.PI / 2.5, 0, 0]}
        >
          <meshBasicMaterial
            color={ringColor}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}
    </group>
  );
};

export default Planet;
