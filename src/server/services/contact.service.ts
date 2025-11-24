/**
 * Service de gestion des Contacts (Implémentation Drizzle).
 *
 * Ce module contient la logique métier liée aux contacts.
 * Il traduit les demandes de l'application en requêtes SQL via Drizzle ORM.
 *
 * 1. Utilisation de `db.query` pour la lecture (API relationnelle).
 * 2. Utilisation de `db.insert/update/delete` pour l'écriture (SQL Builder).
 * 3. Utilisation explicite de `.returning()` pour récupérer les données après modification.
 *
 * @module ContactService
 */

import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { contacts } from '../../shared/db-schema.js';

// Import des types partagés (DTOs et Modèles)
import type { Contact } from '../../shared/types.js';
import type { CreateContactDTO, UpdateContactDTO } from '../../shared/validators.js';

class ContactService {
  /**
   * Récupère la liste complète des contacts.
   * Triée par date de création décroissante (du plus récent au plus ancien).
   *
   * @returns {Promise<Contact[]>} Tableau des contacts.
   */
  async findAll(): Promise<Contact[]> {
    // Utilisation de l'API "Relational Query" (db.query)
    // C'est l'approche la plus simple pour des lectures standard.
    return db.query.contacts.findMany({
      orderBy: [desc(contacts.createdAt)],
    });
  }

  /**
   * Recherche un contact par son ID unique.
   *
   * @param {number} id - L'identifiant du contact.
   * @returns {Promise<Contact | undefined>} Le contact ou undefined s'il n'existe pas.
   */
  async findById(id: number): Promise<Contact | undefined> {
    return db.query.contacts.findFirst({
      where: eq(contacts.id, id),
      // On pourrait ajouter `with: { tasks: true }` ici si on voulait les relations
    });
  }

  /**
   * Crée un nouveau contact.
   *
   * @param {CreateContactDTO} data - Les données validées (sans ID ni dates).
   * @returns {Promise<Contact>} Le contact créé avec son ID généré.
   */
  async create(data: CreateContactDTO): Promise<Contact> {
    // Utilisation du SQL Builder pour l'insertion.
    // .values(data) : Drizzle mappe automatiquement les champs du DTO aux colonnes.
    // .returning() : Indispensable pour récupérer l'objet créé (notamment l'ID auto-incrémenté).
    const result = await db.insert(contacts).values(data).returning();

    // Drizzle retourne toujours un tableau (car on peut insérer plusieurs lignes).
    // On retourne le premier (et unique) élément.
    return result[0];
  }

  /**
   * Met à jour un contact existant.
   *
   * @param {number} id - L'identifiant cible.
   * @param {UpdateContactDTO} data - Les champs à modifier.
   * @returns {Promise<Contact | undefined>} Le contact mis à jour ou undefined si l'ID n'existe pas.
   */
  async update(id: number, data: UpdateContactDTO): Promise<Contact | undefined> {
    const result = await db
      .update(contacts)
      .set(data) // Applique les modifications partielles
      .where(eq(contacts.id, id)) // Clause WHERE id = ?
      .returning(); // Récupère la ligne modifiée

    // Si l'ID n'existe pas, le tableau result sera vide.
    return result[0];
  }

  /**
   * Supprime un contact.
   *
   * @param {number} id - L'identifiant à supprimer.
   * @returns {Promise<Contact | undefined>} Le contact supprimé (pour confirmation) ou undefined.
   */
  async delete(id: number): Promise<Contact | undefined> {
    const result = await db.delete(contacts).where(eq(contacts.id, id)).returning();

    return result[0];
  }
}

// Export d'une instance unique (Singleton)
export default new ContactService();
