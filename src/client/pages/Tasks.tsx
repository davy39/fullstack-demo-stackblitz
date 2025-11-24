/**
 * Page de gestion des Tâches (Kanban simplifié).
 *
 * Cette page permet de :
 * 1. Visualiser les tâches sous forme de cartes.
 * 2. Filtrer les tâches par Statut et Priorité via l'API.
 * 3. Modifier le statut d'une tâche rapidement (Workflow).
 * 4. Supprimer des tâches.
 *
 * ARCHITECTURE :
 * - Utilisation de `useCallback` pour stabiliser la fonction `fetchTasks` et respecter les règles des Hooks.
 * - Typage strict via `TaskWithDetails` importé du module partagé pour éviter les erreurs `any`.
 * - Mise à jour optimiste (Optimistic UI) lors du changement de statut pour une interface réactive.
 *
 * @module TasksPage
 */

import React, { useState, useEffect, useCallback } from 'react';
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
  Grid,
} from '@mui/material';

// Icônes
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as TaskIcon,
} from '@mui/icons-material';

// Composants internes et Types
import AppLoading from '../components/AppLoading';
import type { ApiResponse, TaskWithDetails } from '../../shared/index';

/* -------------------------------------------------------------------------- */
/*                             Configuration UI                               */
/* -------------------------------------------------------------------------- */

// Définition des couleurs sémantiques pour les badges
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
  // État des données
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // État des filtres
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  /**
   * Récupère les tâches depuis l'API en fonction des filtres actuels.
   *
   * NOTE : Utilisation de `useCallback` pour mémoriser la fonction.
   * Cela permet de l'ajouter sans danger dans le tableau de dépendances du useEffect,
   * résolvant ainsi l'avertissement "react-hooks/exhaustive-deps".
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      // Construction des paramètres de requête (Query String)
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
  }, [statusFilter, priorityFilter]); // La fonction est recréée uniquement si les filtres changent

  /**
   * Effet déclenchant le chargement initial et lors du changement des filtres.
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Met à jour le statut d'une tâche (Workflow).
   * Effectue une mise à jour locale immédiate pour la fluidité (Optimistic UI).
   */
  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      // 1. Appel API
      const response = await axios.patch<ApiResponse<TaskWithDetails>>(
        `/api/v1/task/${taskId}/status`,
        { status: newStatus }
      );

      if (response.data.success) {
        toast.success('Statut mis à jour');

        // 2. Mise à jour de l'état local sans recharger toute la liste
        // On utilise TaskWithDetails['status'] pour garantir le typage strict (pas de 'any')
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus as TaskWithDetails['status'] } : task
          )
        );
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Échec de la mise à jour du statut');
    }
  };

  /**
   * Supprime une tâche après confirmation.
   */
  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      try {
        const response = await axios.delete<ApiResponse>(`/api/v1/task/${taskId}`);

        if (response.data.success) {
          toast.success('Tâche supprimée');
          // Suppression locale
          setTasks((prev) => prev.filter((t) => t.id !== taskId));
        }
      } catch (error) {
        console.error('Erreur suppression tâche:', error);
        toast.error('Impossible de supprimer la tâche');
      }
    }
  };

  /* --- Fonctions Utilitaires d'affichage --- */

  const formatDate = (dateString: Date | string | null | undefined): string => {
    if (!dateString) return 'Aucune échéance';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const translateStatus = (status: string): string => {
    const map: Record<string, string> = {
      TODO: 'À Faire',
      IN_PROGRESS: 'En Cours',
      REVIEW: 'En Revue',
      DONE: 'Terminé',
    };
    return map[status] || status;
  };

  const translatePriority = (p: string): string => {
    const map: Record<string, string> = {
      LOW: 'Basse',
      MEDIUM: 'Moyenne',
      HIGH: 'Haute',
      URGENT: 'Urgente',
    };
    return map[p] || p;
  };

  // Affichage loader initial
  if (loading && tasks.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <AppLoading />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* En-tête avec Titre et Bouton Créer */}
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

      {/* Zone de Filtres */}
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

                {/* Badges Statut et Priorité */}
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

                {/* Métadonnées (Dates, Assigné, Projet) */}
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

                {/* Boutons d'action rapide (Workflow) */}
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
