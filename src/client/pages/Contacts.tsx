/**
 * Page de liste des Contacts.
 *
 * Affiche un tableau de tous les contacts enregistrés avec des options pour
 * voir les détails ou supprimer un enregistrement.
 *
 * @module ContactsPage
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

// Composants UI
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

// Types partagés
import type { Contact, ApiResponse } from '../../shared/index';

const Contacts: React.FC = () => {
  // Le tableau de contacts est strictement typé.
  // Impossible d'ajouter un objet qui ne respecte pas l'interface 'Contact'.
  const [contacts, setContacts] = useState<Contact[]>([]);

  // États pour la gestion de la modale de suppression et du chargement
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [contactToDelete, setContactToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Charge les contacts depuis le backend.
   */
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setIsLoading(true);

        // La requête attend une réponse standardisée contenant un tableau de contacts.
        const response = await axios.get<ApiResponse<Contact[]>>('/api/v1/contact/list');

        if (response.data.success && response.data.data) {
          setContacts(response.data.data);
        }
      } catch (err) {
        console.error('Erreur chargement contacts:', err);
        toast.error('Impossible de récupérer la liste des contacts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, []);

  /**
   * Prépare la suppression en ouvrant la boîte de dialogue.
   */
  const handleDeleteClick = (id: number) => {
    setContactToDelete(id);
    setDeleteDialogOpen(true);
  };

  /**
   * Exécute la suppression après confirmation de l'utilisateur.
   */
  const confirmDeleteContact = async () => {
    if (contactToDelete === null) return;

    try {
      // Appel DELETE. Le backend renverra null dans 'data' en cas de succès.
      await axios.delete<ApiResponse>(`/api/v1/contact/${contactToDelete}`);

      // Mise à jour de l'interface (Optimistic UI ou re-fetch)
      // Ici, on filtre localement pour éviter un nouvel appel réseau.
      setContacts((prevContacts) =>
        prevContacts.filter((contact) => contact.id !== contactToDelete)
      );

      setDeleteDialogOpen(false);
      toast.success('Contact supprimé avec succès');
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Une erreur est survenue lors de la suppression');
    }
  };

  return (
    <Container maxWidth="xl" component="main" sx={{ py: 4 }}>
      {isLoading ? (
        <AppLoading />
      ) : contacts.length === 0 ? (
        /* Affichage d'un état vide ("Empty State") si aucun contact n'existe */
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
        /* Affichage du tableau de données */
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
                        {/* Lien vers la page de détail */}
                        <IconButton
                          component={Link}
                          to={`/contact/${contact.id}`}
                          color="primary"
                          size="small"
                          title="Voir les détails"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {/* Bouton de suppression */}
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

      {/* Modale de confirmation pour éviter les suppressions accidentelles */}
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
