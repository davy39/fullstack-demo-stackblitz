/**
 * Routeur de gestion des Projets.
 *
 * Ce module expose l'API RESTful pour la gestion des projets et des membres.
 *
 * TRANSITION DRIZZLE :
 * - Suppression des types d'erreurs Prisma.
 * - Utilisation de codes d'erreurs SQLite natifs pour gérer les contraintes
 *   (Unicité des membres, Clés étrangères invalides).
 *
 * @module ProjectRoutes
 */

import { Router, Request, Response } from 'express';
import { successResponse, errorResponse } from '../../utils/response.js';
import * as projectService from '../../services/project.service.js';
import {
  validate,
  IdParamSchema,
  projectSchemas,
  AddMemberSchema,
  RemoveMemberParamsSchema,
  CreateProjectDTO,
  AddMemberDTO,
} from '../../middleware/validate.js';

const router = Router();

// Interface minimale pour typer les erreurs renvoyées par better-sqlite3
interface SqliteError extends Error {
  code: string;
}

/* -------------------------------------------------------------------------- */
/*                                Lectures (GET)                              */
/* -------------------------------------------------------------------------- */

router.get('/list', async (req: Request, res: Response) => {
  const { status } = req.query;
  const filters: { status?: string } = {};

  if (status && typeof status === 'string') {
    filters.status = status;
  }

  const projects = await projectService.findAll(filters);
  res.status(200).json(successResponse(projects, 'Projets récupérés avec succès'));
});

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

router.post('/', validate(projectSchemas.create), async (req: Request, res: Response) => {
  const projectData = req.body as CreateProjectDTO;
  const project = await projectService.create(projectData);
  res.status(201).json(successResponse(project, 'Projet créé avec succès'));
});

router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(projectSchemas.update),
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
      const err = error as SqliteError;

      // Gestion de l'unicité (Paire Contact/Projet déjà existante)
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json(errorResponse('Ce contact est déjà membre du projet'));
      }

      // Gestion des clés étrangères (Projet ou Contact inexistant)
      if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
        return res.status(404).json(errorResponse('Projet ou Contact introuvable'));
      }

      throw error;
    }
  }
);

router.get(
  '/:id/members',
  validate(IdParamSchema, 'params'),
  async (req: Request, res: Response) => {
    const projectId = Number(req.params.id);
    const members = await projectService.getMembers(projectId);
    res.status(200).json(successResponse(members));
  }
);

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
