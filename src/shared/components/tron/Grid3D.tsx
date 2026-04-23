import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, styled } from '@mui/material';
import * as THREE from 'three';
import { useTronTheme } from '@/theme/TronThemeContext';

function hexToThreeColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

// Grid floor with perspective effect
function GridFloor({ color, glowLevel }: { color: string; glowLevel: number }) {
  const gridRef = useRef<THREE.GridHelper>(null);
  const threeColor = useMemo(() => hexToThreeColor(color), [color]);

  useFrame((state) => {
    if (gridRef.current) {
      // Subtle pulsing animation
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 0.9;
      gridRef.current.material.opacity = 0.3 * pulse * (glowLevel > 0 ? glowLevel : 0.5);
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[100, 50, threeColor, threeColor]}
      position={[0, -2, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

// Floating particles system
function FloatingParticles({ color, count = 200, glowLevel }: { color: string; count?: number; glowLevel: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: number[] = [];
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 20 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities.push(0.01 + Math.random() * 0.02);
    }
    
    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += particles.velocities[i];
        
        if (positions[i * 3 + 1] > 15) {
          positions[i * 3 + 1] = -5;
          positions[i * 3] = (Math.random() - 0.5) * 40;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y += 0.0003;
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
        size={0.08}
        transparent
        opacity={0.6 * (glowLevel > 0 ? glowLevel : 0.5)}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Vertical light beams
function LightBeams({ color, glowLevel }: { color: string; glowLevel: number }) {
  const beamsRef = useRef<THREE.Group>(null);
  
  const beams = useMemo(() => {
    const beamData = [];
    const beamCount = 8;
    
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2;
      const radius = 15 + Math.random() * 10;
      beamData.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 20 + Math.random() * 15,
        width: 0.05 + Math.random() * 0.1,
        speed: 0.5 + Math.random() * 0.5,
      });
    }
    
    return beamData;
  }, []);

  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.children.forEach((beam, index) => {
        const mesh = beam as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        const pulse = Math.sin(state.clock.elapsedTime * beams[index].speed + index) * 0.3 + 0.7;
        material.opacity = 0.15 * pulse * (glowLevel > 0 ? glowLevel : 0.5);
      });
    }
  });

  return (
    <group ref={beamsRef}>
      {beams.map((beam, index) => (
        <mesh key={index} position={[beam.x, beam.height / 2 - 2, beam.z]}>
          <cylinderGeometry args={[beam.width, beam.width, beam.height, 8]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// Horizon glow effect
function HorizonGlow({ color, glowLevel }: { color: string; glowLevel: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.3) * 0.2 + 0.8;
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 * pulse * (glowLevel > 0 ? glowLevel : 0.5);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -1.5, -30]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 30]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// 3D Scene component
function Grid3DScene() {
  const { identity, glowLevel } = useTronTheme();
  const primaryColor = identity.primary;

  return (
    <>
      <ambientLight intensity={0.1} />
      <fog attach="fog" args={['#0A0A0F', 5, 50]} />
      
      <GridFloor color={primaryColor} glowLevel={glowLevel} />
      <FloatingParticles color={primaryColor} count={150} glowLevel={glowLevel} />
      <LightBeams color={primaryColor} glowLevel={glowLevel} />
      <HorizonGlow color={primaryColor} glowLevel={glowLevel} />
    </>
  );
}

const Grid3DContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 0,
  pointerEvents: 'none',
  background: 'linear-gradient(180deg, #0A0A0F 0%, #0D0D15 100%)',
});

export function Grid3D() {
  return (
    <Grid3DContainer>
      <Canvas
        camera={{ position: [0, 5, 15], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Grid3DScene />
      </Canvas>
    </Grid3DContainer>
  );
}
