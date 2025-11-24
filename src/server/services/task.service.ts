/**
 * Service de gestion des Tâches.
 *
 * Ce module contient la logique métier pour la manipulation des tâches.
 * Il gère les opérations CRUD, les assignations (Membres/Projets) et
 * les changements d'états (Workflow).
 *
 * @module TaskService
 */

import { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from './database.js';

/* -------------------------------------------------------------------------- */
/*                                Opérations de Lecture                       */
/* -------------------------------------------------------------------------- */

/**
 * Récupère la liste des tâches selon les filtres fournis.
 *
 * Les tâches sont triées par :
 * 1. Priorité (URGENT -> LOW)
 * 2. Date d'échéance (les plus proches d'abord)
 * 3. Date de création (les plus récentes d'abord)
 *
 * @param {Prisma.TaskWhereInput} filters - Critères de filtrage (statut, projet, assigné...).
 * @returns {Promise<Task[]>} Liste des tâches avec détails (assigné, projet).
 */
export const findAll = async (filters: Prisma.TaskWhereInput = {}) => {
  return prisma.task.findMany({
    where: filters,
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });
};

/**
 * Recherche une tâche par son identifiant.
 *
 * @param {number} id - L'identifiant de la tâche.
 * @returns {Promise<Task | null>} La tâche complète ou null si introuvable.
 */
export const findById = async (id: number) => {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Récupère toutes les tâches associées à un projet spécifique.
 *
 * @param {number} projectId - ID du projet.
 * @returns {Promise<Task[]>} Liste des tâches du projet.
 */
export const findByProject = async (projectId: number) => {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  });
};

/**
 * Récupère toutes les tâches assignées à un contact spécifique.
 *
 * @param {number} assigneeId - ID du contact.
 * @returns {Promise<Task[]>} Liste des tâches assignées.
 */
export const findByAssignee = async (assigneeId: number) => {
  return prisma.task.findMany({
    where: { assigneeId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  });
};

/* -------------------------------------------------------------------------- */
/*                                Opérations d'Écriture                       */
/* -------------------------------------------------------------------------- */

/**
 * Crée une nouvelle tâche.
 *
 * @param {Prisma.TaskCreateInput} data - Les données de la tâche.
 * @returns {Promise<Task>} La tâche créée.
 */
export const create = async (data: Prisma.TaskCreateInput) => {
  return prisma.task.create({
    data,
    include: {
      assignee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
    },
  });
};

/**
 * Met à jour les informations d'une tâche.
 *
 * @param {number} id - ID de la tâche à modifier.
 * @param {Prisma.TaskUpdateInput} data - Données partielles à mettre à jour.
 * @returns {Promise<Task | null>} La tâche mise à jour ou null.
 */
export const update = async (id: number, data: Prisma.TaskUpdateInput) => {
  try {
    return await prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Code P2025 : "Record to update not found."
      if (error.code === 'P2025') {
        return null;
      }
    }
    throw error;
  }
};

/**
 * Met à jour uniquement le statut d'une tâche.
 * Utile pour les tableaux Kanban ou les changements rapides d'état.
 *
 * @param {number} id - ID de la tâche.
 * @param {TaskStatus} status - Le nouveau statut (TODO, DONE, etc.).
 * @returns {Promise<Task | null>} La tâche mise à jour.
 */
export const updateStatus = async (id: number, status: TaskStatus) => {
  try {
    return await prisma.task.update({
      where: { id },
      data: { status },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return null;
      }
    }
    throw error;
  }
};

/**
 * Supprime une tâche.
 *
 * @param {number} id - ID de la tâche à supprimer.
 * @returns {Promise<boolean>} true si supprimée, false si introuvable.
 */
export const remove = async (id: number): Promise<boolean> => {
  try {
    await prisma.task.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return false;
      }
    }
    throw error;
  }
};
