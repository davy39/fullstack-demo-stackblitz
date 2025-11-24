import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de gestion des erreurs.
 *
 * Il standardise toutes les exceptions levées dans l'application
 * pour renvoyer une réponse JSON uniforme.
 */

// Interface minimale pour typer l'erreur (qui a souvent un statusCode)
interface HttpError extends Error {
  statusCode?: number;
}

export const globalErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log de l'erreur côté serveur pour le débogage
  console.error(`❌ [${req.method}] ${req.path} >> Error:`, err);

  // Détermination du code HTTP
  // On utilise err.statusCode s'il existe (ex: erreur créée manuellement), sinon 500
  const statusCode = err.statusCode || 500;

  // Message d'erreur
  // En production, on masque les erreurs internes (500) pour ne pas fuiter d'infos sensibles
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Une erreur interne est survenue'
      : err.message || 'Unknown Error';

  res.status(statusCode).json({
    success: false,
    message: message,
    // La stack trace est précieuse en dev, mais dangereuse en prod
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // On peut ajouter timestamp ici si on veut respecter l'interface ApiResponse
    timestamp: new Date().toISOString(),
  });
};
