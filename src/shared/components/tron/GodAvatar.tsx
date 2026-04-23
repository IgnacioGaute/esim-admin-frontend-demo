import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, styled, keyframes } from '@mui/material';
import * as THREE from 'three';
import { useTronTheme } from '@/theme/TronThemeContext';

// User type to God mapping
type UserType = 'SUPER_ADMIN' | 'ADMIN' | 'SELLER';
type GodType = 'ZEUS' | 'ARES' | 'HERMES';

const USER_TYPE_TO_GOD: Record<UserType, GodType> = {
  SUPER_ADMIN: 'ZEUS',
  ADMIN: 'ARES',
  SELLER: 'HERMES',
};

// Hologram material effect
function HologramMaterial({ color, opacity = 0.8 }: { color: string; opacity?: number }) {
  return (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
      blending={THREE.AdditiveBlending}
    />
  );
}

// ZEUS Avatar - Lightning bolt crown (Super Admin)
function ZeusAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  const lightningBolt = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.4);
    shape.lineTo(0.08, 0.25);
    shape.lineTo(0.03, 0.25);
    shape.lineTo(0.12, 0);
    shape.lineTo(0.02, 0.15);
    shape.lineTo(0.08, 0.15);
    shape.lineTo(0, 0.4);
    return shape;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Crown base - circular band */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.02, 8, 24]} />
        <HologramMaterial color={color} />
      </mesh>
      
      {/* Lightning bolts around crown */}
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
          <mesh position={[0.25, 0.25, 0]} rotation={[0, 0, Math.PI / 12]}>
            <shapeGeometry args={[lightningBolt]} />
            <HologramMaterial color={color} />
          </mesh>
        </group>
      ))}
      
      {/* Central orb - all-seeing eye */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <HologramMaterial color={color} opacity={0.5} />
      </mesh>
      
      {/* Inner eye */}
      <mesh position={[0, 0, 0.08]}>
        <circleGeometry args={[0.04, 16]} />
        <HologramMaterial color={color} />
      </mesh>
    </group>
  );
}

// ARES Avatar - Spartan helmet (Admin)
function AresAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Helmet dome */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <HologramMaterial color={color} opacity={0.6} />
      </mesh>
      
      {/* Face plate */}
      <mesh position={[0, -0.05, 0.15]}>
        <planeGeometry args={[0.15, 0.25]} />
        <HologramMaterial color={color} opacity={0.4} />
      </mesh>
      
      {/* Eye slits */}
      <mesh position={[-0.06, 0.02, 0.22]}>
        <boxGeometry args={[0.08, 0.02, 0.01]} />
        <HologramMaterial color={color} />
      </mesh>
      <mesh position={[0.06, 0.02, 0.22]}>
        <boxGeometry args={[0.08, 0.02, 0.01]} />
        <HologramMaterial color={color} />
      </mesh>
      
      {/* Mohawk crest */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[0, 0.2 + i * 0.03, -0.05 + i * 0.02]}
          rotation={[0.3, 0, 0]}
        >
          <boxGeometry args={[0.02, 0.15 - i * 0.015, 0.01]} />
          <HologramMaterial color={color} />
        </mesh>
      ))}
      
      {/* Cheek guards */}
      <mesh position={[-0.2, -0.08, 0.05]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[0.1, 0.2]} />
        <HologramMaterial color={color} opacity={0.5} />
      </mesh>
      <mesh position={[0.2, -0.08, 0.05]} rotation={[0, -0.3, 0]}>
        <planeGeometry args={[0.1, 0.2]} />
        <HologramMaterial color={color} opacity={0.5} />
      </mesh>
    </group>
  );
}

// HERMES Avatar - Winged sandal/caduceus (Seller/User)
function HermesAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const wingsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (wingsRef.current) {
      // Wing flapping animation
      wingsRef.current.children.forEach((wing, i) => {
        const mesh = wing as THREE.Mesh;
        mesh.rotation.z = Math.sin(state.clock.elapsedTime * 4 + i * Math.PI) * 0.15 + (i === 0 ? 0.5 : -0.5);
      });
    }
  });

  // Wing shape
  const wingShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.15, 0.1, 0.25, 0);
    shape.quadraticCurveTo(0.2, 0.05, 0.18, 0.12);
    shape.quadraticCurveTo(0.12, 0.08, 0.1, 0.15);
    shape.quadraticCurveTo(0.06, 0.1, 0, 0.08);
    shape.lineTo(0, 0);
    return shape;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Central caduceus staff */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <HologramMaterial color={color} />
      </mesh>
      
      {/* Winged cap */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <HologramMaterial color={color} opacity={0.6} />
      </mesh>
      
      {/* Wings on helmet */}
      <group ref={wingsRef}>
        <mesh position={[-0.12, 0.18, 0]} rotation={[0, 0, 0.5]}>
          <shapeGeometry args={[wingShape]} />
          <HologramMaterial color={color} />
        </mesh>
        <mesh position={[0.12, 0.18, 0]} rotation={[0, Math.PI, -0.5]} scale={[-1, 1, 1]}>
          <shapeGeometry args={[wingShape]} />
          <HologramMaterial color={color} />
        </mesh>
      </group>
      
      {/* Intertwined snakes (simplified) */}
      <mesh position={[-0.05, -0.05, 0.03]} rotation={[0, 0, 0.5]}>
        <torusGeometry args={[0.08, 0.015, 8, 12, Math.PI]} />
        <HologramMaterial color={color} opacity={0.7} />
      </mesh>
      <mesh position={[0.05, -0.05, 0.03]} rotation={[0, 0, -0.5]}>
        <torusGeometry args={[0.08, 0.015, 8, 12, Math.PI]} />
        <HologramMaterial color={color} opacity={0.7} />
      </mesh>
      
      {/* Top orb */}
      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <HologramMaterial color={color} />
      </mesh>
    </group>
  );
}

// Rotating ring effect around avatar
function AvatarRing({ color, radius = 0.4 }: { color: string; radius?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.008, 8, 48]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Particle effect around avatar
function AvatarParticles({ color, count = 30 }: { color: string; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.35 + Math.random() * 0.1;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.02}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Scene that renders the appropriate god avatar
function GodAvatarScene({ godType }: { godType: GodType }) {
  const { identity, glowLevel } = useTronTheme();
  const primaryColor = identity.primary;

  const AvatarComponent = {
    ZEUS: ZeusAvatar,
    ARES: AresAvatar,
    HERMES: HermesAvatar,
  }[godType];

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[2, 2, 2]} intensity={0.5} />
      <AvatarComponent color={primaryColor} />
      {glowLevel > 0 && (
        <>
          <AvatarRing color={primaryColor} />
          <AvatarParticles color={primaryColor} />
        </>
      )}
    </>
  );
}

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
  }
  50% {
    box-shadow: 0 0 15px currentColor, 0 0 30px currentColor;
  }
`;

const AvatarContainer = styled(Box)<{ $size: number; $primaryColor: string; $glowLevel: number }>(
  ({ $size, $primaryColor, $glowLevel }) => ({
    width: $size,
    height: $size,
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    border: `2px solid ${$primaryColor}`,
    backgroundColor: 'rgba(10, 10, 18, 0.9)',
    color: $primaryColor,
    animation: $glowLevel > 0 ? `${pulseGlow} 3s ease-in-out infinite` : 'none',
    boxShadow: $glowLevel > 0 
      ? `0 0 ${10 * $glowLevel}px ${$primaryColor}, inset 0 0 ${10 * $glowLevel}px rgba(0, 0, 0, 0.5)`
      : 'none',
  })
);

const FallbackAvatar = styled(Box)<{ $primaryColor: string }>(({ $primaryColor }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `radial-gradient(circle, rgba(${hexToRgb($primaryColor)}, 0.2) 0%, transparent 70%)`,
  color: $primaryColor,
  fontSize: '1.5em',
  fontWeight: 700,
}));

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

interface GodAvatarProps {
  userType: string;
  size?: number;
  fallbackText?: string;
}

export function GodAvatar({ userType, size = 48, fallbackText }: GodAvatarProps) {
  const { identity, glowLevel } = useTronTheme();
  const godType = USER_TYPE_TO_GOD[userType as UserType] || 'HERMES';

  return (
    <AvatarContainer 
      $size={size} 
      $primaryColor={identity.primary}
      $glowLevel={glowLevel}
    >
      <Suspense 
        fallback={
          <FallbackAvatar $primaryColor={identity.primary}>
            {fallbackText?.charAt(0).toUpperCase() || godType.charAt(0)}
          </FallbackAvatar>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 1.2], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <GodAvatarScene godType={godType} />
        </Canvas>
      </Suspense>
    </AvatarContainer>
  );
}

// Export the god type mapping for external use
export { USER_TYPE_TO_GOD };
export type { UserType, GodType };
