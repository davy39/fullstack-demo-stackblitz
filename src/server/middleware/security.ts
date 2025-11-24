/**
 * Middlewares de sécurité et de journalisation.
 * Ce module regroupe les configurations de sécurité HTTP (headers, limitation de débit)
 * ainsi que les outils de surveillance basique (logger).
 *
 * @module SecurityMiddleware
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Tableau regroupant les middlewares de sécurité globaux.
 * Inclut la sécurisation des en-têtes HTTP via Helmet et la limitation de débit (Rate Limiting).
 *
 * @constant {RequestHandler[]}
 */
export const securityMiddleware: RequestHandler[] = [
  // Middleware Helmet pour sécuriser les en-têtes HTTP (XSS, Clickjacking, etc.)
  helmet(),

  // Limitation de débit pour prévenir les abus et les attaques par force brute
  rateLimit({
    windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre de 15 minutes
    message: 'Too many requests from this IP, please try again later', // Message renvoyé en cas de dépassement (429)
    standardHeaders: true, // Retourne les infos de limite dans les headers `RateLimit-*`
    legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  }),
];

/**
 * Middleware de journalisation des requêtes entrantes.
 * Affiche dans la console l'horodatage, la méthode HTTP et l'URL demandée pour chaque requête.
 *
 * @param {Request} req - L'objet de requête Express.
 * @param {Response} res - L'objet de réponse Express.
 * @param {NextFunction} next - La fonction pour passer au middleware suivant.
 *
 * @example
 * // Sortie console :
 * // 2023-10-27T10:00:00.000Z - GET /api/v1/contacts
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
};
