/**
 * Page de gestion des Tâches.
 *
 * Permet de visualiser, filtrer et gérer les tâches.
 * Inclut des fonctionnalités de changement rapide de statut (Workflow)
 * et de filtrage par priorité/statut.
 *
 * @module TasksPage
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import Grid from '@mui/material/Grid';

// Icônes
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';

// Composants internes et Types
import AppLoading from '../components/AppLoading';
import type { ApiResponse, Task, Project, Contact } from '../../shared/index';

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

// Type composite pour une tâche avec ses relations (retourné par l'API)
interface TaskWithDetails extends Task {
  project?: Pick<Project, 'id' | 'name' | 'status'> | null;
  assignee?: Pick<Contact, 'id' | 'firstName' | 'lastName' | 'email'> | null;
}

// Configuration des couleurs pour les statuts et priorités
type ColorVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';

const statusColors: Record<string, ColorVariant> = {
  TODO: 'default',
  IN_PROGRESS: 'primary',
  REVIEW: 'warning',
  DONE: 'success',
};

const priorityColors: Record<string, ColorVariant> = {
  LOW: 'success',
  MEDIUM: 'warning',
  HIGH: 'error',
  URGENT: 'error',
};

/* -------------------------------------------------------------------------- */
/*                                 Composant                                  */
/* -------------------------------------------------------------------------- */

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  /**
   * Récupère les tâches depuis l'API avec les filtres actifs.
   */
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const response = await axios.get<ApiResponse<TaskWithDetails[]>>(
        `/api/v1/task/list?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
      toast.error('Impossible de charger la liste des tâches');
    } finally {
      setLoading(false);
    }
  };

  // Rechargement automatique lors du changement des filtres
  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  /**
   * Met à jour le statut d'une tâche (Workflow).
   */
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      const response = await axios.patch<ApiResponse<TaskWithDetails>>(
        `/api/v1/task/${taskId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        toast.success('Statut mis à jour');
        // Optimisation : Mise à jour locale pour éviter un rechargement complet
        setTasks((prev) =>
          prev.map(
            (t) => (t.id === taskId ? { ...t, status: newStatus as any } : t) // Cast 'any' car TaskStatus est un enum ou string
          )
        );
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Échec de la mise à jour du statut');
    }
  };

  /**
   * Supprime une tâche.
   */
  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      try {
        const response = await axios.delete<ApiResponse>(`/api/v1/task/${taskId}`);

        if (response.data.success) {
          toast.success('Tâche supprimée');
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
        }
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
        toast.error('Impossible de supprimer la tâche');
      }
    }
  };

  /* --- Utilitaires --- */

  const formatDate = (dateString: Date | string | null | undefined): string => {
    if (!dateString) return 'Aucune échéance';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      TODO: 'À Faire',
      IN_PROGRESS: 'En Cours',
      REVIEW: 'En Revue',
      DONE: 'Terminé',
    };
    return map[status] || status;
  };

  const translatePriority = (p: string) => {
    const map: Record<string, string> = {
      LOW: 'Basse',
      MEDIUM: 'Moyenne',
      HIGH: 'Haute',
      URGENT: 'Urgente',
    };
    return map[p] || p;
  };

  // Loader initial
  if (loading && tasks.length === 0) {
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
          <TaskIcon sx={{ mr: 1.5, verticalAlign: 'middle' }} />
          Tâches
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => toast.info('Création de tâche : Fonctionnalité à venir')}
          sx={{
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: 2,
          }}
        >
          Nouvelle Tâche
        </Button>
      </Box>

      {/* Barre de Filtres */}
      <Box
        display="flex"
        gap={2}
        mb={4}
        sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 2, boxShadow: 1 }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Statut</InputLabel>
          <Select
            value={statusFilter}
            label="Statut"
            onChange={(e: SelectChangeEvent) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="TODO">À Faire</MenuItem>
            <MenuItem value="IN_PROGRESS">En Cours</MenuItem>
            <MenuItem value="REVIEW">En Revue</MenuItem>
            <MenuItem value="DONE">Terminé</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Priorité</InputLabel>
          <Select
            value={priorityFilter}
            label="Priorité"
            onChange={(e: SelectChangeEvent) => setPriorityFilter(e.target.value)}
          >
            <MenuItem value="">Toutes</MenuItem>
            <MenuItem value="LOW">Basse</MenuItem>
            <MenuItem value="MEDIUM">Moyenne</MenuItem>
            <MenuItem value="HIGH">Haute</MenuItem>
            <MenuItem value="URGENT">Urgente</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Grille des Tâches */}
      <Grid container spacing={3}>
        {tasks.map((task) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={task.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderLeft: 6,
                borderColor: `${priorityColors[task.priority]}.main`,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Titre et Actions */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h2" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    {task.title}
                  </Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => toast.info('Modification : Fonctionnalité à venir')}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Description */}
                {task.description && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {task.description}
                  </Typography>
                )}

                {/* Badges */}
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  <Chip
                    label={translateStatus(task.status)}
                    color={statusColors[task.status]}
                    size="small"
                  />
                  <Chip
                    label={translatePriority(task.priority)}
                    color={priorityColors[task.priority]}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                  Échéance : {formatDate(task.dueDate)}
                </Typography>

                {task.assignee && (
                  <Typography variant="caption" display="block" color="text.secondary" mb={0.5}>
                    Assigné à :{' '}
                    <strong>
                      {task.assignee.firstName} {task.assignee.lastName}
                    </strong>
                  </Typography>
                )}

                {task.project && (
                  <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                    Projet : <strong>{task.project.name}</strong>
                  </Typography>
                )}

                {/* Actions Rapides (Workflow) */}
                <Box display="flex" gap={1} flexWrap="wrap" mt="auto" pt={2}>
                  {task.status !== 'TODO' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusChange(task.id, 'TODO')}
                    >
                      À Faire
                    </Button>
                  )}
                  {task.status !== 'IN_PROGRESS' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                    >
                      En Cours
                    </Button>
                  )}
                  {task.status !== 'REVIEW' && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusChange(task.id, 'REVIEW')}
                    >
                      Revue
                    </Button>
                  )}
                  {task.status !== 'DONE' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="success"
                      onClick={() => handleStatusChange(task.id, 'DONE')}
                    >
                      Terminé
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* État Vide */}
      {tasks.length === 0 && !loading && (
        <Box textAlign="center" mt={8}>
          <Typography variant="h6" color="text.secondary">
            Aucune tâche trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Essayez de modifier les filtres ou créez une nouvelle tâche.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Tasks;
