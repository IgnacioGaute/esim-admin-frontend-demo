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

// Enhanced Hologram material with better glow
function HologramMaterial({ color, opacity = 0.8, emissive = true }: { color: string; opacity?: number; emissive?: boolean }) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive ? color : undefined}
      emissiveIntensity={emissive ? 0.5 : 0}
      transparent
      opacity={opacity}
      side={THREE.DoubleSide}
    />
  );
}

// ZEUS Avatar - Lightning bolt crown with energy orb (Super Admin)
function ZeusAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const boltsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }
    if (orbRef.current) {
      orbRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
    }
    if (boltsRef.current) {
      boltsRef.current.children.forEach((bolt, i) => {
        (bolt as THREE.Mesh).position.y = 0.35 + Math.sin(t * 4 + i) * 0.05;
      });
    }
  });

  const lightningBolt = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.35);
    shape.lineTo(0.06, 0.2);
    shape.lineTo(0.02, 0.2);
    shape.lineTo(0.1, 0);
    shape.lineTo(0.01, 0.12);
    shape.lineTo(0.06, 0.12);
    shape.lineTo(0, 0.35);
    return shape;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Energy orb at center */}
      <mesh ref={orbRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Crown ring */}
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.02, 8, 32]} />
        <HologramMaterial color={color} />
      </mesh>
      
      {/* Lightning bolts around crown */}
      <group ref={boltsRef}>
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <group key={i} rotation={[0, (angle * Math.PI) / 180, 0]}>
            <mesh position={[0.22, 0.35, 0]} rotation={[0, 0, Math.PI / 8]}>
              <shapeGeometry args={[lightningBolt]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.8}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        ))}
      </group>
      
      {/* Eye symbol */}
      <mesh position={[0, 0, 0.16]}>
        <ringGeometry args={[0.03, 0.06, 16]} />
        <HologramMaterial color={color} />
      </mesh>
    </group>
  );
}

// ARES Avatar - Spartan helmet with animated crest (Admin)
function AresAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const crestRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }
    if (crestRef.current) {
      crestRef.current.children.forEach((segment, i) => {
        const mesh = segment as THREE.Mesh;
        mesh.scale.y = 1 + Math.sin(t * 3 + i * 0.3) * 0.15;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Helmet dome */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.28, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <HologramMaterial color={color} opacity={0.7} />
      </mesh>
      
      {/* Face guard */}
      <mesh position={[0, -0.05, 0.18]}>
        <planeGeometry args={[0.18, 0.28]} />
        <HologramMaterial color={color} opacity={0.5} />
      </mesh>
      
      {/* T-shaped visor */}
      <mesh position={[0, 0.02, 0.25]}>
        <boxGeometry args={[0.22, 0.025, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, -0.05, 0.25]}>
        <boxGeometry args={[0.04, 0.12, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
      
      {/* Animated Mohawk crest */}
      <group ref={crestRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh 
            key={i} 
            position={[0, 0.28 + i * 0.025, -0.08 + i * 0.015]}
            rotation={[0.2, 0, 0]}
          >
            <boxGeometry args={[0.025, 0.18 - i * 0.012, 0.01]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.6 + i * 0.05}
              transparent
              opacity={0.9 - i * 0.02}
            />
          </mesh>
        ))}
      </group>
      
      {/* Cheek guards */}
      <mesh position={[-0.22, -0.08, 0.08]} rotation={[0, 0.4, 0]}>
        <planeGeometry args={[0.12, 0.22]} />
        <HologramMaterial color={color} opacity={0.6} />
      </mesh>
      <mesh position={[0.22, -0.08, 0.08]} rotation={[0, -0.4, 0]}>
        <planeGeometry args={[0.12, 0.22]} />
        <HologramMaterial color={color} opacity={0.6} />
      </mesh>
      
      {/* Helmet ridge */}
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.015, 8, 32, Math.PI]} />
        <HologramMaterial color={color} />
      </mesh>
    </group>
  );
}

// HERMES Avatar - Winged helmet with animated wings (Seller)
function HermesAvatar({ color }: { color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Group>(null);
  const rightWingRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.3;
    }
    // Wing flapping animation
    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = 0.4 + Math.sin(t * 5) * 0.25;
    }
    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = -0.4 - Math.sin(t * 5) * 0.25;
    }
  });

  // Wing feathers
  const createWingFeathers = (isLeft: boolean) => {
    return Array.from({ length: 5 }).map((_, i) => {
      const angle = (i * 15 - 30) * (Math.PI / 180);
      const length = 0.18 - i * 0.02;
      return (
        <mesh
          key={i}
          position={[isLeft ? -0.02 - i * 0.03 : 0.02 + i * 0.03, 0.02 - i * 0.01, 0]}
          rotation={[0, 0, isLeft ? angle : -angle]}
        >
          <planeGeometry args={[0.04, length]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5 + i * 0.1}
            transparent
            opacity={0.9 - i * 0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    });
  };

  return (
    <group ref={groupRef}>
      {/* Helmet cap */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <HologramMaterial color={color} opacity={0.7} />
      </mesh>
      
      {/* Helmet brim */}
      <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <HologramMaterial color={color} opacity={0.6} />
      </mesh>
      
      {/* Left wing */}
      <group ref={leftWingRef} position={[-0.28, 0.1, 0]}>
        {createWingFeathers(true)}
      </group>
      
      {/* Right wing */}
      <group ref={rightWingRef} position={[0.28, 0.1, 0]}>
        {createWingFeathers(false)}
      </group>
      
      {/* Caduceus symbol at center */}
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <HologramMaterial color={color} />
      </mesh>
      
      {/* Snake coils */}
      <mesh position={[-0.04, 0, 0.18]} rotation={[Math.PI / 2, 0, 0.5]}>
        <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
        <HologramMaterial color={color} opacity={0.8} />
      </mesh>
      <mesh position={[0.04, 0, 0.18]} rotation={[Math.PI / 2, 0, -0.5]}>
        <torusGeometry args={[0.05, 0.012, 8, 16, Math.PI]} />
        <HologramMaterial color={color} opacity={0.8} />
      </mesh>
      
      {/* Top orb */}
      <mesh position={[0, 0.1, 0.18]}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

// Scanning ring effect
function ScanRing({ color, radius = 0.5 }: { color: string; radius?: number }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.8;
      ringRef.current.rotation.x = Math.sin(t * 0.5) * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.6;
      ring2Ref.current.rotation.y = Math.sin(t * 0.4) * 0.3;
    }
  });

  return (
    <>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.008, 4, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[radius * 0.85, 0.006, 4, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
        />
      </mesh>
    </>
  );
}

// Enhanced particle effect
function AvatarParticles({ color, count = 50 }: { color: string; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.4 + Math.random() * 0.15;
      const height = (Math.random() - 0.5) * 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      scales[i] = Math.random() * 0.5 + 0.5;
    }
    
    return { positions, scales };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const y = positions[i * 3 + 1];
        positions[i * 3 + 1] = y + Math.sin(state.clock.elapsedTime * 2 + i) * 0.002;
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
        size={0.025}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

// Scene that renders the appropriate god avatar
function GodAvatarScene({ godType, showEffects }: { godType: GodType; showEffects: boolean }) {
  const { identity } = useTronTheme();
  const primaryColor = identity.primary;

  const AvatarComponent = {
    ZEUS: ZeusAvatar,
    ARES: AresAvatar,
    HERMES: HermesAvatar,
  }[godType];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 2]} intensity={0.6} color={primaryColor} />
      <pointLight position={[-2, -1, 1]} intensity={0.3} color={primaryColor} />
      <AvatarComponent color={primaryColor} />
      {showEffects && (
        <>
          <ScanRing color={primaryColor} />
          <AvatarParticles color={primaryColor} />
        </>
      )}
    </>
  );
}

// Keyframe animations
const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 15px currentColor, 0 0 30px currentColor, inset 0 0 15px rgba(0, 0, 0, 0.5);
    filter: brightness(1);
  }
  50% {
    box-shadow: 0 0 25px currentColor, 0 0 50px currentColor, inset 0 0 20px rgba(0, 0, 0, 0.5);
    filter: brightness(1.1);
  }
`;

const scanLine = keyframes`
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const borderRotate = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
`;

const AvatarWrapper = styled(Box)<{ $size: number; $primaryColor: string; $glowLevel: number }>(
  ({ $size, $primaryColor, $glowLevel }) => ({
    position: 'relative',
    width: $size + 6,
    height: $size + 6,
    borderRadius: '50%',
    padding: 3,
    background: $glowLevel > 0 
      ? `linear-gradient(90deg, ${$primaryColor}, transparent, ${$primaryColor}, transparent, ${$primaryColor})`
      : `linear-gradient(90deg, ${$primaryColor}40, ${$primaryColor}80, ${$primaryColor}40)`,
    backgroundSize: '200% 100%',
    animation: $glowLevel > 0 ? `${borderRotate} 3s linear infinite` : 'none',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 1,
      borderRadius: '50%',
      background: 'rgba(10, 10, 18, 0.95)',
      zIndex: 0,
    },
  })
);

const AvatarContainer = styled(Box)<{ $size: number; $primaryColor: string; $glowLevel: number }>(
  ({ $size, $primaryColor, $glowLevel }) => ({
    width: $size,
    height: $size,
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'rgba(10, 10, 18, 0.95)',
    color: $primaryColor,
    animation: $glowLevel > 0 ? `${pulseGlow} 3s ease-in-out infinite` : 'none',
    
    '&::after': $glowLevel > 0 ? {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(to bottom, ${$primaryColor}60, transparent)`,
      animation: `${scanLine} 2.5s ease-in-out infinite`,
      pointerEvents: 'none',
      zIndex: 10,
    } : {},
  })
);

const FallbackAvatar = styled(Box)<{ $primaryColor: string }>(({ $primaryColor }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `radial-gradient(circle at 30% 30%, rgba(${hexToRgb($primaryColor)}, 0.3) 0%, transparent 60%)`,
  color: $primaryColor,
  fontSize: '1.5em',
  fontWeight: 700,
  textShadow: `0 0 10px ${$primaryColor}`,
}));

const GodLabel = styled(Box)<{ $primaryColor: string }>(({ $primaryColor }) => ({
  position: 'absolute',
  bottom: -6,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '8px',
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: $primaryColor,
  textShadow: `0 0 8px ${$primaryColor}`,
  whiteSpace: 'nowrap',
  zIndex: 2,
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
  showLabel?: boolean;
  showEffects?: boolean;
}

export function GodAvatar({ 
  userType, 
  size = 56, 
  fallbackText, 
  showLabel = false,
  showEffects = true 
}: GodAvatarProps) {
  const { identity, glowLevel } = useTronTheme();
  const godType = USER_TYPE_TO_GOD[userType as UserType] || 'HERMES';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <AvatarWrapper $size={size} $primaryColor={identity.primary} $glowLevel={glowLevel}>
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
              camera={{ position: [0, 0, 1.3], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
            >
              <GodAvatarScene godType={godType} showEffects={showEffects && glowLevel > 0} />
            </Canvas>
          </Suspense>
        </AvatarContainer>
      </AvatarWrapper>
      {showLabel && (
        <GodLabel $primaryColor={identity.primary}>
          {godType}
        </GodLabel>
      )}
    </Box>
  );
}

// Export the god type mapping for external use
export { USER_TYPE_TO_GOD };
export type { UserType, GodType };
