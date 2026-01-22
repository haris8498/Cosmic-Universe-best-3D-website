import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, Html } from '@react-three/drei';
import * as THREE from 'three';

interface BlackHoleProps {
  position?: [number, number, number];
  size?: number;
  accretionDiskSize?: number;
  gravitationalStrength?: number;
}

const BlackHole = ({ 
  position = [0, 0, 0], 
  size = 3,
  accretionDiskSize = 8,
  gravitationalStrength = 0.5
}: BlackHoleProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Mesh>(null);
  const lensingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const starsRef = useRef<THREE.Points>(null);
  const { camera } = useThree();

  // Accretion disk particles
  const particleData = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = size * 1.5 + Math.random() * accretionDiskSize;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Color gradient from hot (center) to cool (outer)
      const t = (radius - size * 1.5) / accretionDiskSize;
      if (t < 0.3) {
        colors[i3] = 1;
        colors[i3 + 1] = 0.8;
        colors[i3 + 2] = 0.3;
      } else if (t < 0.6) {
        colors[i3] = 1;
        colors[i3 + 1] = 0.4;
        colors[i3 + 2] = 0.1;
      } else {
        colors[i3] = 0.8;
        colors[i3 + 1] = 0.2;
        colors[i3 + 2] = 0.5;
      }

      sizes[i] = 0.05 + Math.random() * 0.15;
    }

    return { positions, colors, sizes, count };
  }, [size, accretionDiskSize]);

  // Stars being pulled into the black hole
  const starData = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spawn stars in a sphere around the black hole
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = accretionDiskSize * 2 + Math.random() * accretionDiskSize;
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      sizes[i] = 0.2 + Math.random() * 0.3;
      
      // Star colors (white to yellow)
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        colors[i3] = 1;
        colors[i3 + 1] = 1;
        colors[i3 + 2] = 1;
      } else {
        colors[i3] = 1;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 0.6;
      }

      lifetimes[i] = Math.random() * 100;
    }

    return { positions, velocities, sizes, colors, lifetimes, count };
  }, [size, accretionDiskSize]);

  // Gravitational lensing shader
  const lensingMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        strength: { value: gravitationalStrength },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float strength;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create distortion effect
          float distortion = strength / (dist + 0.1);
          float alpha = smoothstep(0.5, 0.2, dist) * 0.3;
          
          // Shimmer effect
          float shimmer = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
          
          vec3 color = mix(
            vec3(0.1, 0.0, 0.2),
            vec3(0.5, 0.2, 0.8),
            shimmer * distortion
          );
          
          // Edge glow
          float edge = smoothstep(0.3, 0.35, dist) * smoothstep(0.5, 0.45, dist);
          color += vec3(0.8, 0.4, 1.0) * edge * 2.0;
          
          gl_FragColor = vec4(color, alpha + edge * 0.5);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }, [gravitationalStrength]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }

    if (diskRef.current) {
      diskRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }

    if (lensingRef.current) {
      (lensingRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.elapsedTime;
      lensingRef.current.lookAt(camera.position);
    }

    // Animate accretion disk particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleData.count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const z = positions[i3 + 2];
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        
        // Orbital velocity (faster closer to center)
        const speed = 0.5 / (radius * 0.1);
        const newAngle = angle + speed * 0.01;
        
        positions[i3] = Math.cos(newAngle) * radius;
        positions[i3 + 2] = Math.sin(newAngle) * radius;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Animate stars being pulled into black hole
    if (starsRef.current) {
      const positions = starsRef.current.geometry.attributes.position.array as Float32Array;
      const sizes = starsRef.current.geometry.attributes.size.array as Float32Array;
      const velocities = starData.velocities;
      const lifetimes = starData.lifetimes;

      for (let i = 0; i < starData.count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        const distanceToCenter = Math.sqrt(x * x + y * y + z * z);
        
        // Check if star reached the event horizon
        if (distanceToCenter < size * 1.5) {
          // Respawn star at random outer position
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);
          const radius = accretionDiskSize * 2 + Math.random() * accretionDiskSize;
          
          positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[i3 + 2] = radius * Math.cos(phi);
          
          velocities[i3] = 0;
          velocities[i3 + 1] = 0;
          velocities[i3 + 2] = 0;
          
          sizes[i] = 0.2 + Math.random() * 0.3;
          lifetimes[i] = 0;
        } else {
          // Calculate gravitational pull (inverse square law)
          const forceMagnitude = (gravitationalStrength * 0.5) / (distanceToCenter * distanceToCenter);
          
          // Direction towards black hole
          const dirX = -x / distanceToCenter;
          const dirY = -y / distanceToCenter;
          const dirZ = -z / distanceToCenter;
          
          // Apply gravitational acceleration
          velocities[i3] += dirX * forceMagnitude * 0.1;
          velocities[i3 + 1] += dirY * forceMagnitude * 0.1;
          velocities[i3 + 2] += dirZ * forceMagnitude * 0.1;
          
          // Add orbital component (tangential velocity)
          const orbitalSpeed = Math.sqrt(forceMagnitude / distanceToCenter) * 2;
          velocities[i3] += -dirZ * orbitalSpeed * 0.5;
          velocities[i3 + 2] += dirX * orbitalSpeed * 0.5;
          
          // Apply velocity damping
          velocities[i3] *= 0.99;
          velocities[i3 + 1] *= 0.99;
          velocities[i3 + 2] *= 0.99;
          
          // Update positions
          positions[i3] += velocities[i3];
          positions[i3 + 1] += velocities[i3 + 1];
          positions[i3 + 2] += velocities[i3 + 2];
          
          // Shrink stars as they get closer (spaghettification effect)
          const normalizedDist = distanceToCenter / (accretionDiskSize * 3);
          sizes[i] = (0.2 + Math.random() * 0.1) * Math.max(0.1, normalizedDist);
          
          lifetimes[i] += 1;
        }
      }
      
      starsRef.current.geometry.attributes.position.needsUpdate = true;
      starsRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Event horizon (pure black sphere) */}
      <mesh>
        <sphereGeometry args={[size, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Photon sphere glow */}
      <mesh>
        <sphereGeometry args={[size * 1.1, 64, 64]} />
        <meshBasicMaterial 
          color="#4c1d95" 
          transparent 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Gravitational lensing effect */}
      <mesh ref={lensingRef}>
        <planeGeometry args={[size * 8, size * 8]} />
        <primitive object={lensingMaterial} attach="material" />
      </mesh>

      {/* Accretion disk particles */}
      <Float speed={0.5} rotationIntensity={0.1}>
        <points ref={particlesRef} rotation={[Math.PI / 2 * 0.8, 0, 0]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleData.count}
              array={particleData.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={particleData.count}
              array={particleData.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.15}
            vertexColors
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      </Float>

      {/* Stars being pulled into the black hole */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starData.count}
            array={starData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starData.count}
            array={starData.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starData.count}
            array={starData.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.3}
          vertexColors
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Inner glow ring */}
      <mesh rotation={[Math.PI / 2 * 0.8, 0, 0]}>
        <ringGeometry args={[size * 1.2, size * 1.5, 64]} />
        <meshBasicMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow rings */}
      {[1.8, 2.5, 3.5].map((multiplier, i) => (
        <mesh key={i} rotation={[Math.PI / 2 * 0.8, 0, 0]}>
          <ringGeometry args={[size * multiplier, size * (multiplier + 0.2), 64]} />
          <meshBasicMaterial 
            color={i === 0 ? "#f97316" : i === 1 ? "#dc2626" : "#7c3aed"} 
            transparent 
            opacity={0.3 - i * 0.08}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Label */}
      <Html center distanceFactor={20} position={[0, size * 3, 0]}>
        <div className="glass-panel px-4 py-2 text-center">
          <span className="font-orbitron text-sm text-nebula-magenta">Black Hole</span>
          <p className="font-exo text-xs text-muted-foreground">Gravitational Singularity</p>
        </div>
      </Html>
    </group>
  );
};

export default BlackHole;
