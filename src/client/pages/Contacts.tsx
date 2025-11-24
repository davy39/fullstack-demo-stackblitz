/**
 * Page de gestion des Contacts.
 *
 * Cette page illustre l'utilisation des types partagés (Shared Types)
 * pour garantir que le Frontend consomme exactement ce que le Backend produit.
 *
 * @module ContactsPage
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Composants UI (Material Design)
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
} from '@mui/material';

// Icônes
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContactPage,
  Group,
} from '@mui/icons-material';

// Composants internes
import CallToAction from '../components/CallToAction';
import ConfirmationDialog from '../components/ConfirmationDialog';
import AppLoading from '../components/AppLoading';

// --- IMPORT DES TYPES PARTAGÉS ---
// On utilise 'import type' pour que Vite n'inclue pas de code JS inutile
import type { Contact, ApiResponse } from '../../shared/index';

const Contacts: React.FC = () => {
  // Le state est typé avec l'interface Prisma générée !
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Gestion de la modale de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);

  // État de chargement
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Chargement des données depuis l'API.
   */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);

        // TYPAGE FORT AXIOS :
        // On indique explicitement que l'API renvoie une ApiResponse contenant un tableau de Contact.
        const response = await axios.get<ApiResponse<Contact[]>>('/api/v1/contact/list');

        // TypeScript valide ici que 'response.data.data' est bien un Contact[]
        if (response.data.success && response.data.data) {
          setContacts(response.data.data);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des contacts:', err);
        toast.error('Impossible de récupérer la liste des contacts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  /**
   * Ouvre la modale de confirmation.
   */
  const handleDeleteClick = (id: number) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  /**
   * Exécute la suppression.
   */
  const confirmDeleteContact = async () => {
    if (contactToDelete === null) return;

    try {
      await axios.delete<ApiResponse>(`/api/v1/contact/${contactToDelete}`);

      // Mise à jour locale de la liste (Optimistic UI ou post-validation)
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== contactToDelete)
      );

      setDeleteDialogOpen(false);
      toast.success('Contact supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toast.error('Une erreur est survenue lors de la suppression');
    }
  };

  return (
    <Container maxWidth="xl" component="main" sx={{ py: 4 }}>
      {/* 1. État de Chargement */}
      {isLoading ? (
        <AppLoading />
      ) : contacts.length === 0 ? (
        /* 2. État Vide (Empty State) */
        <Card elevation={2} sx={{ borderRadius: 2, py: 8 }}>
          <CallToAction
            heroIcon={Group}
            title="Bienvenue !"
            subtitle="Votre carnet d'adresses est vide. Ajoutez votre premier contact pour commencer."
            url="/new-contact"
            buttonName="Ajouter un contact"
          />
        </Card>
      ) : (
        /* 3. Liste des Données */
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box display="flex" alignItems="center">
              <ContactPage sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
              <Typography variant="h4" component="h1" fontWeight="medium">
                Mes Contacts
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              component={Link}
              to="/new-contact"
              startIcon={<AddCircleOutlineIcon />}
              sx={{ borderRadius: 2, px: 3, py: 1 }}
            >
              Nouveau Contact
            </Button>
          </Box>

          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table aria-label="Tableau des contacts">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }} width={80}>
                    ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center" width={120}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell>{contact.id}</TableCell>
                    <TableCell>{contact.firstName}</TableCell>
                    <TableCell>{contact.lastName}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" justifyContent="center" gap={1}>
                        <IconButton
                          component={Link}
                          to={`/contact/${contact.id}`}
                          color="primary"
                          size="small"
                          title="Voir les détails"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(contact.id)}
                          color="error"
                          size="small"
                          title="Supprimer le contact"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Modale de Confirmation */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteContact}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible."
      />
    </Container>
  );
};

export default Contacts;
