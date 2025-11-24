/**
 * Validateurs Zod (Version PostgreSQL).
 */
import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { contacts, projects, tasks } from './db-schema.js';

/* -------------------------------------------------------------------------- */
/*                            Utilitaires                                     */
/* -------------------------------------------------------------------------- */
export const IdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/* -------------------------------------------------------------------------- */
/*                            Contacts                                        */
/* -------------------------------------------------------------------------- */
const baseContactSchema = createInsertSchema(contacts, {
  firstName: z.string().min(2).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const CreateContactSchema = baseContactSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const UpdateContactSchema = CreateContactSchema.partial();

export type CreateContactDTO = z.infer<typeof CreateContactSchema>;
export type UpdateContactDTO = z.infer<typeof UpdateContactSchema>;

/* -------------------------------------------------------------------------- */
/*                            Projets                                         */
/* -------------------------------------------------------------------------- */
const baseProjectSchema = createInsertSchema(projects, {
  name: z.string().min(1).trim(),
  // PGLite gère bien les dates, mais l'entrée API JSON reste une string
  // donc on garde z.coerce.date() pour transformer la string JSON en Date
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
/*                            Tâches                                          */
/* -------------------------------------------------------------------------- */
const baseTaskSchema = createInsertSchema(tasks, {
  title: z.string().min(1).trim(),
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

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
});

export type CreateTaskDTO = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDTO = z.infer<typeof UpdateTaskSchema>;
export type UpdateTaskStatusDTO = z.infer<typeof UpdateTaskStatusSchema>;

/* -------------------------------------------------------------------------- */
/*                            Membres                                         */
/* -------------------------------------------------------------------------- */
export const AddMemberSchema = z.object({
  contactId: z.number().int().positive(),
  role: z.string().default('member'),
});

export const RemoveMemberParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  contactId: z.coerce.number().int().positive(),
});

export type AddMemberDTO = z.infer<typeof AddMemberSchema>;

// Exports groupés pour compatibilité routes
export const contactSchemas = { create: CreateContactSchema, update: UpdateContactSchema };
export const projectSchemas = { create: CreateProjectSchema, update: UpdateProjectSchema };
export const taskSchemas = { create: CreateTaskSchema, update: UpdateTaskSchema };
