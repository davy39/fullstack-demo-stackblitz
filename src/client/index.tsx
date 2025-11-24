/**
 * Point d'entrée principal de l'application Frontend (React).
 *
 * Ce fichier initialise l'arbre de composants React et injecte les fournisseurs globaux
 * (Providers) nécessaires au fonctionnement de l'application :
 * - ThemeProvider (Material UI) : Gestion du style et des couleurs.
 * - BrowserRouter (React Router) : Gestion de la navigation et des URLs.
 * - ToastContainer (Toastify) : Gestion des notifications pop-up.
 *
 * @module ClientEntry
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

// Import des styles globaux et CSS tiers
import 'react-toastify/dist/ReactToastify.css';
import './app.css';

// Import du thème (Note : pas d'extension .js/.ts nécessaire avec Vite)
import { AppThemeProvider } from './theme/AppThemeProvider';

// Import des composants et pages
import Header from './components/Header';
import Home from './pages/Home';
import Contacts from './pages/Contacts';
import NewContact from './pages/NewContact';
import ContactDetail from './pages/ContactDetail';
import Tasks from './pages/Tasks';
import Projects from './pages/Projects';
import NotFound from './pages/NotFound';

// Récupération de l'élément DOM racine
const rootElement = document.getElementById('root');

// Vérification de sécurité pour TypeScript (rootElement peut être null)
if (rootElement) {
  const appRoot = createRoot(rootElement);

  appRoot.render(
    <React.Fragment>
      {/* Gestionnaire global des notifications (Toasts) */}
      <ToastContainer position="bottom-right" theme="dark" />

      {/* Fournisseur de thème Material UI */}
      <AppThemeProvider>
        {/* Gestionnaire de routing */}
        <BrowserRouter>
          <Header />

          <Routes>
            {/* Page d'accueil */}
            <Route path="/" element={<Home />} />

            {/* Routes Contacts */}
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/new-contact" element={<NewContact />} />
            <Route path="/contact/:id" element={<ContactDetail />} />

            {/* Routes Tâches */}
            <Route path="/tasks" element={<Tasks />} />

            {/* Routes Projets */}
            <Route path="/projects" element={<Projects />} />

            {/* Route 404 - Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppThemeProvider>
    </React.Fragment>
  );
} else {
  console.error("❌ Erreur critique : Impossible de trouver l'élément racine '#root' dans le DOM.");
}
