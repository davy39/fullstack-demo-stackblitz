/**
 * Middleware de validation des requêtes HTTP.
 *
 * Ce module fournit un middleware Express générique capable de valider
 * n'importe quelle partie de la requête (Body, Query, Params) à l'aide de schémas Zod.
 *
 * Il agit comme un gardien :
 * 1. Il intercepte la requête avant le contrôleur.
 * 2. Il valide et nettoie les données (suppression des champs inconnus).
 * 3. Il renvoie une erreur 400 formatée si les données sont invalides.
 *
 * @module ValidationMiddleware
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

/**
 * Fabrique (Factory) de middleware pour la validation des données.
 *
 * @param {ZodType} schema - Le schéma Zod (défini dans src/shared) à appliquer.
 * @param {"body" | "query" | "params"} source - La partie de la requête à valider (défaut: "body").
 * @returns {Function} Un middleware Express asynchrone prêt à être utilisé dans les routes.
 *
 * @example
 * // Dans une route :
 * router.post('/', validate(ContactSchema), controller);
 */
export const validate =
  (schema: ZodType, source: 'body' | 'query' | 'params' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Analyse et transformation asynchrone
      // parseAsync valide les données et applique les transformations (coerce, trim...)
      // Zod retire automatiquement les clés non définies dans le schéma (strip)
      const validData = await schema.parseAsync(req[source]);

      // 2. Remplacement des données brutes
      // On remplace l'objet original par l'objet nettoyé et typé.
      req[source] = validData;

      // Si tout est bon, on passe au contrôleur suivant
      next();
    } catch (error) {
      // 3. Gestion des erreurs de validation Zod
      if (error instanceof ZodError) {
        // On transforme la structure d'erreur complexe de Zod en une liste simple
        // facile à consommer pour le frontend.
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'), // ex: "address.zipCode"
          message: issue.message, // ex: "Code postal invalide"
        }));

        // On renvoie une 400 (Bad Request) immédiatement
        return res.status(400).json({
          success: false,
          message: 'Données invalides',
          errors: formattedErrors,
        });
      }

      // Si ce n'est pas une erreur de validation, on laisse le gestionnaire global s'en occuper
      next(error);
    }
  };

/* -------------------------------------------------------------------------- */
/*                           Ré-export des Schémas                            */
/* -------------------------------------------------------------------------- */

// Nous ré-exportons tout le contenu du module partagé.
// Cela permet aux fichiers de routes (ex: contact.route.ts) d'importer
// à la fois le middleware 'validate' et les schémas (ex: 'CreateContactDTO')
// depuis un seul endroit : ce fichier middleware.
export * from '../../shared/index.js';
