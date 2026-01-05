import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un indice colore avatar (0-11) basato su una stringa (userId o email)
 * Usa l'algoritmo djb2 per una distribuzione uniforme
 */
export function getAvatarColorIndex(identifier: string): number {
  // djb2 hash algorithm - better distribution than simple hash
  let hash = 5381;
  for (let i = 0; i < identifier.length; i++) {
    hash = ((hash << 5) + hash) ^ identifier.charCodeAt(i);
  }
  return Math.abs(hash) % 12;
}

/**
 * Restituisce la CSS variable per il colore avatar
 */
export function getAvatarColor(identifier: string): string {
  const index = getAvatarColorIndex(identifier);
  return `var(--avatar-${index})`;
}
