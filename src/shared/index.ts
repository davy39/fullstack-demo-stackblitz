/**
 * Module Partagé (Shared Kernel).
 *
 * Ce fichier est le point de convergence entre le Frontend (Client) et le Backend (Serveur).
 * Il définit le "contrat d'interface" que les deux parties doivent respecter.
 *
 * Règles d'or :
 * 1. Ce fichier ne doit contenir QUE du code universel (Types, Interfaces, Objets purs, Zod).
 * 2. Aucune importation de modules spécifiques à Node.js (fs, path, process) ou au DOM.
 * 3. Les extensions d'import doivent être explicites (.js) pour la compatibilité avec le Serveur (NodeNext).
 *
 * @module SharedTypes
 */

// Importation des types générés par Prisma (uniquement les définitions)
import { Contact, Task, Project, ProjectMember } from '@prisma/client';

/* -------------------------------------------------------------------------- */
/*                        1. Types de la Base de Données                      */
/* -------------------------------------------------------------------------- */

// Ré-export des types Prisma.
// Cela permet au Frontend d'utiliser les types 'Contact' ou 'Task' sans avoir
// à installer le client Prisma lourd ou à exposer la logique de BDD.
// L'utilisation de 'export type' est cruciale : elle garantit que rien n'est
// inclus dans le bundle JavaScript final du client (zéro poids).
export type { Contact, Task, Project, ProjectMember };

/* -------------------------------------------------------------------------- */
/*                        2. Standardisation API (Enveloppe)                  */
/* -------------------------------------------------------------------------- */

/**
 * Interface standard pour toutes les réponses HTTP de l'API.
 * Que ce soit un succès ou une erreur, le client reçoit toujours cette structure.
 *
 * @template T - Le type de la donnée 'payload' (ex: Contact, Task[]).
 */
export interface ApiResponse<T = unknown> {
  /** Indique si l'opération a réussi (true) ou échoué (false) */
  success: boolean;

  /**
   * La charge utile de données.
   * Peut être null en cas d'erreur ou de suppression réussie.
   */
  data: T | null;

  /** Message descriptif (ex: "Contact créé", "Erreur de validation") */
  message: string;

  /** Horodatage ISO de la réponse serveur */
  timestamp: string;

  /**
   * Liste optionnelle d'erreurs détaillées.
   * Utilisé principalement pour les erreurs de validation de formulaire (Zod).
   */
  errors?: Array<{ field: string; message: string }>;
}

/* -------------------------------------------------------------------------- */
/*                        3. Types Composés (Vues)                            */
/* -------------------------------------------------------------------------- */

/**
 * Type utilitaire représentant un Contact enrichi de ses relations.
 * Utile pour les pages de détail où l'on récupère le contact + ses tâches.
 */
export interface ContactWithRelations extends Contact {
  tasks?: Task[];
  projects?: ProjectMember[];
}

/* -------------------------------------------------------------------------- */
/*                        4. Validation & DTOs (Zod)                          */
/* -------------------------------------------------------------------------- */

// Export de tous les schémas Zod et des types TypeScript déduits (DTO).
//
// NOTE IMPORTANTE : L'extension '.js' est OBLIGATOIRE ici.
// Le Backend (Node.js ESM) en a besoin pour trouver le fichier 'schemas.ts'.
// Le Frontend (Vite/Bundler) est assez intelligent pour comprendre que cela pointe
// vers le fichier source TypeScript.
export * from './schemas.js';
