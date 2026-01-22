import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, Stars } from '@react-three/drei';
import AnimatedUniverse from './AnimatedUniverse';

interface UniverseSceneProps {
  showText?: boolean;
  enableControls?: boolean;
  intensity?: number;
  className?: string;
}

const UniverseScene = ({ 
  showText = true, 
  enableControls = false,
  intensity = 1,
  className = ''
}: UniverseSceneProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <AnimatedUniverse showText={showText} intensity={intensity} />
          <Stars
            radius={100}
            depth={50}
            count={1000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
          {enableControls && (
            <OrbitControls
              enableZoom={true}
              enablePan={true}
              enableRotate={true}
              zoomSpeed={0.5}
              autoRotate
              autoRotateSpeed={0.5}
            />
          )}
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default UniverseScene;
