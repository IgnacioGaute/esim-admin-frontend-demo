// Tron Identity Theme Configurations
export type IdentityName = 'TRON' | 'ARES' | 'CLU' | 'ATHENA' | 'APHRODITE' | 'POSEIDON';

export interface Identity {
  name: IdentityName;
  displayName: string;
  primary: string;
  secondary: string;
  glow: string;
  accent: string;
  description: string;
}

export const IDENTITIES: Record<IdentityName, Identity> = {
  TRON: {
    name: 'TRON',
    displayName: 'Tron',
    primary: '#00FFFF',
    secondary: '#0088FF',
    glow: '#00FFFF',
    accent: '#00D4FF',
    description: 'Classic neon blue',
  },
  ARES: {
    name: 'ARES',
    displayName: 'Ares',
    primary: '#FF4136',
    secondary: '#FF6B00',
    glow: '#FF4136',
    accent: '#FF5722',
    description: 'Warrior red',
  },
  CLU: {
    name: 'CLU',
    displayName: 'Clu',
    primary: '#FFB700',
    secondary: '#FF8C00',
    glow: '#FFB700',
    accent: '#FFA000',
    description: 'Antagonist orange',
  },
  ATHENA: {
    name: 'ATHENA',
    displayName: 'Athena',
    primary: '#FFD700',
    secondary: '#DAA520',
    glow: '#FFD700',
    accent: '#FFC107',
    description: 'Wisdom gold',
  },
  APHRODITE: {
    name: 'APHRODITE',
    displayName: 'Aphrodite',
    primary: '#FF69B4',
    secondary: '#DA70D6',
    glow: '#FF69B4',
    accent: '#FF1493',
    description: 'Divine pink',
  },
  POSEIDON: {
    name: 'POSEIDON',
    displayName: 'Poseidon',
    primary: '#20B2AA',
    secondary: '#008B8B',
    glow: '#20B2AA',
    accent: '#00CED1',
    description: 'Ocean teal',
  },
};

export const IDENTITY_LIST = Object.values(IDENTITIES);

// Glow intensity levels
export type GlowLevel = 0 | 1 | 2 | 3;

export const GLOW_LEVELS: { level: GlowLevel; label: string; multiplier: number }[] = [
  { level: 0, label: 'OFF', multiplier: 0 },
  { level: 1, label: 'LOW', multiplier: 0.5 },
  { level: 2, label: 'MED', multiplier: 1 },
  { level: 3, label: 'HIGH', multiplier: 1.5 },
];
