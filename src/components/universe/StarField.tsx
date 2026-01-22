import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarFieldProps {
  count?: number;
  radius?: number;
}

const StarField = ({ count = 5000, radius = 100 }: StarFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.cbrt(Math.random());

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      // Random star colors (white, blue-ish, yellow-ish)
      const colorChoice = Math.random();
      if (colorChoice < 0.7) {
        // Mostly white stars
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      } else if (colorChoice < 0.85) {
        // Blue-white stars
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.95;
        colors[i3 + 2] = 1;
      } else {
        // Warm yellow-white stars
        colors[i3] = 1;
        colors[i3 + 1] = 0.98;
        colors[i3 + 2] = 0.9;
      }

      // More realistic star sizes - mostly tiny with few larger ones
      const sizeRandom = Math.random();
      if (sizeRandom < 0.8) {
        sizes[i] = Math.random() * 0.4 + 0.1; // Tiny stars
      } else if (sizeRandom < 0.95) {
        sizes[i] = Math.random() * 0.8 + 0.4; // Medium stars
      } else {
        sizes[i] = Math.random() * 1.2 + 0.8; // Few bright stars
      }
    }

    return [positions, colors, sizes];
  }, [count, radius]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default StarField;
