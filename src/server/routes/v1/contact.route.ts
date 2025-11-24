/**
 * Routeur de gestion des Contacts.
 *
 * API RESTful pour les opérations CRUD.
 * Validation des entrées via Zod et gestion des erreurs natives SQLite.
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

// Interface d'erreur Better-SQLite3
interface SqliteError extends Error {
  code: string;
}

/* -------------------------------------------------------------------------- */
/*                                Lectures                                    */
/* -------------------------------------------------------------------------- */

router.get('/list', async (req: Request, res: Response) => {
  const contacts = await contactService.findAll();
  res.status(200).json(successResponse(contacts, 'Liste des contacts récupérée'));
});

router.get('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const contact = await contactService.findById(id);

  if (!contact) {
    return res.status(404).json(errorResponse('Contact introuvable'));
  }

  res.status(200).json(successResponse(contact));
});

/* -------------------------------------------------------------------------- */
/*                                Écritures                                   */
/* -------------------------------------------------------------------------- */

router.post('/', validate(contactSchemas.create), async (req: Request, res: Response) => {
  const contactData = req.body as CreateContactDTO;

  try {
    const contact = await contactService.create(contactData);
    res.status(201).json(successResponse(contact, 'Contact créé avec succès'));
  } catch (error) {
    // Gestion des contraintes d'unicité SQLite (ex: Email déjà pris)
    const err = error as SqliteError;
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json(errorResponse('Cette adresse email est déjà utilisée'));
    }
    throw error;
  }
});

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
      const err = error as SqliteError;
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json(errorResponse('Cet email est déjà associé à un autre contact'));
      }
      throw error;
    }
  }
);

router.delete('/:id', validate(IdParamSchema, 'params'), async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const contact = await contactService.delete(id);

  if (!contact) {
    return res.status(404).json(errorResponse('Contact introuvable'));
  }

  res.status(200).json(successResponse(null, 'Contact supprimé avec succès'));
});

export default router;
