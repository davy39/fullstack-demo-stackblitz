/**
 * Service de gestion des Tâches (Drizzle ORM).
 *
 * Ce module gère les opérations CRUD, les assignations et le workflow des tâches.
 *
 * PARTICULARITÉS DRIZZLE :
 * - Typage strict : Les filtres string doivent être castés pour matcher les enums du schéma.
 * - Pattern "Insert-then-Fetch" : Pour renvoyer les relations après une création.
 *
 * @module TaskService
 */

import { and, asc, desc, eq, SQL } from 'drizzle-orm';
import { db } from '../db/client.js';
import { tasks, TASK_STATUSES, PRIORITIES } from '../../shared/db-schema.js';

// Types partagés
import type { TaskWithDetails } from '../../shared/types.js';
import type { CreateTaskDTO, UpdateTaskDTO, UpdateTaskStatusDTO } from '../../shared/validators.js';

/* -------------------------------------------------------------------------- */
/*                                Opérations de Lecture                       */
/* -------------------------------------------------------------------------- */

interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: number;
  projectId?: number;
}

export const findAll = async (filters: TaskFilters = {}): Promise<TaskWithDetails[]> => {
  const conditions: SQL[] = [];

  // Cast explicite pour satisfaire le typage strict de Drizzle
  // Drizzle s'attend à "TODO" | "DONE"... et non à "string"
  if (filters.status) {
    conditions.push(eq(tasks.status, filters.status as (typeof TASK_STATUSES)[number]));
  }

  if (filters.priority) {
    conditions.push(eq(tasks.priority, filters.priority as (typeof PRIORITIES)[number]));
  }

  if (filters.assigneeId) conditions.push(eq(tasks.assigneeId, filters.assigneeId));
  if (filters.projectId) conditions.push(eq(tasks.projectId, filters.projectId));

  return db.query.tasks.findMany({
    where: and(...conditions),
    with: {
      assignee: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        columns: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: [desc(tasks.priority), asc(tasks.dueDate), desc(tasks.createdAt)],
  });
};

export const findById = async (id: number): Promise<TaskWithDetails | undefined> => {
  return db.query.tasks.findFirst({
    where: eq(tasks.id, id),
    with: {
      assignee: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        columns: {
          id: true,
          name: true,
          description: true,
          status: true,
        },
      },
    },
  });
};

export const findByProject = async (projectId: number): Promise<TaskWithDetails[]> => {
  return findAll({ projectId });
};

export const findByAssignee = async (assigneeId: number): Promise<TaskWithDetails[]> => {
  return findAll({ assigneeId });
};

/* -------------------------------------------------------------------------- */
/*                                Opérations d'Écriture                       */
/* -------------------------------------------------------------------------- */

const getTaskWithRelations = async (id: number): Promise<TaskWithDetails> => {
  const task = await findById(id);
  if (!task) throw new Error(`Erreur interne : Tâche ID ${id} introuvable après écriture.`);
  return task;
};

export const create = async (data: CreateTaskDTO): Promise<TaskWithDetails> => {
  // On cast les enums ici aussi si nécessaire, bien que Zod le garantisse en amont
  const payload = {
    ...data,
    status: data.status as (typeof TASK_STATUSES)[number],
    priority: data.priority as (typeof PRIORITIES)[number],
  };

  const result = await db.insert(tasks).values(payload).returning({ id: tasks.id });
  return getTaskWithRelations(result[0].id);
};

export const update = async (
  id: number,
  data: UpdateTaskDTO
): Promise<TaskWithDetails | undefined> => {
  // Préparation du payload avec typage correct pour les champs optionnels
  const payload: typeof data = { ...data };
  if (data.status) payload.status = data.status as (typeof TASK_STATUSES)[number];
  if (data.priority) payload.priority = data.priority as (typeof PRIORITIES)[number];

  const result = await db
    .update(tasks)
    .set(payload)
    .where(eq(tasks.id, id))
    .returning({ id: tasks.id });

  if (result.length === 0) return undefined;

  return getTaskWithRelations(id);
};

export const updateStatus = async (
  id: number,
  status: UpdateTaskStatusDTO['status']
): Promise<TaskWithDetails | undefined> => {
  return update(id, { status });
};

export const remove = async (id: number): Promise<boolean> => {
  const result = await db.delete(tasks).where(eq(tasks.id, id)).returning({ id: tasks.id });

  return result.length > 0;
};
