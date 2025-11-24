/**
 * Page d'accueil (Dashboard).
 *
 * Cette page sert de point d'entrée principal. Elle effectue une vérification
 * de santé du backend (Health Check) et affiche un résumé des données disponibles.
 * Elle guide également l'utilisateur si la base de données n'est pas configurée.
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
} from '@mui/material';
import Grid from '@mui/material/Grid';

// Icônes
import {
  ContactPage as ContactIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  Rocket as RocketIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

import DatabaseSetupGuide from '../components/DatabaseSetupGuide';

// Types pour l'état des statistiques
interface DashboardStats {
  contacts: number;
  tasks: number;
  projects: number;
}

// Types pour l'état de connexion
type DbStatus = 'checking' | 'connected' | 'error';

const Home = () => {
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  /**
   * Vérifie la connexion au backend et récupère les statistiques de base.
   * Cette fonction est appelée au montage du composant.
   */
  const checkDatabaseConnection = async () => {
    try {
      setDbStatus('checking');
      console.log('🔍 Vérification de la connexion base de données...');

      // 1. Health Check basique (Ping)
      // catch(() => null) permet de ne pas lancer d'exception si le serveur est éteint
      const healthRes = await axios.get('/api/v1/health').catch(() => null);

      if (!healthRes) {
        throw new Error('Le serveur ne répond pas');
      }

      // 2. Récupération des données (Counts)
      // On utilise Promise.all pour paralléliser les requêtes
      const [contactsRes, tasksRes, projectsRes] = await Promise.all([
        axios.get('/api/v1/contact/list').catch(() => ({ data: { data: [] } })),
        axios.get('/api/v1/task/list').catch(() => ({ data: { data: [] } })),
        axios.get('/api/v1/project/list').catch(() => ({ data: { data: [] } })),
      ]);

      setStats({
        contacts: contactsRes.data.data?.length || 0,
        tasks: tasksRes.data.data?.length || 0,
        projects: projectsRes.data.data?.length || 0,
      });

      setDbStatus('connected');
      console.log('✅ Connexion réussie');
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setDbStatus('error');
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
  }, []);

  // Affichage conditionnel : Erreur de connexion
  if (dbStatus === 'error') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <DatabaseSetupGuide onRetry={checkDatabaseConnection} />
      </Container>
    );
  }

  // Affichage conditionnel : Chargement
  if (dbStatus === 'checking') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" py={8}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Vérification de la connexion...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Configuration des cartes de fonctionnalités (Features)
  const features = [
    {
      icon: <ContactIcon fontSize="large" color="primary" />,
      title: 'Gestion des Contacts',
      description: "Gérez votre carnet d'adresses avec détails, entreprises et notes.",
      link: '/contacts',
      count: stats?.contacts || 0,
      color: 'primary' as const,
    },
    {
      icon: <TaskIcon fontSize="large" color="secondary" />,
      title: 'Suivi des Tâches',
      description: 'Suivez vos tâches avec priorités, statuts et assignations.',
      link: '/tasks',
      count: stats?.tasks || 0,
      color: 'secondary' as const,
    },
    {
      icon: <ProjectIcon fontSize="large" color="success" />,
      title: "Projets d'Équipe",
      description: 'Organisez vos projets, gérez les membres et les délais.',
      link: '/projects',
      count: stats?.projects || 0,
      color: 'success' as const,
    },
  ];

  // Configuration des cartes techniques
  const techFeatures = [
    {
      icon: <CodeIcon />,
      title: 'Stack Moderne',
      description: 'React 19, Vite, Express.js, SQLite (via Prisma) et TypeScript Strict.',
    },
    {
      icon: <RocketIcon />,
      title: 'Expérience Dév',
      description: 'Hot reload instantané, ESLint, Prettier et architecture modulaire.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Production Ready',
      description: "Validation Zod, gestion d'erreurs centralisée et sécurité HTTP.",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* --- Section Héros --- */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Template Full-Stack Moderne
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Une application de gestion de projet complète construite avec React, Express et SQLite.
        </Typography>

        {/* Message de succès si des données sont détectées */}
        {stats && (stats.contacts > 0 || stats.tasks > 0 || stats.projects > 0) && (
          <Alert
            severity="success"
            sx={{ mt: 2, mb: 4, maxWidth: 600, mx: 'auto', borderRadius: 2 }}
          >
            <Typography variant="body2">
              🎉 La base de données est connectée et contient des données !
            </Typography>
          </Alert>
        )}

        <Box>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/contacts"
            sx={{
              mr: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3,
            }}
          >
            Explorer l'App
          </Button>
          <Button
            variant="outlined"
            size="large"
            href="https://github.com/Avinava/simple-vite-react-express"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 },
            }}
          >
            Voir le Code
          </Button>
        </Box>
      </Box>

      {/* --- Section Fonctionnalités (Grid) --- */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
        Fonctionnalités Incluses
      </Typography>

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

      {/* --- Section Technique --- */}
      <Typography variant="h4" component="h2" textAlign="center" gutterBottom mb={4}>
        Stack Technique
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
