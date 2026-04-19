import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface Props {
  open: boolean;
  onClose: () => void;
  onGoToCompany: () => void;
}

export const CompanyIncompleteDialog = ({ open, onClose, onGoToCompany }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberRoundedIcon color="warning" />
        Completa los datos de tu empresa
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1">
          Para continuar usando la plataforma, debes completar los datos obligatorios de tu empresa.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Más tarde
        </Button>
        <Button onClick={onGoToCompany} variant="contained">
          Completar ahora
        </Button>
      </DialogActions>
    </Dialog>
  );
};