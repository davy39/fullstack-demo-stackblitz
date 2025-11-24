/**
 * Service de gestion des Projets.
 *
 * Ce module contient la logique métier pour les projets, y compris :
 * - Le CRUD standard (Create, Read, Update, Delete).
 * - La gestion des membres (relation Many-to-Many avec Contacts).
 * - Le calcul de statistiques (agrégations).
 *
 * @module ProjectService
 */

import { Prisma } from '@prisma/client';
import { prisma } from './database.js';

/* -------------------------------------------------------------------------- */
/*                                Interfaces                                  */
/* -------------------------------------------------------------------------- */

/**
 * Structure de l'objet retourné par les statistiques de projet.
 */
interface ProjectStats {
  totalTasks: number;
  totalMembers: number;
  tasksByStatus: Record<string, number>;
}

/* -------------------------------------------------------------------------- */
/*                                Opérations CRUD                             */
/* -------------------------------------------------------------------------- */

/**
 * Récupère la liste des projets avec filtrage et relations incluses.
 *
 * @param {Prisma.ProjectWhereInput} filters - Filtres Prisma (ex: { status: 'active' }).
 * @returns {Promise<Project[]>} Liste des projets avec un aperçu des membres et tâches.
 */
export const findAll = async (filters: Prisma.ProjectWhereInput = {}) => {
  return prisma.project.findMany({
    where: filters,
    include: {
      // Inclusion intelligente : On ne récupère que les champs nécessaires
      members: {
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
      },
      // Agrégations légères pour les compteurs
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Recherche un projet par son ID avec toutes ses données détaillées.
 *
 * @param {number} id - L'identifiant du projet.
 * @returns {Promise<Project | null>} Le projet complet ou null.
 */
export const findById = async (id: number) => {
  return prisma.project.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      tasks: {
        include: {
          assignee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' }, // Les tâches urgentes en premier
          { dueDate: 'asc' }, // Puis celles qui expirent bientôt
        ],
      },
    },
  });
};

/**
 * Crée un nouveau projet.
 *
 * @param {Prisma.ProjectCreateInput} data - Données du projet.
 * @returns {Promise<Project>} Le projet créé.
 */
export const create = async (data: Prisma.ProjectCreateInput) => {
  return prisma.project.create({
    data,
    include: {
      // On renvoie la structure vide des relations pour le frontend
      members: true,
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
    },
  });
};

/**
 * Met à jour un projet existant.
 *
 * @param {number} id - ID du projet.
 * @param {Prisma.ProjectUpdateInput} data - Données partielles à mettre à jour.
 * @returns {Promise<Project | null>} Le projet mis à jour ou null si introuvable.
 */
export const update = async (id: number, data: Prisma.ProjectUpdateInput) => {
  try {
    return await prisma.project.update({
      where: { id },
      data,
      include: {
        members: {
          include: {
            contact: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
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
 * Supprime un projet.
 *
 * Note : Grâce à la configuration `onDelete: Cascade` dans le schéma Prisma,
 * la suppression d'un projet entraîne automatiquement la suppression
 * de ses tâches et de ses liens avec les membres.
 *
 * @param {number} id - ID du projet.
 * @returns {Promise<boolean>} true si supprimé, false si introuvable.
 */
export const remove = async (id: number): Promise<boolean> => {
  try {
    await prisma.project.delete({
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

/* -------------------------------------------------------------------------- */
/*                        Gestion des Membres                                 */
/* -------------------------------------------------------------------------- */

/**
 * Ajoute un membre à un projet.
 * Crée une entrée dans la table de jointure `ProjectMember`.
 *
 * @param {number} projectId - ID du projet.
 * @param {object} memberData - Données du membre (contactId, role).
 * @returns {Promise<ProjectMember>} L'entrée de membre créée.
 */
export const addMember = async (
  projectId: number,
  memberData: { contactId: number; role?: string }
) => {
  return prisma.projectMember.create({
    data: {
      projectId,
      contactId: memberData.contactId,
      role: memberData.role || 'member',
    },
    include: {
      contact: {
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
        },
      },
    },
  });
};

/**
 * Récupère tous les membres d'un projet.
 *
 * @param {number} projectId - ID du projet.
 * @returns {Promise<ProjectMember[]>} Liste des membres avec infos contact.
 */
export const getMembers = async (projectId: number) => {
  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          company: true,
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  });
};

/**
 * Retire un membre d'un projet.
 *
 * @param {number} projectId - ID du projet.
 * @param {number} contactId - ID du contact à retirer.
 * @returns {Promise<boolean>} true si retiré, false si introuvable.
 */
export const removeMember = async (projectId: number, contactId: number): Promise<boolean> => {
  try {
    // Utilisation de la clé unique composite définie dans le schéma Prisma
    await prisma.projectMember.delete({
      where: {
        contactId_projectId: {
          contactId,
          projectId,
        },
      },
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

/* -------------------------------------------------------------------------- */
/*                        Statistiques                                        */
/* -------------------------------------------------------------------------- */

/**
 * Calcule les statistiques d'un projet (nombre de tâches par statut, etc.).
 *
 * @param {number} projectId - ID du projet.
 * @returns {Promise<ProjectStats | null>} Statistiques ou null.
 */
export const getProjectStats = async (projectId: number): Promise<ProjectStats | null> => {
  // Récupération optimisée : on ne charge que les statuts des tâches
  const stats = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      _count: {
        select: {
          tasks: true,
          members: true,
        },
      },
      tasks: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!stats) return null;

  // Réduction (Map/Reduce) pour compter les tâches par statut
  const tasksByStatus = stats.tasks.reduce(
    (acc, task) => {
      // acc[task.status] = (valeur actuelle ou 0) + 1
      // Utilisation de 'as string' car task.status est typé (Enum)
      const statusKey = task.status as string;
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalTasks: stats._count.tasks,
    totalMembers: stats._count.members,
    tasksByStatus,
  };
};
