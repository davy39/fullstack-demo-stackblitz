/**
 * Utilitaires de formatage des réponses API.
 *
 * Ce module standardise la structure des réponses JSON renvoyées par le serveur.
 * Il utilise les types définis dans le dossier partagé (`src/shared`) pour assurer
 * la cohérence parfaite avec le frontend.
 *
 * @module ResponseUtils
 */

// Importation de l'interface partagée (Source unique de vérité)
// Note : L'extension .js est requise par la configuration TypeScript NodeNext du serveur.
import { ApiResponse } from '../../shared/index.js';

/**
 * Crée un objet de réponse API standardisé.
 * Fonction de base utilisée par les helpers de succès et d'erreur.
 *
 * @template T - Le type de la donnée payload.
 * @param {boolean} success - Indique si l'opération a réussi (`true`) ou échoué (`false`).
 * @param {T | null} [data=null] - La charge utile (payload) de données à retourner.
 * @param {string} [message=""] - Un message descriptif accompagnant la réponse.
 * @returns {ApiResponse<T | null>} L'objet de réponse formaté incluant un horodatage ISO.
 */
export const createResponse = <T>(
  success: boolean,
  data: T | null = null,
  message: string = ''
): ApiResponse<T | null> => ({
  success,
  data,
  message,
  timestamp: new Date().toISOString(),
});

/**
 * Helper pour créer une réponse de succès (HTTP 200/201).
 *
 * @template T - Le type de la donnée retournée.
 * @param {T} data - Les données à renvoyer.
 * @param {string} [message="Success"] - Message de succès.
 * @returns {ApiResponse<T>} La réponse typée strictement (sans null).
 */
export const successResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => {
  // On utilise 'as ApiResponse<T>' pour forcer le type.
  // On garantit à TypeScript que dans le cas d'un succès, data n'est pas null.
  return createResponse<T>(true, data, message) as ApiResponse<T>;
};

/**
 * Helper pour créer une réponse d'erreur (HTTP 400/404/500).
 *
 * @template T - Le type des détails d'erreur optionnels (par défaut `null`).
 * @param {string} [message="Error"] - Le message d'erreur expliquant le problème.
 * @param {T | null} [data=null] - Détails optionnels sur l'erreur (ex: champs invalides).
 * @returns {ApiResponse<T | null>} L'objet de réponse d'erreur.
 *
 * @example
 * // Retourne { success: false, data: null, message: "Contact introuvable", timestamp: "..." }
 * return res.status(404).json(errorResponse("Contact introuvable"));
 */
export const errorResponse = <T = null>(
  message: string = 'Error',
  data: T | null = null
): ApiResponse<T | null> => createResponse<T>(false, data, message);
