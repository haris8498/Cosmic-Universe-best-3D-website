import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidFieldProps {
  count?: number;
  radius?: number;
  thickness?: number;
  position?: [number, number, number];
  rotationSpeed?: number;
}

const AsteroidField = ({ 
  count = 200, 
  radius = 30, 
  thickness = 8,
  position = [0, 0, 0],
  rotationSpeed = 0.1
}: AsteroidFieldProps) => {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate asteroid data
  const asteroidData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: radius + (Math.random() - 0.5) * thickness,
      height: (Math.random() - 0.5) * thickness * 0.5,
      scale: 0.08 + Math.random() * 0.6, // Wider size variation
      rotationSpeed: (Math.random() - 0.5) * 3, // More chaotic tumbling
      rotationAxisX: Math.random() - 0.5,
      rotationAxisY: Math.random() - 0.5,
      rotationAxisZ: Math.random() - 0.5,
      orbitSpeed: 0.015 + Math.random() * 0.04,
      wobbleSpeed: Math.random() * 2 + 1,
      wobbleAmount: Math.random() * 0.3,
    }));
  }, [count, radius, thickness]);

  useFrame((state) => {
    if (!instancedMeshRef.current) return;

    asteroidData.forEach((asteroid, i) => {
      // Update orbit position
      const angle = asteroid.angle + state.clock.elapsedTime * asteroid.orbitSpeed * rotationSpeed;
      
      // Add wobble effect
      const wobbleX = Math.sin(state.clock.elapsedTime * asteroid.wobbleSpeed) * asteroid.wobbleAmount;
      const wobbleY = Math.cos(state.clock.elapsedTime * asteroid.wobbleSpeed * 0.7) * asteroid.wobbleAmount;
      
      dummy.position.set(
        Math.cos(angle) * asteroid.distance + position[0] + wobbleX,
        asteroid.height + Math.sin(state.clock.elapsedTime * asteroid.rotationSpeed * 0.5) * 0.3 + position[1] + wobbleY,
        Math.sin(angle) * asteroid.distance + position[2]
      );
      
      // Chaotic tumbling rotation on multiple axes
      dummy.rotation.x = state.clock.elapsedTime * asteroid.rotationSpeed * asteroid.rotationAxisX;
      dummy.rotation.y = state.clock.elapsedTime * asteroid.rotationSpeed * asteroid.rotationAxisY * 1.3;
      dummy.rotation.z = state.clock.elapsedTime * asteroid.rotationSpeed * asteroid.rotationAxisZ * 0.8;
      
      // Vary scale slightly over time for dynamic effect
      const scaleVariation = 1 + Math.sin(state.clock.elapsedTime * asteroid.wobbleSpeed) * 0.05;
      dummy.scale.setScalar(asteroid.scale * scaleVariation);
      dummy.updateMatrix();
      
      instancedMeshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh 
        ref={instancedMeshRef} 
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
      >
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          color="#6b7280"
          roughness={0.95}
          metalness={0.15}
          emissive="#374151"
          emissiveIntensity={0.08}
        />
      </instancedMesh>
      
      {/* Add some larger, more visible asteroids with different colors */}
      {Array.from({ length: Math.min(20, Math.floor(count / 10)) }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const dist = radius + (Math.random() - 0.5) * thickness;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * dist + position[0],
              (Math.random() - 0.5) * thickness * 0.5 + position[1],
              Math.sin(angle) * dist + position[2],
            ]}
            rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
            scale={0.8 + Math.random() * 0.6}
          >
            <dodecahedronGeometry args={[1, 1]} />
            <meshStandardMaterial 
              color={i % 3 === 0 ? "#8b7355" : i % 3 === 1 ? "#5a6b7a" : "#7a6b5a"}
              roughness={0.9}
              metalness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default AsteroidField;
