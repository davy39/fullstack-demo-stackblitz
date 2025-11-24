/**
 * Schémas de Validation Partagés (Zod).
 *
 * Ce fichier définit les règles de validation pour toutes les entités de l'application.
 * Il sert de pivot central pour l'architecture Fullstack :
 * 1. Runtime : Génère les validateurs pour le Backend (Express/Zod).
 * 2. Compile-time : Génère les types TypeScript (DTO) pour le Frontend et le Backend.
 *
 * @module SharedSchemas
 */

import { z } from 'zod';

/* -------------------------------------------------------------------------- */
/*                            1. Utilitaires                                  */
/* -------------------------------------------------------------------------- */

/**
 * Schéma pour la validation d'un identifiant numérique unique.
 * Généralement utilisé pour valider les paramètres d'URL (ex: /contact/:id).
 *
 * Utilise `coerce` pour convertir la chaîne de caractères de l'URL en nombre.
 */
export const IdParamSchema = z.object({
  id: z.coerce.number({ error: "L'ID doit être un nombre valide" }).int().positive(),
});

/* -------------------------------------------------------------------------- */
/*                            2. Contacts                                     */
/* -------------------------------------------------------------------------- */

export const contactSchemas = {
  /**
   * Validation stricte pour la création d'un contact (POST).
   */
  create: z.object({
    firstName: z
      .string({ error: 'Le prénom est requis' })
      .min(2, { error: 'Le prénom est trop court' })
      .trim(),
    lastName: z
      .string({ error: 'Le nom est requis' })
      .min(2, { error: 'Le nom est trop court' })
      .trim(),
    // Validation format Email
    email: z.email({ error: "Format d'email invalide" }).trim().toLowerCase(),
    // Champs optionnels
    phone: z.string().optional(),
    company: z.string().optional(),
    notes: z.string().optional(),
  }),

  /**
   * Validation partielle pour la mise à jour (PUT/PATCH).
   * Rend tous les champs de 'create' optionnels.
   */
  update: z
    .object({
      firstName: z.string().min(2).trim(),
      lastName: z.string().min(2).trim(),
      email: z.email().trim().toLowerCase(),
      phone: z.string(),
      company: z.string(),
      notes: z.string(),
    })
    .partial(),
};

// Inférence des types TypeScript (DTO) pour le Frontend
export type CreateContactDTO = z.infer<typeof contactSchemas.create>;
export type UpdateContactDTO = z.infer<typeof contactSchemas.update>;

/* -------------------------------------------------------------------------- */
/*                            3. Projets                                      */
/* -------------------------------------------------------------------------- */

/**
 * Schéma principal pour l'entité Projet.
 * Gère la coercition des dates pour les entrées JSON (string -> Date).
 */
export const ProjectSchema = z.object({
  name: z.string({ error: 'Le nom du projet est requis' }).min(1).max(255).trim(),
  description: z.string().max(1000).optional().nullable(),
  status: z.string().default('active'),

  // Transformation automatique des dates ISO
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
});

/**
 * Schéma pour l'ajout d'un membre à un projet.
 */
export const AddMemberSchema = z.object({
  contactId: z.number({ error: "L'ID du contact est requis" }).int().positive(),
  role: z.string().default('member'),
});

/**
 * Schéma pour la suppression d'un membre via URL.
 * Valide la présence de deux IDs (Projet + Contact).
 */
export const RemoveMemberParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  contactId: z.coerce.number().int().positive(),
});

// Types déduits
export type CreateProjectDTO = z.infer<typeof ProjectSchema>;
export type AddMemberDTO = z.infer<typeof AddMemberSchema>;

/* -------------------------------------------------------------------------- */
/*                            4. Tâches                                       */
/* -------------------------------------------------------------------------- */

/**
 * Schéma principal pour l'entité Tâche.
 * Utilise des énumérations strictes pour le statut et la priorité.
 */
export const TaskSchema = z.object({
  title: z.string({ error: 'Le titre est requis' }).min(1).max(255).trim(),
  description: z.string().max(1000).optional().nullable(),

  status: z
    .enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], { error: 'Statut invalide' })
    .default('TODO'),

  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], { error: 'Priorité invalide' })
    .default('MEDIUM'),

  dueDate: z.coerce.date().optional().nullable(),

  // Clés étrangères (Peuvent être null pour désassigner)
  assigneeId: z.number().int().positive().optional().nullable(),
  projectId: z.number().int().positive().optional().nullable(),
});

/**
 * Schéma spécifique pour la mise à jour du statut (Workflow).
 */
export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
});

// Types déduits
export type CreateTaskDTO = z.infer<typeof TaskSchema>;
export type UpdateTaskDTO = Partial<CreateTaskDTO>;
export type UpdateTaskStatusDTO = z.infer<typeof UpdateTaskStatusSchema>;
