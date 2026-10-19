/**
 * Page d'accueil (Dashboard).
 *
 * Point d'entrée principal de l'application.
 * Affiche l'état de la connexion et présente la stack technique mise à jour (PGLite).
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

import DatabaseSetupGuide from '../components/DatabaseSetupGuide';
import type { ApiResponse, Contact, Task, Project } from '../../shared/index';

interface DashboardStats {
  contacts: number;
  tasks: number;
  projects: number;
}

type DbStatus = 'checking' | 'connected' | 'error';

const Home = () => {
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initDashboard = async (retryCount = 0) => {
      try {
        // 1. Health Check
        await axios.get('/api/v1/health');

        // 2. Chargement des données
        const [contactsRes, tasksRes, projectsRes] = await Promise.all([
          axios.get<ApiResponse<Contact[]>>('/api/v1/contact/list'),
          axios.get<ApiResponse<Task[]>>('/api/v1/task/list'),
          axios.get<ApiResponse<Project[]>>('/api/v1/project/list'),
        ]);

        if (isMounted) {
          setStats({
            contacts: contactsRes.data.data?.length || 0,
            tasks: tasksRes.data.data?.length || 0,
            projects: projectsRes.data.data?.length || 0,
          });

          setDbStatus('connected');
        }
      } catch (error) {
        // En environnement WebContainer / StackBlitz, le serveur backend met parfois quelques secondes
        // à démarrer et initialiser PGLite. On réessaie quelques fois avant d'afficher l'erreur.
        if (retryCount < 5) {
          setTimeout(() => {
            if (isMounted) initDashboard(retryCount + 1);
          }, 1500);
        } else {
          console.error('❌ Erreur connexion PGLite:', error);
          if (isMounted) setDbStatus('error');
        }
      }
    };

    initDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  if (dbStatus === 'error') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <DatabaseSetupGuide onRetry={() => window.location.reload()} />
      </Container>
    );
  }

  if (dbStatus === 'checking') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" py={8}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Démarrage de PGLite...
          </Typography>
        </Box>
      </Container>
    );
  }

  const features = [
    {
      icon: <ContactIcon fontSize="large" color="primary" />,
      title: 'Contacts',
      description: 'Annuaire professionnel centralisé.',
      link: '/contacts',
      count: stats?.contacts || 0,
      color: 'primary' as const,
    },
    {
      icon: <TaskIcon fontSize="large" color="secondary" />,
      title: 'Tâches',
      description: 'Gestion de projet agile (Kanban).',
      link: '/tasks',
      count: stats?.tasks || 0,
      color: 'secondary' as const,
    },
    {
      icon: <ProjectIcon fontSize="large" color="success" />,
      title: 'Projets',
      description: 'Suivi des équipes et des délais.',
      link: '/projects',
      count: stats?.projects || 0,
      color: 'success' as const,
    },
  ];

  // Mise à jour des cartes techniques pour refléter le changement d'architecture
  const techFeatures = [
    {
      icon: <CodeIcon />,
      title: 'Stack Moderne',
      description: 'React 19, Vite, Express.js et Drizzle ORM.',
    },
    {
      icon: <RocketIcon />,
      title: 'PostgreSQL WASM',
      description: 'Moteur PGLite embarqué : la puissance de Postgres sans Docker.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Type Safety',
      description: 'Validation Zod et typage strict de bout en bout.',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Héros */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Full-Stack PGLite
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Architecture de démonstration avec PostgreSQL embarqué (WASM).
        </Typography>

        <Alert severity="success" sx={{ mt: 2, mb: 4, maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
          <Typography variant="body2">
            🎉 Base de données <strong>PostgreSQL (PGLite)</strong> connectée et opérationnelle.
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
            Explorer les Données
          </Button>
        </Box>
      </Box>

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
                  label={`${feature.count} enregistrements`}
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
