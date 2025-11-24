/**
 * Page d'accueil (Dashboard).
 *
 * Ce composant sert de point d'entrée principal à l'application.
 * Il remplit trois fonctions essentielles au chargement :
 * 1. Vérification de la santé du serveur (Health Check).
 * 2. Chargement initial des statistiques (volumétrie des données).
 * 3. Orientation de l'utilisateur (Guide d'installation si la BDD est vide/inaccessible).
 *
 * @module HomePage
 */

import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

// Composants Material UI
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';

// Icônes
import {
  ContactPage as ContactIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  Rocket as RocketIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

// Composants internes
import DatabaseSetupGuide from '../components/DatabaseSetupGuide';

// Types partagés
import type { ApiResponse, Contact, Task, Project } from '../../shared/index';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

// Structure des statistiques affichées sur le dashboard
interface DashboardStats {
  contacts: number;
  tasks: number;
  projects: number;
}

// États possibles du chargement initial
type DbStatus = 'checking' | 'connected' | 'error';

/* -------------------------------------------------------------------------- */
/*                                 Composant                                  */
/* -------------------------------------------------------------------------- */

const Home = () => {
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  /**
   * Effet de bord unique au montage du composant.
   * Vérifie la connexion à l'API et charge les données statistiques.
   */
  useEffect(() => {
    // Définition de la fonction asynchrone à l'intérieur de l'effet
    // pour éviter les avertissements de dépendances manquantes (React Hooks).
    const initDashboard = async () => {
      try {
        // 1. Vérification de disponibilité de l'API (Ping)
        await axios.get('/api/v1/health');

        // 2. Récupération parallèle des données pour les compteurs
        // On utilise Promise.all pour minimiser le temps d'attente global
        const [contactsRes, tasksRes, projectsRes] = await Promise.all([
          axios.get<ApiResponse<Contact[]>>('/api/v1/contact/list'),
          axios.get<ApiResponse<Task[]>>('/api/v1/task/list'),
          axios.get<ApiResponse<Project[]>>('/api/v1/project/list'),
        ]);

        // 3. Mise à jour de l'état avec les longueurs des tableaux
        setStats({
          contacts: contactsRes.data.data?.length || 0,
          tasks: tasksRes.data.data?.length || 0,
          projects: projectsRes.data.data?.length || 0,
        });

        setDbStatus('connected');
      } catch (error) {
        console.error('❌ Échec de la connexion au serveur:', error);
        setDbStatus('error');
      }
    };

    initDashboard();
  }, []); // Tableau vide = exécution unique au montage

  // Cas 1 : Échec de connexion (Serveur éteint ou BDD non initialisée)
  if (dbStatus === 'error') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <DatabaseSetupGuide onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  // Cas 2 : Chargement en cours
  if (dbStatus === 'checking') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" py={8}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Connexion au serveur en cours...
          </Typography>
        </Box>
      </Container>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                             Configuration UI                               */
  /* -------------------------------------------------------------------------- */

  // Cartes de navigation principales
  const features = [
    {
      icon: <ContactIcon fontSize="large" color="primary" />,
      title: 'Contacts',
      description: "Gérez votre carnet d'adresses professionnel.",
      link: '/contacts',
      count: stats?.contacts || 0,
      color: 'primary' as const,
    },
    {
      icon: <TaskIcon fontSize="large" color="secondary" />,
      title: 'Tâches',
      description: "Suivez vos priorités et l'avancement (Kanban).",
      link: '/tasks',
      count: stats?.tasks || 0,
      color: 'secondary' as const,
    },
    {
      icon: <ProjectIcon fontSize="large" color="success" />,
      title: 'Projets',
      description: 'Organisez le travail des équipes et les délais.',
      link: '/projects',
      count: stats?.projects || 0,
      color: 'success' as const,
    },
  ];

  // Cartes d'information technique
  const techFeatures = [
    {
      icon: <CodeIcon />,
      title: 'Stack Moderne',
      description: 'React 19, Vite, Express.js et Drizzle ORM.',
    },
    {
      icon: <RocketIcon />,
      title: 'Performance',
      description: 'Base de données SQLite via le driver rapide Better-SQLite3.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Sécurité & Typage',
      description: 'Validation Zod stricte et types partagés Client/Serveur.',
    },
  ];

  // Cas 3 : Affichage du Dashboard (Connecté)
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Section Héros */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Drizzle Full-Stack
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Plateforme de démonstration utilisant une architecture moderne React & Node.js.
        </Typography>

        {/* Indicateur de succès */}
        <Alert severity="success" sx={{ mt: 2, mb: 4, maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
          <Typography variant="body2">
            🎉 Système opérationnel : Base de données SQLite connectée.
          </Typography>
        </Alert>

        <Box>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/contacts"
            sx={{ px: 4, py: 1.5, fontWeight: 600, boxShadow: 3 }}
          >
            Explorer l'App
          </Button>
        </Box>
      </Box>

      {/* Grille des Fonctionnalités */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box mb={2}>{feature.icon}</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {feature.description}
                </Typography>
                <Chip
                  label={`${feature.count} éléments`}
                  color={feature.color}
                  size="small"
                  variant="outlined"
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  component={RouterLink}
                  to={feature.link}
                  variant="contained"
                  color={feature.color}
                  sx={{ minWidth: 140 }}
                >
                  Accéder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Section Technique */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
        Architecture Technique
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        {techFeatures.map((feature, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Card sx={{ height: '100%', bgcolor: 'background.default' }} variant="outlined">
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  {feature.icon}
                  <Typography variant="h6" component="h3" ml={1}>
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
