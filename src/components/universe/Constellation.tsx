import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface ConstellationProps {
  name: string;
  stars: [number, number, number][];
  connections: [number, number][];
  position: [number, number, number];
  scale?: number;
  onClick?: () => void;
}

const Constellation = ({ 
  name, 
  stars, 
  connections, 
  position, 
  scale = 1,
  onClick 
}: ConstellationProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Create line geometry for connections
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    connections.forEach(([from, to]) => {
      points.push(new THREE.Vector3(...stars[from]));
      points.push(new THREE.Vector3(...stars[to]));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [stars, connections]);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      
      // Glow pulse when hovered
      if (hovered) {
        groupRef.current.scale.setScalar(scale * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.05));
      }
    }
  });

  const handleClick = () => {
    setClicked(true);
    onClick?.();
    setTimeout(() => setClicked(false), 1000);
  };

  return (
    <group 
      ref={groupRef} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Stars */}
      {stars.map((star, i) => (
        <mesh key={i} position={star}>
          <sphereGeometry args={[0.15 * scale, 16, 16]} />
          <meshBasicMaterial 
            color={hovered ? "#ffd700" : "#ffffff"} 
            transparent 
            opacity={hovered ? 1 : 0.8}
          />
          {/* Star glow */}
          <mesh>
            <sphereGeometry args={[0.3 * scale, 16, 16]} />
            <meshBasicMaterial 
              color={hovered ? "#ffd700" : "#00d4ff"} 
              transparent 
              opacity={hovered ? 0.5 : 0.2}
            />
          </mesh>
        </mesh>
      ))}

      {/* Connection lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial 
          color={hovered ? "#ffd700" : "#00d4ff"} 
          transparent 
          opacity={hovered ? 0.8 : 0.4}
          linewidth={2}
        />
      </lineSegments>

      {/* Label */}
      {hovered && (
        <Html center distanceFactor={15} position={[0, 3 * scale, 0]}>
          <div className="glass-panel px-4 py-2 whitespace-nowrap animate-fade-in">
            <span className="font-orbitron text-sm text-nebula-gold">{name}</span>
            <p className="font-exo text-xs text-muted-foreground">Click to discover</p>
          </div>
        </Html>
      )}

      {/* Click effect */}
      {clicked && (
        <mesh>
          <ringGeometry args={[2 * scale, 4 * scale, 32]} />
          <meshBasicMaterial 
            color="#ffd700" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

// Predefined constellations
export const CONSTELLATIONS = {
  orion: {
    name: 'Orion',
    stars: [
      [0, 2, 0], [1, 1.5, 0], [-1, 1.5, 0], // shoulders + head
      [0.5, 0, 0], [-0.5, 0, 0], // belt
      [1, -2, 0], [-1, -2, 0], // feet
    ] as [number, number, number][],
    connections: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 6]] as [number, number][],
  },
  bigDipper: {
    name: 'Big Dipper',
    stars: [
      [0, 0, 0], [1.5, 0.3, 0], [3, 0.5, 0], [4.5, 0.2, 0], // handle
      [5.5, -0.5, 0], [5.3, -1.5, 0], [4, -1.3, 0], // cup
    ] as [number, number, number][],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] as [number, number][],
  },
  cassiopeia: {
    name: 'Cassiopeia',
    stars: [
      [0, 0, 0], [1, 1, 0], [2, 0.5, 0], [3, 1.5, 0], [4, 0.8, 0],
    ] as [number, number, number][],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4]] as [number, number][],
  },
  scorpius: {
    name: 'Scorpius',
    stars: [
      [0, 0, 0], [0.5, -1, 0], [1, -2, 0], [1.8, -2.5, 0], // body
      [2.5, -2, 0], [3, -1.5, 0], // tail curve
      [-0.5, 0.5, 0], [0.5, 0.5, 0], // claws
    ] as [number, number, number][],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [0, 7]] as [number, number][],
  },
};

export default Constellation;
