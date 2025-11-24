/**
 * Routeur de gestion des Projets.
 *
 * Ce module expose l'API RESTful pour la gestion complète du cycle de vie des projets
 * (CRUD) ainsi que la gestion des relations avec les membres (Contacts).
 *
 * REFACTORING EXPRESS 5 :
 * Simplification de la gestion d'erreurs grâce au support natif des Promesses.
 *
 * @module ProjectRoutes
 */

import { Prisma } from '@prisma/client';
import { Router, Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as projectService from '../../services/project.service.js';
import {
  validate,
  IdParamSchema,
  ProjectSchema,
  AddMemberSchema,
  RemoveMemberParamsSchema,
  CreateProjectDTO,
  AddMemberDTO,
} from '../../middleware/validate.js';

const router = Router();

/* -------------------------------------------------------------------------- */
/*                                Lectures (GET)                              */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/project/list
 * Récupère la liste de tous les projets.
 */
router.get('/list', async (req: Request, res: Response) => {
  const { status } = req.query;
  const filters: any = {};

  // Application du filtre si présent
  if (status && typeof status === 'string') {
    filters.status = status;
  }

  // Express 5 gère l'erreur si findAll échoue
  const projects = await projectService.findAll(filters);
  res.status(200).json(successResponse(projects, 'Projets récupérés avec succès'));
});

/**
 * GET /api/v1/project/:id
 * Récupère les détails complets d'un projet par son ID.
 */
router.get('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const project = await projectService.findById(id);

  if (!project) {
    return res.status(404).json(errorResponse('Projet introuvable'));
  }

  res.status(200).json(successResponse(project));
});

/* -------------------------------------------------------------------------- */
/*                                Routes (Écriture)                           */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/v1/project
 * Crée un nouveau projet.
 */
router.post('/', validate(ProjectSchema), async (req: Request, res: Response) => {
  const projectData = req.body as CreateProjectDTO;

  // Pas de try/catch spécifique ici car pas de contrainte unique susceptible d'échouer
  // (sauf erreur interne gérée par Express 5)
  const project = await projectService.create(projectData);
  res.status(201).json(successResponse(project, 'Projet créé avec succès'));
});

/**
 * PUT /api/v1/project/:id
 * Met à jour partiellement ou totalement un projet existant.
 */
router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(ProjectSchema.partial()), // Autorise la mise à jour partielle
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body;

    const project = await projectService.update(id, updateData);

    if (!project) {
      return res.status(404).json(errorResponse('Projet introuvable'));
    }

    res.status(200).json(successResponse(project, 'Projet mis à jour avec succès'));
  }
);

/**
 * DELETE /api/v1/project/:id
 * Supprime un projet.
 */
router.delete('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const deleted = await projectService.remove(id);

  if (!deleted) {
    return res.status(404).json(errorResponse('Projet introuvable'));
  }

  res.status(200).json(successResponse(null, 'Projet supprimé avec succès'));
});

/* -------------------------------------------------------------------------- */
/*                        Gestion des Membres (Sous-ressources)               */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/v1/project/:id/members
 * Ajoute un contact en tant que membre du projet.
 */
router.post(
  '/:id/members',
  validate(IdParamSchema, 'params'),
  validate(AddMemberSchema),
  async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    const memberData = req.body as AddMemberDTO;

    try {
      const member = await projectService.addMember(projectId, memberData);
      res.status(201).json(successResponse(member, 'Membre ajouté au projet'));
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Gestion des erreurs spécifiques Prisma
        if (error.code === 'P2002') {
          return res.status(409).json(errorResponse('Ce contact est déjà membre du projet'));
        }
        if (error.code === 'P2003') {
          return res.status(404).json(errorResponse('Projet ou Contact introuvable'));
        }
      }

      // On relance les autres erreurs (500)
      throw error;
    }
  }
);

/**
 * GET /api/v1/project/:id/members
 * Liste tous les membres associés au projet.
 */
router.get(
  '/:id/members',
  validate(IdParamSchema, 'params'),
  async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);

    // Si le projet n'existe pas, getMembers renverra un tableau vide, ce qui est correct.
    // On pourrait ajouter un check findById si on veut une 404 stricte.
    const members = await projectService.getMembers(projectId);
    res.status(200).json(successResponse(members));
  }
);

/**
 * DELETE /api/v1/project/:id/members/:contactId
 * Retire un membre du projet.
 */
router.delete(
  '/:id/members/:contactId',
  validate(RemoveMemberParamsSchema, 'params'),
  async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    const contactId = Number(req.params.contactId);

    const removed = await projectService.removeMember(projectId, contactId);

    if (!removed) {
      return res.status(404).json(errorResponse('Membre introuvable dans ce projet'));
    }

    res.status(200).json(successResponse(null, 'Membre retiré du projet'));
  }
);

export default router;
