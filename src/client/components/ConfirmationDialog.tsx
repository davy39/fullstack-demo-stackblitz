/**
 * Boîte de dialogue de confirmation générique.
 *
 * Ce composant modal est utilisé pour demander une validation explicite à l'utilisateur
 * avant d'effectuer une action critique ou irréversible (comme une suppression).
 *
 * @module Components
 */

import React from 'react';

// Composants Material UI
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

/**
 * Définition des propriétés du dialogue.
 */
interface ConfirmationDialogProps {
  /** Contrôle la visibilité du dialogue (true = ouvert) */
  open: boolean;

  /** Fonction appelée lors de l'annulation (clic sur Annuler ou hors de la modale) */
  onClose: () => void;

  /** Fonction appelée lors de la validation de l'action */
  onConfirm: () => void;

  /** Titre affiché en haut du dialogue */
  title: string;

  /** Message explicatif détaillant l'action et ses conséquences */
  message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      {/* Titre de la modale */}
      <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>

      {/* Contenu principal (Message) */}
      <DialogContent>
        <DialogContentText id="confirmation-dialog-description">{message}</DialogContentText>
      </DialogContent>

      {/* Actions (Boutons) */}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>

        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
