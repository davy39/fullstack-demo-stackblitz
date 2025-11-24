/**
 * Service de gestion des Contacts.
 *
 * Ce module contient toute la logique métier liée aux contacts et agit comme une couche
 * d'abstraction entre le contrôleur (routes) et la base de données (Prisma).
 *
 * @module ContactService
 */

import { Contact } from '@prisma/client';
import { prisma } from './database.js';
import { CreateContactDTO, UpdateContactDTO } from '../middleware/validate.js';

class ContactService {
  /**
   * Récupère la liste de tous les contacts enregistrés.
   *
   * @returns {Promise<Contact[]>} Une promesse contenant le tableau des contacts.
   */
  async findAll(): Promise<Contact[]> {
    return prisma.contact.findMany({
      orderBy: {
        createdAt: 'desc', // Tri par défaut : les plus récents en premier
      },
    });
  }

  /**
   * Recherche un contact par son identifiant unique.
   *
   * @param {number} id - L'identifiant du contact.
   * @returns {Promise<Contact | null>} Le contact trouvé ou null s'il n'existe pas.
   */
  async findById(id: number): Promise<Contact | null> {
    return prisma.contact.findUnique({
      where: { id },
      // Optionnel : On pourrait inclure les relations ici (ex: tâches)
      // include: { tasks: true }
    });
  }

  /**
   * Crée un nouveau contact dans la base de données.
   *
   * @param {CreateContactDTO} data - Les données validées du contact.
   * @returns {Promise<Contact>} Le contact nouvellement créé.
   * @throws {Prisma.PrismaClientKnownRequestError} Si l'email existe déjà (P2002).
   */
  async create(data: CreateContactDTO): Promise<Contact> {
    return prisma.contact.create({
      data,
    });
  }

  /**
   * Met à jour les informations d'un contact existant.
   *
   * @param {number} id - L'identifiant du contact à modifier.
   * @param {UpdateContactDTO} data - Les données partielles à mettre à jour.
   * @returns {Promise<Contact>} Le contact mis à jour.
   * @throws {Prisma.PrismaClientKnownRequestError} Si le contact n'existe pas ou conflit d'email.
   */
  async update(id: number, data: UpdateContactDTO): Promise<Contact> {
    return prisma.contact.update({
      where: { id },
      data,
    });
  }

  /**
   * Supprime définitivement un contact.
   *
   * @param {number} id - L'identifiant du contact à supprimer.
   * @returns {Promise<Contact>} Le contact qui vient d'être supprimé.
   * @throws {Prisma.PrismaClientKnownRequestError} Si le contact n'existe pas.
   */
  async delete(id: number): Promise<Contact> {
    return prisma.contact.delete({
      where: { id },
    });
  }
}

// Export d'une instance unique (Singleton) du service
export default new ContactService();
