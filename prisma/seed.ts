/**
 * Script de peuplement de la base de données (Seeding).
 *
 * Ce script est exécuté via `npm run db:seed`. Il permet d'initialiser la base
 * avec des données de test réalistes pour le développement.
 *
 * Il utilise l'adaptateur SQLite explicite pour garantir la compatibilité
 * avec la configuration 'Better-SQLite3' du projet.
 */

import { PrismaClient, TaskStatus, Priority } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// 1. Configuration de l'adaptateur SQLite
// On utilise l'URL définie dans .env ou un fichier local par défaut
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

// 2. Initialisation du client Prisma avec l'adaptateur
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  console.log('🌱 Démarrage du peuplement de la base de données...');

  /* -------------------------------------------------------------------------- */
  /*                            1. Création des Contacts                        */
  /* -------------------------------------------------------------------------- */

  // Utilisation de Promise.all pour paralléliser les créations (performance)
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '06 01 02 03 04',
        company: 'Tech Corp',
        notes: "Développeur Lead avec 10 ans d'expérience en React.",
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@example.com',
        phone: '06 99 88 77 66',
        company: 'Design Studio',
        notes: 'Experte UI/UX spécialisée dans les interfaces mobiles.',
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Pierre',
        lastName: 'Durand',
        email: 'pierre.durand@example.com',
        phone: '06 12 34 56 78',
        company: 'Marketing Inc',
        notes: 'Chef de projet certifié Scrum Master.',
      },
    }),
    prisma.contact.create({
      data: {
        firstName: 'Sophie',
        lastName: 'Dubois',
        email: 'sophie.dubois@example.com',
        phone: '06 11 22 33 44',
        company: 'Data Analytics Co',
        notes: 'Data scientist, experte en Machine Learning et Python.',
      },
    }),
  ]);

  /* -------------------------------------------------------------------------- */
  /*                            2. Création des Projets                         */
  /* -------------------------------------------------------------------------- */

  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Plateforme E-commerce',
        description: 'Refonte complète du site marchand avec React 19 et Node.js.',
        status: 'active', // Statut personnalisé (String dans le schéma)
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Application Mobile',
        description: 'App native pour la gestion de tâches (iOS/Android).',
        status: 'active',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-15'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Dashboard Analytique',
        description: 'Tableau de bord BI temps réel pour la direction.',
        status: 'planning',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-09-30'),
      },
    }),
  ]);

  /* -------------------------------------------------------------------------- */
  /*                        3. Assignation des Membres                          */
  /* -------------------------------------------------------------------------- */

  const projectMembers = await Promise.all([
    // Équipe E-commerce
    prisma.projectMember.create({
      data: {
        contactId: contacts[0].id, // Jean (Dev)
        projectId: projects[0].id,
        role: 'lead_dev',
      },
    }),
    prisma.projectMember.create({
      data: {
        contactId: contacts[1].id, // Marie (Design)
        projectId: projects[0].id,
        role: 'designer',
      },
    }),
    prisma.projectMember.create({
      data: {
        contactId: contacts[2].id, // Pierre (PM)
        projectId: projects[0].id,
        role: 'chef_de_projet',
      },
    }),
    // Équipe Mobile
    prisma.projectMember.create({
      data: {
        contactId: contacts[0].id, // Jean
        projectId: projects[1].id,
        role: 'developpeur',
      },
    }),
    prisma.projectMember.create({
      data: {
        contactId: contacts[1].id, // Marie
        projectId: projects[1].id,
        role: 'lead_designer',
      },
    }),
    // Équipe Data
    prisma.projectMember.create({
      data: {
        contactId: contacts[3].id, // Sophie (Data)
        projectId: projects[2].id,
        role: 'data_scientist',
      },
    }),
    prisma.projectMember.create({
      data: {
        contactId: contacts[2].id, // Pierre
        projectId: projects[2].id,
        role: 'chef_de_projet',
      },
    }),
  ]);

  /* -------------------------------------------------------------------------- */
  /*                            4. Création des Tâches                          */
  /* -------------------------------------------------------------------------- */

  const tasks = await Promise.all([
    // Tâches E-commerce
    prisma.task.create({
      data: {
        title: 'Initialiser le dépôt Git',
        description: 'Configurer le projet React avec TypeScript, ESLint et Prettier.',
        status: TaskStatus.DONE, // Utilisation de l'Enum Prisma
        priority: Priority.HIGH, // Utilisation de l'Enum Prisma
        assigneeId: contacts[0].id,
        projectId: projects[0].id,
        dueDate: new Date('2024-01-20'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Maquettes de la page de connexion',
        description: "Créer les wireframes pour le flux d'authentification.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        assigneeId: contacts[1].id,
        projectId: projects[0].id,
        dueDate: new Date('2024-02-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Développer le catalogue produits',
        description: 'Implémenter la liste des produits avec filtres et recherche.',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeId: contacts[0].id,
        projectId: projects[0].id,
        dueDate: new Date('2024-03-01'),
      },
    }),
    // Tâches Mobile
    prisma.task.create({
      data: {
        title: 'Navigation principale',
        description: 'Mettre en place la TabBar et le routing mobile.',
        status: TaskStatus.REVIEW,
        priority: Priority.HIGH,
        assigneeId: contacts[1].id,
        projectId: projects[1].id,
        dueDate: new Date('2024-02-20'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Formulaire de création de tâche',
        description: 'Créer les écrans de saisie avec validation Zod.',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        assigneeId: contacts[0].id,
        projectId: projects[1].id,
        dueDate: new Date('2024-03-10'),
      },
    }),
    // Tâches Data
    prisma.task.create({
      data: {
        title: 'Benchmark des librairies de graphiques',
        description: 'Comparer Recharts, D3.js et Chart.js pour le dashboard.',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        assigneeId: contacts[3].id,
        projectId: projects[2].id,
        dueDate: new Date('2024-03-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Pipeline ETL',
        description: "Configurer l'ingestion des données depuis l'API de production.",
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        assigneeId: contacts[3].id,
        projectId: projects[2].id,
        dueDate: new Date('2024-04-01'),
      },
    }),
  ]);

  console.log('✅ Base de données peuplée avec succès !');
  console.log(`👉 ${contacts.length} contacts créés`);
  console.log(`👉 ${projects.length} projets créés`);
  console.log(`👉 ${projectMembers.length} membres assignés`);
  console.log(`👉 ${tasks.length} tâches créées`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du peuplement de la base :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
