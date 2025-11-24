/**
 * Page de gestion des Projets.
 *
 * Affichage des projets sous forme de grille avec indicateurs de progression.
 *
 *
 * @module ProjectsPage
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Composants Material UI
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';

// Icônes
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as ProjectIcon,
  People as PeopleIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';

// Composants internes et Types
import AppLoading from '../components/AppLoading';
import type { ApiResponse, ProjectWithDetails, Task } from '../../shared/index';

// Mapping des couleurs pour les statuts
const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning'> = {
  active: 'success',
  planning: 'warning',
  completed: 'primary',
  on_hold: 'default',
};

const Projects: React.FC = () => {
  // Le state utilise directement le type composite exporté du shared kernel
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Récupère la liste des projets depuis l'API.
   */
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get<ApiResponse<ProjectWithDetails[]>>('/api/v1/project/list');

      if (response.data.success && response.data.data) {
        setProjects(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement projets:', error);
      toast.error('Impossible de charger les projets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  /**
   * Gère la suppression d'un projet.
   */
  const handleDeleteProject = async (projectId: number) => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir supprimer ce projet ?\nCette action supprimera également toutes les tâches associées.'
      )
    ) {
      try {
        const response = await axios.delete<ApiResponse>(`/api/v1/project/${projectId}`);
        if (response.data.success) {
          toast.success('Projet supprimé avec succès');
          fetchProjects();
        }
      } catch (error) {
        console.error('Erreur suppression projet:', error);
        toast.error('Erreur lors de la suppression du projet');
      }
    }
  };

  /* --- Utilitaires d'affichage --- */

  const formatDate = (dateString: Date | string | null | undefined): string => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Note: Pick<Task, ...> est compatible avec le type partagé
  const calculateProgress = (tasks: Pick<Task, 'status'>[]): number => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const translateStatus = (status: string): string => {
    const translations: Record<string, string> = {
      active: 'Actif',
      planning: 'Planification',
      completed: 'Terminé',
      on_hold: 'En pause',
    };
    return translations[status] || status;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <AppLoading />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
          <ProjectIcon sx={{ mr: 1.5, fontSize: 36, color: 'primary.main' }} />
          Projets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => toast.info('Création de projet : Fonctionnalité à venir')}
          sx={{
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: 2,
          }}
        >
          Nouveau Projet
        </Button>
      </Box>

      {/* Grille des Projets */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={project.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Titre et Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    {project.name}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => toast.info('Modification : Fonctionnalité à venir')}
                      title="Modifier"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteProject(project.id)}
                      title="Supprimer"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Description */}
                {project.description && (
                  <Typography variant="body2" color="text.secondary" mb={2} sx={{ minHeight: 40 }}>
                    {project.description.length > 100
                      ? `${project.description.substring(0, 100)}...`
                      : project.description}
                  </Typography>
                )}

                {/* Statut */}
                <Box mb={3}>
                  <Chip
                    label={translateStatus(project.status)}
                    color={statusColors[project.status] || 'default'}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Statistiques (Compteurs) */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  mb={2}
                  sx={{ bgcolor: 'background.default', p: 1, borderRadius: 1 }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <TaskIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      {project._count?.tasks || 0} tâches
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="medium">
                      {project._count?.members || 0} membres
                    </Typography>
                  </Box>
                </Box>

                {/* Barre de Progression */}
                {project.tasks && project.tasks.length > 0 && (
                  <Box mb={3}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="text.secondary">
                        Progression
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {calculateProgress(project.tasks)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(project.tasks)}
                      sx={{ height: 6, borderRadius: 4 }}
                      color={calculateProgress(project.tasks) === 100 ? 'success' : 'primary'}
                    />
                  </Box>
                )}

                {/* Équipe */}
                {project.members && project.members.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="caption" display="block" mb={1} color="text.secondary">
                      Équipe
                    </Typography>
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                      {project.members.map((member) => (
                        <Avatar
                          key={member.id}
                          sx={{ width: 30, height: 30, fontSize: '0.75rem' }}
                          title={`${member.contact.firstName} ${member.contact.lastName} (${member.role})`}
                        >
                          {getInitials(member.contact.firstName, member.contact.lastName)}
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </Box>
                )}

                {/* Dates */}
                <Box mt="auto" pt={2} borderTop={1} borderColor="divider">
                  <Grid container justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      Début: {formatDate(project.startDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Fin: {formatDate(project.endDate)}
                    </Typography>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* État Vide */}
      {projects.length === 0 && (
        <Box textAlign="center" mt={8} py={8} bgcolor="background.paper" borderRadius={2}>
          <ProjectIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun projet trouvé
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez votre premier projet pour commencer à collaborer.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Projects;
