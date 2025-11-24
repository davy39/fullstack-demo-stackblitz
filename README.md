# Une démo Full-Stack dans votre navigateur


<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <br/>
  <img src="https://img.shields.io/badge/PostgreSQL_(PGLite)-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle" />
  <img src="https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white" alt="Material UI" />
</div>

---

## 🚀 Testez sans plus attendre : [![Open in Codeflow](https://developer.stackblitz.com/img/open_in_codeflow.svg)](https://pr.new/davy39/fullstack-demo-stackblitz)

---

## 🎓 Introduction

Bienvenue dans ce projet de démonstration **Full-Stack**. Ce n'est pas seulement un template, c'est un environnement pour comprendre comment construire des applications web modernes, robustes et typées de bout en bout (End-to-End Type Safety) en 2025.

Ce projet a été conçu comme une base de développement tournant directement dans votre navigateur sans aucune installation complexe.

### Ce que vous pourrez apprendre de ce projet :

1.  **Full-Stack TypeScript** : Comment partager du code (types, validateurs) entre le Frontend et le Backend.
2.  **Base de données WASM** : Utiliser PostgreSQL directement dans Node.js grâce à PGLite.
3.  **ORM Moderne** : Utiliser Drizzle pour interagir avec la base de données en TypeScript pur (fini le SQL brut).
4.  **Validation Isomorphique** : Utiliser Zod pour valider les formulaires (Client) et les API (Serveur) avec le même code.

---

## 🏗️ Architecture & Stack Technique

Pourquoi ces choix ? Voici le raisonnement derrière chaque brique technologique.

### 1. Le Langage : TypeScript
C'est la "colle" du projet. Il garantit que si vous changez une colonne dans la base de données, votre Frontend "casse" immédiatement (en rouge dans l'éditeur) avant même de lancer l'app.
*   **Client :** React 19 + Vite.
*   **Serveur :** Node.js + Express (compatible ESM).
*   **Partagé :** Dossier `src/shared` (Source de vérité).

### 2. La Base de Données : PostgreSQL (via PGLite)
Habituellement, PostgreSQL nécessite d'installer un serveur lourd ou Docker. Ici, nous utilisons **PGLite**.
*   **C'est quoi ?** Une version de PostgreSQL compilée en WebAssembly (WASM).
*   **L'avantage :** Elle tourne *dans* le processus Node.js. Les données sont stockées dans un simple dossier `./pgdata`. C'est aussi léger que SQLite, mais avec la puissance de Postgres.

### 3. L'ORM : Drizzle
Drizzle est l'ORM (Object-Relational Mapper) qui monte. Contrairement aux anciens ORM :
*   Il est **léger** (pas de moteur d'exécution lourd).
*   Il est **proche du SQL** (vous comprenez ce qu'il fait).
*   Il offre une **inférence de types magique** à partir du schéma.

### 4. La Validation : Zod
Zod permet de créer des schémas de validation.
*   **Frontend :** Utilisé avec `Formik` pour valider les formulaires avant l'envoi.
*   **Backend :** Utilisé dans les `middlewares` pour sécuriser les routes API.
*   **Bonus :** `drizzle-zod` génère les schémas Zod directement depuis la base de données !

---

## 🚀 Démarrage Rapide

Oubliez les configurations complexes. Tout est automatisé.

### 1. Installation
```bash
npm install
```

### 2. Lancement (Mode Développement)
Cette commande magique fait tout : elle nettoie, migre la base, remplit les données (seed) et lance le serveur.
```bash
npm run dev
```

> **Ouvrez votre navigateur sur `http://localhost:3001`**

### 3. Explorer la Base de Données (Drizzle Studio)
Vous voulez voir vos données brutes ? Drizzle fournit une interface magnifique.
```bash
npm run db:studio
```

---

## 📂 Structure du Projet (Expliquée)

```text
.
├── drizzle/                 # Migrations SQL générées automatiquement
├── scripts/                 # Scripts d'administration (Seed, Maintenance)
│   └── seed.ts              # Script qui peuple la BDD au démarrage
├── src/
│   ├── client/              # 🎨 FRONTEND (React)
│   │   ├── components/      # Composants UI réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   └── ...
│   ├── server/              # ⚙️ BACKEND (Express)
│   │   ├── db/              # Configuration de la connexion PGLite
│   │   ├── services/        # Logique métier (CRUD Drizzle)
│   │   ├── routes/          # Définition des endpoints API
│   │   └── ...
│   └── shared/              # 💎 LE COEUR (Shared Kernel)
│       ├── db-schema.ts     # Définition des tables (Source de vérité)
│       ├── validators.ts    # Schémas Zod générés pour la validation
│       └── types.ts         # Types TypeScript inférés pour le Frontend
└── drizzle.config.ts        # Configuration de l'outil de migration
```

---

## 🧠 Concepts Clés à Comprendre

### A. Le "Shared Kernel" (Noyau Partagé)
Regardez le fichier `src/shared/index.ts`. C'est le secret de ce projet.
Le Frontend n'invente pas ses types. Il les importe depuis ce dossier.

```typescript
// Dans le Frontend (ContactDetail.tsx)
import type { Contact } from '../../shared/index';

// Si je change 'firstName' en 'first_name' dans la BDD,
// TypeScript soulignera en rouge toutes les utilisations dans le React !
```

### B. Drizzle : "Insert-then-Fetch"
Drizzle est explicite. Quand on crée une donnée, il ne renvoie pas automatiquement les relations.
Regardez `src/server/services/task.service.ts` :
1. On insère la tâche.
2. On récupère son ID.
3. On refait une requête pour récupérer la tâche **ET** son projet associé pour l'affichage.

### C. Gestion des Erreurs Native
Au lieu de deviner pourquoi une requête échoue, nous attrapons les codes d'erreur PostgreSQL natifs dans les routes (`src/server/routes`).
*   Code `23505` : Unicité violée (ex: Email déjà pris).
*   Code `23503` : Clé étrangère invalide (ex: Projet introuvable).

---

## 🛠️ Liste des Commandes

| Commande | Description |
| :--- | :--- |
| `npm run dev` | **La commande principale.** Reset DB + Seed + Start Client/Server. |
| `npm run db:generate` | Analyse `db-schema.ts` et crée les fichiers SQL dans `/drizzle`. |
| `npm run db:migrate` | Applique les fichiers SQL à la base de données locale. |
| `npm run db:push` | Synchronise la BDD avec le code sans créer de fichiers SQL (Prototypage). |
| `npm run db:studio` | Ouvre l'interface graphique pour gérer les données. |
| `npm run lint` | Vérifie la qualité du code (ESLint). |

---

<div align="center">
  <i>Conçu avec ❤️ pour l'apprentissage du Full-Stack moderne.</i>
</div>