import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Box, styled, Typography, keyframes } from '@mui/material';
import * as THREE from 'three';
import { useTronTheme } from '@/theme/TronThemeContext';

// Tunnel ring component
function TunnelRing({ 
  radius, 
  position, 
  color, 
  opacity,
  rotationSpeed 
}: { 
  radius: number; 
  position: [number, number, number]; 
  color: string;
  opacity: number;
  rotationSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[radius, 0.02, 8, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Tunnel with multiple rings creating depth effect
function TunnelEffect({ color, glowLevel }: { color: string; glowLevel: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const rings = useMemo(() => {
    const ringData = [];
    const ringCount = 40;
    
    for (let i = 0; i < ringCount; i++) {
      const z = -i * 2;
      const baseRadius = 1 + Math.sin(i * 0.3) * 0.3;
      ringData.push({
        z,
        radius: baseRadius,
        opacity: Math.max(0.1, 1 - (i / ringCount) * 0.8),
        rotationSpeed: (i % 2 === 0 ? 1 : -1) * (0.2 + Math.random() * 0.3),
      });
    }
    
    return ringData;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Move rings toward camera creating infinite tunnel effect
      groupRef.current.position.z = (state.clock.elapsedTime * 5) % 2;
    }
    
    // Subtle camera movement
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, index) => (
        <TunnelRing
          key={index}
          radius={ring.radius}
          position={[0, 0, ring.z]}
          color={color}
          opacity={ring.opacity * (glowLevel > 0 ? glowLevel * 0.5 : 0.3)}
          rotationSpeed={ring.rotationSpeed}
        />
      ))}
    </group>
  );
}

// Particle stream flying through tunnel
function ParticleStream({ color, glowLevel }: { color: string; glowLevel: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 500;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 0.8;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = -Math.random() * 80;
      speeds.push(0.3 + Math.random() * 0.5);
    }
    
    return { positions, speeds };
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += particles.speeds[i];
        
        if (positions[i * 3 + 2] > 2) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 0.5 + Math.random() * 0.8;
          positions[i * 3] = Math.cos(angle) * radius;
          positions[i * 3 + 1] = Math.sin(angle) * radius;
          positions[i * 3 + 2] = -80;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.03}
        transparent
        opacity={0.8 * (glowLevel > 0 ? glowLevel : 0.5)}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Core glow at center
function CoreGlow({ color, glowLevel }: { color: string; glowLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.5 * pulse * (glowLevel > 0 ? glowLevel : 0.5);
      meshRef.current.scale.setScalar(1 + pulse * 0.2);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -60]}>
      <circleGeometry args={[0.5, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// 3D Scene component
function TunnelScene() {
  const { identity, glowLevel } = useTronTheme();
  const primaryColor = identity.primary;

  return (
    <>
      <fog attach="fog" args={['#000000', 1, 60]} />
      <TunnelEffect color={primaryColor} glowLevel={glowLevel} />
      <ParticleStream color={primaryColor} glowLevel={glowLevel} />
      <CoreGlow color={primaryColor} glowLevel={glowLevel} />
    </>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
`;

const TunnelContainer = styled(Box)<{ $isExiting: boolean; $primaryColor: string }>(
  ({ $isExiting, $primaryColor }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    background: '#000000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `${$isExiting ? fadeOut : fadeIn} 0.5s ease-out forwards`,
  })
);

const LoadingText = styled(Typography)<{ $primaryColor: string }>(({ $primaryColor }) => ({
  position: 'absolute',
  bottom: '15%',
  color: $primaryColor,
  fontSize: '14px',
  fontWeight: 600,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  animation: `${pulse} 2s ease-in-out infinite`,
  textShadow: `0 0 20px ${$primaryColor}`,
}));

const ProgressBar = styled(Box)<{ $primaryColor: string; $progress: number }>(
  ({ $primaryColor, $progress }) => ({
    position: 'absolute',
    bottom: '10%',
    width: '200px',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '1px',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      width: `${$progress}%`,
      backgroundColor: $primaryColor,
      boxShadow: `0 0 10px ${$primaryColor}`,
      transition: 'width 0.3s ease',
    },
  })
);

interface TunnelLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
  minDuration?: number;
}

export function TunnelLoader({ 
  isLoading, 
  onComplete, 
  minDuration = 2000 
}: TunnelLoaderProps) {
  const { identity } = useTronTheme();
  const [show, setShow] = useState(isLoading);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setIsExiting(false);
      startTimeRef.current = Date.now();
      setProgress(0);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && show) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDuration - elapsed);
      
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 100));
      }, remaining / 20);

      const timer = setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        setIsExiting(true);
        
        setTimeout(() => {
          setShow(false);
          onComplete?.();
        }, 500);
      }, remaining);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isLoading, show, minDuration, onComplete]);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 80));
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!show) return null;

  return (
    <TunnelContainer $isExiting={isExiting} $primaryColor={identity.primary}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%' 
        }}
      >
        <TunnelScene />
      </Canvas>
      <LoadingText $primaryColor={identity.primary}>
        INITIALIZING SYSTEM
      </LoadingText>
      <ProgressBar $primaryColor={identity.primary} $progress={progress} />
    </TunnelContainer>
  );
}
