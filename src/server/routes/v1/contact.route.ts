/**
 * Routeur de gestion des Contacts.
 *
 * Ce module expose l'API RESTful pour les opérations CRUD sur les contacts.
 *
 * GESTION DES ERREURS POSTGRESQL :
 * Nous interceptons les erreurs natives du moteur de base de données pour
 * fournir des messages clairs au client (ex: Email déjà pris).
 *
 * @module ContactRoutes
 */

import { Router, Request, Response } from 'express';
import {
  validate,
  contactSchemas,
  IdParamSchema,
  CreateContactDTO,
  UpdateContactDTO,
} from '../../middleware/validate.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import contactService from '../../services/contact.service.js';

const router = Router();

/**
 * Interface pour typer les erreurs renvoyées par le driver PostgreSQL.
 * Le champ 'code' contient le code d'erreur SQL standard (ex: '23505').
 */
interface PgError extends Error {
  code: string;
  detail?: string;
}

/* -------------------------------------------------------------------------- */
/*                                Lectures (GET)                              */
/* -------------------------------------------------------------------------- */

/**
 * GET /api/v1/contact/list
 * Récupère la liste complète des contacts.
 */
router.get('/list', async (req: Request, res: Response) => {
  const contacts = await contactService.findAll();
  res.status(200).json(successResponse(contacts, 'Liste des contacts récupérée'));
});

/**
 * GET /api/v1/contact/:id
 * Récupère un contact spécifique par son ID.
 */
router.get('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const contact = await contactService.findById(id);

  if (!contact) {
    return res.status(404).json(errorResponse('Contact introuvable'));
  }

  res.status(200).json(successResponse(contact));
});

/* -------------------------------------------------------------------------- */
/*                                Écritures (POST, PUT, DELETE)               */
/* -------------------------------------------------------------------------- */

/**
 * POST /api/v1/contact
 * Crée un nouveau contact.
 */
router.post('/', validate(contactSchemas.create), async (req: Request, res: Response) => {
  const contactData = req.body as CreateContactDTO;

  try {
    const contact = await contactService.create(contactData);
    res.status(201).json(successResponse(contact, 'Contact créé avec succès'));
  } catch (error) {
    const err = error as PgError;

    // Code PostgreSQL 23505 : Violation de contrainte d'unicité (unique_violation)
    // Ici, cela signifie que l'email existe déjà.
    if (err.code === '23505') {
      return res.status(409).json(errorResponse('Cette adresse email est déjà utilisée'));
    }

    // Propagation des autres erreurs (500 Internal Server Error)
    throw error;
  }
});

/**
 * PUT /api/v1/contact/:id
 * Met à jour un contact existant.
 */
router.put(
  '/:id',
  validate(IdParamSchema, 'params'),
  validate(contactSchemas.update),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const updateData = req.body as UpdateContactDTO;

    try {
      const updatedContact = await contactService.update(id, updateData);

      if (!updatedContact) {
        return res.status(404).json(errorResponse('Contact introuvable pour mise à jour'));
      }

      res.status(200).json(successResponse(updatedContact, 'Contact mis à jour'));
    } catch (error) {
      const err = error as PgError;

      // Gestion du conflit si le nouvel email appartient déjà à un autre contact
      if (err.code === '23505') {
        return res.status(409).json(errorResponse('Cet email est déjà associé à un autre contact'));
      }
      throw error;
    }
  }
);

/**
 * DELETE /api/v1/contact/:id
 * Supprime un contact.
 */
router.delete('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const contact = await contactService.delete(id);

  if (!contact) {
    return res.status(404).json(errorResponse('Contact introuvable'));
  }

  res.status(200).json(successResponse(null, 'Contact supprimé avec succès'));
});

export default router;
