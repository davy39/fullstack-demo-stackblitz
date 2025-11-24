/**
 * MODULE PARTAGÉ (Shared Kernel)
 *
 * Point de vérité unique pour le typage et la validation.
 *
 * STRUCTURE :
 * - types.ts      : Interfaces TypeScript (statique)
 * - validators.ts : Schémas Zod (runtime)
 * - db-schema.ts  : Définitions Drizzle (infra données) - Non exporté par défaut
 */

/* -------------------------------------------------------------------------- */
/*                        1. Standardisation API                              */
/* -------------------------------------------------------------------------- */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
  timestamp: string;
  errors?: Array<{ field: string; message: string }>;
}

/* -------------------------------------------------------------------------- */
/*                        2. Types & Validateurs                              */
/* -------------------------------------------------------------------------- */

// Export des interfaces TypeScript (ex: Contact, ProjectWithDetails)
export * from './types.js';

// Export des validateurs Zod
export * from './validators.js';
