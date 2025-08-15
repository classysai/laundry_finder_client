import * as React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

export default function ConfirmDialog({ open, title="Are you sure?", subtitle, onClose, onConfirm, confirmText="Confirm", color="error" }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      {subtitle && (
        <DialogContent>
          <Typography color="text.secondary">{subtitle}</Typography>
        </DialogContent>
      )}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={color}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}
