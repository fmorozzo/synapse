/**
 * Camelot Wheel Utilities
 * 
 * Provides harmonic key matching for DJ mixing using the Camelot wheel system.
 * Compatible keys allow smooth harmonic transitions between tracks.
 */

// ============================================
// CAMELOT WHEEL REFERENCE
// ============================================
/**
 * Camelot Wheel Layout:
 * 
 *        12A(Am)      12B(C)
 *     11A(Em)  1A(Bm)  1B(D)  2B(E)
 *   10A(Dm)  9A(F#m)  2A(F#m) 3B(F)
 *     9A(Gm)  8A(Cm)  3A(G#m) 4B(G#)
 *        8A(Cm)       4A(Ebm)  5B(Bb)
 *     7A(Fm)  6A(Bbm) 5A(C#m) 6B(Db)
 *        7B(F)        6B(Db)
 * 
 * Compatible Keys:
 * - Same key (e.g., 5A → 5A)
 * - +1 on wheel (e.g., 5A → 6A)
 * - -1 on wheel (e.g., 5A → 4A)
 * - Same number, different letter (e.g., 5A → 5B) - relative major/minor
 */

export const CAMELOT_KEYS = [
  '1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A',
  '1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B',
] as const;

export type CamelotKey = typeof CAMELOT_KEYS[number];

// ============================================
// HARMONIC COMPATIBILITY
// ============================================

/**
 * Get harmonically compatible keys for mixing
 * @param key - Current track key in Camelot notation (e.g., "5A")
 * @returns Array of compatible keys with compatibility type
 */
export function getCompatibleKeys(key: string): Array<{ key: string; compatibility: string }> {
  if (!key) return [];
  
  const upperKey = key.toUpperCase();
  const matches = upperKey.match(/(\d+)([AB])/);
  
  if (!matches) return [];
  
  const number = parseInt(matches[1]);
  const letter = matches[2];
  
  const compatible: Array<{ key: string; compatibility: string }> = [];
  
  // Same key (perfect match)
  compatible.push({ key: upperKey, compatibility: 'Perfect (same key)' });
  
  // Relative major/minor (same number, different letter)
  const relativeLetter = letter === 'A' ? 'B' : 'A';
  compatible.push({ 
    key: `${number}${relativeLetter}`, 
    compatibility: letter === 'A' ? 'Relative Major' : 'Relative Minor'
  });
  
  // +1 on wheel (next key)
  const nextNumber = number === 12 ? 1 : number + 1;
  compatible.push({ 
    key: `${nextNumber}${letter}`, 
    compatibility: '+1 Semitone'
  });
  
  // -1 on wheel (previous key)
  const prevNumber = number === 1 ? 12 : number - 1;
  compatible.push({ 
    key: `${prevNumber}${letter}`, 
    compatibility: '-1 Semitone'
  });
  
  return compatible;
}

/**
 * Check if two keys are harmonically compatible
 * @param key1 - First key
 * @param key2 - Second key
 * @returns boolean indicating compatibility
 */
export function areKeysCompatible(key1: string, key2: string): boolean {
  const compatible = getCompatibleKeys(key1);
  return compatible.some(c => c.key === key2.toUpperCase());
}

/**
 * Get compatibility level between two keys
 * @param key1 - First key
 * @param key2 - Second key
 * @returns Compatibility level: perfect, good, moderate, poor
 */
export function getKeyCompatibility(key1: string, key2: string): {
  compatible: boolean;
  level: 'perfect' | 'good' | 'moderate' | 'poor';
  description: string;
} {
  const upper1 = key1.toUpperCase();
  const upper2 = key2.toUpperCase();
  
  if (upper1 === upper2) {
    return {
      compatible: true,
      level: 'perfect',
      description: 'Same key - perfect match',
    };
  }
  
  const compatible = getCompatibleKeys(key1);
  const match = compatible.find(c => c.key === upper2);
  
  if (match) {
    if (match.compatibility.includes('Relative')) {
      return {
        compatible: true,
        level: 'good',
        description: match.compatibility,
      };
    } else {
      return {
        compatible: true,
        level: 'good',
        description: match.compatibility,
      };
    }
  }
  
  // Check if keys are close (±2 on wheel)
  const matches1 = upper1.match(/(\d+)([AB])/);
  const matches2 = upper2.match(/(\d+)([AB])/);
  
  if (matches1 && matches2) {
    const num1 = parseInt(matches1[1]);
    const num2 = parseInt(matches2[1]);
    const letter1 = matches1[2];
    const letter2 = matches2[2];
    
    if (letter1 === letter2) {
      const diff = Math.min(
        Math.abs(num1 - num2),
        Math.abs(num1 - num2 + 12),
        Math.abs(num1 - num2 - 12)
      );
      
      if (diff <= 2) {
        return {
          compatible: true,
          level: 'moderate',
          description: `±${diff} semitones - may work`,
        };
      }
    }
  }
  
  return {
    compatible: false,
    level: 'poor',
    description: 'Not harmonically compatible',
  };
}

/**
 * Get all keys in a specific mode (major/minor)
 * @param mode - 'major' (B keys) or 'minor' (A keys)
 * @returns Array of keys in that mode
 */
export function getKeysByMode(mode: 'major' | 'minor'): string[] {
  const letter = mode === 'major' ? 'B' : 'A';
  return Array.from({ length: 12 }, (_, i) => `${i + 1}${letter}`);
}

/**
 * Get the relative major/minor of a key
 * @param key - Key in Camelot notation
 * @returns Relative key
 */
export function getRelativeKey(key: string): string | null {
  const matches = key.toUpperCase().match(/(\d+)([AB])/);
  if (!matches) return null;
  
  const number = matches[1];
  const letter = matches[2];
  const newLetter = letter === 'A' ? 'B' : 'A';
  
  return `${number}${newLetter}`;
}

/**
 * Convert standard key notation to Camelot
 * @param standardKey - Key in standard notation (e.g., "Cm", "G", "F#m")
 * @returns Camelot key or null if not found
 */
export function standardToCamelot(standardKey: string): string | null {
  const mapping: Record<string, string> = {
    // Major keys (B)
    'C': '8B', 'Db': '3B', 'D': '10B', 'Eb': '5B', 'E': '12B', 'F': '7B',
    'F#': '2B', 'Gb': '2B', 'G': '9B', 'Ab': '4B', 'A': '11B', 'Bb': '6B', 'B': '1B',
    
    // Minor keys (A)
    'Cm': '5A', 'C#m': '12A', 'Dbm': '12A', 'Dm': '7A', 'Ebm': '2A', 'Em': '9A',
    'Fm': '4A', 'F#m': '11A', 'Gbm': '11A', 'Gm': '6A', 'G#m': '1A', 'Abm': '1A',
    'Am': '8A', 'Bbm': '3A', 'Bm': '10A',
  };
  
  return mapping[standardKey] || null;
}

/**
 * Convert Camelot notation to standard key
 * @param camelotKey - Key in Camelot notation (e.g., "5A")
 * @returns Standard key notation
 */
export function camelotToStandard(camelotKey: string): string | null {
  const mapping: Record<string, string> = {
    // Major keys
    '8B': 'C', '3B': 'Db', '10B': 'D', '5B': 'Eb', '12B': 'E', '7B': 'F',
    '2B': 'F#', '9B': 'G', '4B': 'Ab', '11B': 'A', '6B': 'Bb', '1B': 'B',
    
    // Minor keys
    '5A': 'Cm', '12A': 'C#m', '7A': 'Dm', '2A': 'Ebm', '9A': 'Em', '4A': 'Fm',
    '11A': 'F#m', '6A': 'Gm', '1A': 'G#m', '8A': 'Am', '3A': 'Bbm', '10A': 'Bm',
  };
  
  return mapping[camelotKey.toUpperCase()] || null;
}

/**
 * Get energy-matched tracks (same BPM ±6%, compatible key)
 * Used for DJ set building
 */
export interface EnergyMatch {
  bpmMatch: boolean;
  keyMatch: boolean;
  score: number; // 0-100
}

export function calculateEnergyMatch(
  currentBpm: number,
  currentKey: string,
  targetBpm: number,
  targetKey: string
): EnergyMatch {
  // BPM match (±6% for pitch adjustment)
  const bpmMin = currentBpm * 0.94;
  const bpmMax = currentBpm * 1.06;
  const bpmMatch = targetBpm >= bpmMin && targetBpm <= bpmMax;
  
  // Key compatibility
  const keyComp = getKeyCompatibility(currentKey, targetKey);
  const keyMatch = keyComp.compatible;
  
  // Calculate score
  let score = 0;
  
  if (bpmMatch) score += 50;
  if (keyMatch) {
    if (keyComp.level === 'perfect') score += 50;
    else if (keyComp.level === 'good') score += 40;
    else if (keyComp.level === 'moderate') score += 20;
  }
  
  return { bpmMatch, keyMatch, score };
}

