// src/pages/OwnerDashboard.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Divider,
  TextField,
  InputAdornment,
  Skeleton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { BookingContext } from '../context/BookingContext';
import ConfirmDialog from '../components/ConfirmDialog';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PlaceholderCard = () => (
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Stack spacing={1.5}>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="rectangular" height={18} />
        <Divider sx={{ my: 1.5 }} />
        <Skeleton variant="text" width="55%" />
        <Skeleton variant="text" width="50%" />
      </Stack>
    </CardContent>
    <CardActions sx={{ p: 2 }}>
      <Skeleton variant="rectangular" width={180} height={34} />
    </CardActions>
  </Card>
);

export default function OwnerDashboard() {
  const { user } = useContext(BookingContext);
  const navigate = useNavigate();

  // Laundries + counts
  const [laundries, setLaundries] = useState([]);
  const [bookingCounts, setBookingCounts] = useState({}); // { [laundryId]: count }
  const [loading, setLoading] = useState(true);

  // UI state
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);

  // Create/Edit dialog
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', description: '', lat: '', lng: '' });

  const authHeader = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  // -------- Navigation helpers (NEW) --------
  const goAllBookings = () => navigate('/bookings'); // all owner bookings
  const goLaundryBookings = (lid) => navigate(`/bookings?laundryId=${encodeURIComponent(lid)}`); // filter by laundry

  const loadData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const [mineRes, ownerBookingsRes] = await Promise.all([
        axios.get(`${API}/api/laundries/owner/mine`, authHeader),
        axios.get(`${API}/api/bookings/owner`, authHeader),
      ]);

      setLaundries(Array.isArray(mineRes.data) ? mineRes.data : []);

      const counts = {};
      const list = Array.isArray(ownerBookingsRes.data) ? ownerBookingsRes.data : [];
      for (const b of list) {
        const lid = b?.laundryId;
        if (!lid) continue;
        counts[lid] = (counts[lid] || 0) + 1;
      }
      setBookingCounts(counts);
    } catch (e) {
      console.error('Owner dashboard load error:', e);
      setLaundries([]);
      setBookingCounts({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return laundries;
    return laundries.filter((l) => {
      const hay = [l.name, l.description, String(l.lat), String(l.lng)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(text);
    });
  }, [laundries, q]);

  // Create / Edit flow
  const openCreate = () => {
    setForm({ id: null, name: '', description: '', lat: '', lng: '' });
    setOpenForm(true);
  };

  const openEdit = (l) => {
    setForm({
      id: l.id,
      name: l.name || '',
      description: l.description || '',
      lat: l.lat ?? '',
      lng: l.lng ?? '',
    });
    setOpenForm(true);
  };

  const saveForm = async () => {
    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || '',
        lat: form.lat === '' ? null : Number(form.lat),
        lng: form.lng === '' ? null : Number(form.lng),
      };

      if (!payload.name) {
        alert('Name is required');
        return;
      }

      if (form.id == null) {
        // create
        await axios.post(`${API}/api/laundries`, payload, authHeader);
      } else {
        // update
        await axios.put(`${API}/api/laundries/${form.id}`, payload, authHeader);
      }
      setOpenForm(false);
      await loadData();
    } catch (e) {
      console.error('Save laundry failed:', e);
      alert('Failed to save. Please check inputs or try again.');
    }
  };

  const doDelete = async () => {
    if (!toDelete) return;
    try {
      await axios.delete(`${API}/api/laundries/${toDelete}`, authHeader);
      setToDelete(null);
      await loadData();
    } catch (e) {
      console.error('Delete laundry failed:', e);
      alert('Failed to delete.');
    }
  };

  const totalBookings = Object.values(bookingCounts).reduce((a, b) => a + b, 0);

  const gradientHeader = (
    <Box
      sx={{
        mt: { xs: 8, sm: 10 },
        mb: 3,
        px: { xs: 2, sm: 4 },
        py: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(79,70,229,0.16) 0%, rgba(16,185,129,0.12) 100%)',
        border: '1px solid',
        borderColor: 'rgba(79,70,229,0.25)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            Owner Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your laundries. Each card shows its total bookings.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge
            color="primary"
            badgeContent={totalBookings}
            max={999}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          >
            <Chip
              icon={<EventIcon />}
              label="Total Bookings"
              variant="outlined"
              clickable
              onClick={goAllBookings}
              sx={{ cursor: 'pointer' }}
              onKeyDown={(e) => e.key === 'Enter' && goAllBookings()}
              role="button"
              tabIndex={0}
            />
          </Badge>
          <Button startIcon={<AddCircleOutlineIcon />} variant="contained" onClick={openCreate}>
            Add Laundry
          </Button>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, pb: 6, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
      {gradientHeader}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, description, lat/lng…"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Stack>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <PlaceholderCard />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            mt: 6,
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No laundries yet
          </Typography>
          <Typography color="text.secondary">Click “Add Laundry” to create your first one.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {filtered.map((l) => {
            const count = bookingCounts[l.id] || 0;
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={l.id} sx={{ display: 'flex' }}>
                <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, boxShadow: 4 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Tooltip title={l.name}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
                          {l.name || 'Untitled Laundry'}
                        </Typography>
                      </Tooltip>
                      <Chip
                        size="small"
                        color="primary"
                        label={`${count} booking${count === 1 ? '' : 's'}`}
                        clickable
                        onClick={() => goLaundryBookings(l.id)}
                        sx={{ cursor: 'pointer' }}
                        onKeyDown={(e) => e.key === 'Enter' && goLaundryBookings(l.id)}
                        role="button"
                        tabIndex={0}
                      />
                    </Stack>
                    {l.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {l.description}
                      </Typography>
                    )}
                    <Divider sx={{ my: 1.25 }} />
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">
                        Latitude: <b>{l.lat ?? '—'}</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Longitude: <b>{l.lng ?? '—'}</b>
                      </Typography>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, mt: 'auto', gap: 1, flexWrap: 'wrap' }}>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => openEdit(l)}>
                      Edit
                    </Button>
                    <Button variant="text" color="error" startIcon={<DeleteIcon />} onClick={() => setToDelete(l.id)}>
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create / Edit Laundry */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id == null ? 'Add Laundry' : `Edit Laundry #${form.id}`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Latitude"
                type="number"
                value={form.lat}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              />
              <TextField
                label="Longitude"
                type="number"
                value={form.lng}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveForm}>
            {form.id == null ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete laundry?"
        subtitle="This action cannot be undone."
        onClose={() => setToDelete(null)}
        onConfirm={doDelete}
        confirmText="Delete"
        color="error"
      />
    </Box>
  );
}
