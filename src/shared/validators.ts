/**
 * Schémas de Validation & DTOs (Générés via Drizzle-Zod)
 *
 * Ce fichier constitue la couche de validation de l'application.
 *
 * ADAPTATION ZOD v4 :
 * 1. Nous n'utilisons pas les options `{ required_error }` dans les constructeurs
 *    car les signatures ont changé dans la v4.
 * 2. Nous remplaçons les callbacks `(schema) => schema.method()` par des définitions
 *    explicites `z.string().method()`. Cela contourne le problème où Drizzle-Zod
 *    infère parfois un type `ZodType<Buffer>` générique au lieu de `ZodString` pour SQLite.
 *
 * @module SharedSchemas
 */

import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { contacts, projects, tasks } from './db-schema.js'; // Extension .js requise pour NodeNext

/* -------------------------------------------------------------------------- */
/*                            1. Utilitaires                                  */
/* -------------------------------------------------------------------------- */

/**
 * Schéma pour la validation d'un identifiant numérique unique dans l'URL.
 * Utilise z.coerce pour transformer la string de l'URL en nombre.
 */
export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/* -------------------------------------------------------------------------- */
/*                            2. Contacts                                     */
/* -------------------------------------------------------------------------- */

/**
 * Schéma de base généré pour la table Contacts.
 *
 * Nous surchargeons explicitement les champs pour appliquer les règles de validation
 * sans dépendre de l'inférence de type automatique qui échoue avec Zod 4.
 */
const baseContactSchema = createInsertSchema(contacts, {
  firstName: z.string().min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }).trim(),
  lastName: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères' }).trim(),
  email: z.email({ message: "Format d'email invalide" }).toLowerCase().trim(),
  // Les champs optionnels (phone, company, notes) sont gérés automatiquement par createInsertSchema
});

/**
 * Schéma de Création (POST).
 * On retire les champs gérés par le système.
 */
export const CreateContactSchema = baseContactSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schéma de Mise à jour (PUT/PATCH).
 * Tous les champs deviennent optionnels grâce à .partial().
 */
export const UpdateContactSchema = CreateContactSchema.partial();

// Types TypeScript déduits (DTOs) pour le Frontend
export type CreateContactDTO = z.infer<typeof CreateContactSchema>;
export type UpdateContactDTO = z.infer<typeof UpdateContactSchema>;

/* -------------------------------------------------------------------------- */
/*                            3. Projets                                      */
/* -------------------------------------------------------------------------- */

const baseProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1, { message: 'Le nom du projet est requis' }).trim(),
  // Forçage de la coercition de date pour gérer les chaînes JSON entrantes
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().optional(),
});

export const CreateProjectSchema = baseProjectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;

/* -------------------------------------------------------------------------- */
/*                            4. Tâches                                       */
/* -------------------------------------------------------------------------- */

const baseTaskSchema = createInsertSchema(tasks, {
  title: z.string().min(1, { message: 'Le titre est requis' }).trim(),
  // On définit des valeurs par défaut compatibles avec le schéma DB
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.coerce.date().nullable().optional(),
});

export const CreateTaskSchema = baseTaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateTaskSchema = CreateTaskSchema.partial();

/**
 * Schéma spécifique pour le workflow (changement de statut uniquement).
 */
export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
export type UpdateTaskStatusDTO = z.infer<typeof UpdateTaskStatusSchema>;

/* -------------------------------------------------------------------------- */
/*                            5. Membres & Relations                          */
/* -------------------------------------------------------------------------- */

/**
 * Schéma pour ajouter un membre.
 * Suppression de 'required_error' pour compatibilité Zod 4.
 * Zod 4 rend les champs requis par défaut.
 */
export const AddMemberSchema = z.object({
  contactId: z.number().int().positive(),
  role: z.string().default('member'),
});

export const RemoveMemberParamsSchema = z.object({
  id: z.coerce.number().int().positive(), // ID du projet
  contactId: z.coerce.number().int().positive(), // ID du contact
});

export type AddMemberDTO = z.infer<typeof AddMemberSchema>;

/* -------------------------------------------------------------------------- */
/*                            6. Export Groupé                                */
/* -------------------------------------------------------------------------- */

export const contactSchemas = {
  create: CreateContactSchema,
  update: UpdateContactSchema,
};

export const projectSchemas = {
  create: CreateProjectSchema,
  update: UpdateProjectSchema,
};

export const taskSchemas = {
  create: CreateTaskSchema,
  update: UpdateTaskSchema,
};
