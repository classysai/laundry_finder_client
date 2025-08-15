// src/pages/Bookings.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  TextField,
  InputAdornment,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Badge,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const statusChip = (status) => {
  const map = {
    confirmed: { color: 'success', icon: <VerifiedIcon fontSize="small" /> },
    pending:   { color: 'warning', icon: <PendingIcon  fontSize="small" /> },
    cancelled: { color: 'error',   icon: <CancelIcon  fontSize="small" /> },
  };
  const key = (status || '').toLowerCase();
  const cfg = map[key] || { color: 'default', icon: <InfoOutlinedIcon fontSize="small" /> };
  return (
    <Chip
      size="small"
      color={cfg.color}
      icon={cfg.icon}
      label={(status || 'Unknown').toUpperCase()}
      sx={{ fontWeight: 600, letterSpacing: 0.4 }}
    />
  );
};

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

export default function Bookings() {
  const navigate = useNavigate();
  const { user } = useContext(BookingContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all'); // all | pending | confirmed | cancelled
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [detail, setDetail] = useState(null);

  const laundryIdParam = searchParams.get('laundryId');
  const laundryIdFilter = laundryIdParam ? parseInt(laundryIdParam, 10) : null;

  const authHeader = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};

  const load = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/bookings/owner`, authHeader);
      const list = Array.isArray(res.data) ? res.data : [];
      setBookings(list);
    } catch (e) {
      console.error('Load bookings failed:', e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  // Client-side filter: by laundryId (if any), status, and text search
  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return bookings.filter((b) => {
      if (laundryIdFilter && b.laundryId !== laundryIdFilter) return false;
      if (status !== 'all' && (b.status || '').toLowerCase() !== status) return false;

      if (!text) return true;
      const hay = [
        String(b.id),
        b.status,
        b.serviceType,
        b.notes,
        b?.Laundry?.name,
        b?.Laundry?.description,
        String(b?.Laundry?.lat),
        String(b?.Laundry?.lng),
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(text);
    });
  }, [bookings, q, status, laundryIdFilter]);

  const totalCount = bookings.length;
  const totalShown = filtered.length;

  const clearLaundryFilter = () => {
    searchParams.delete('laundryId');
    setSearchParams(searchParams, { replace: true });
  };

  // Actions
  const patchStatus = async (id, newStatus) => {
    try {
      await axios.patch(`${API}/api/bookings/${id}/status`, { status: newStatus }, authHeader);
      // Optimistic update
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    } catch (e) {
      console.error('Update status failed:', e);
      alert('Failed to update status.');
    }
  };

  const removeBooking = async () => {
    if (!confirmDelete) return;
    try {
      await axios.delete(`${API}/api/bookings/${confirmDelete}`, authHeader);
      setBookings((prev) => prev.filter((b) => b.id !== confirmDelete));
      setConfirmDelete(null);
    } catch (e) {
      console.error('Delete booking failed:', e);
      alert('Failed to delete.');
    }
  };

  const gradientHeader = (
    <Box sx={{
      mt: { xs: 8, sm: 10 },
      mb: 3,
      px: { xs: 2, sm: 4 },
      py: 3,
      borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(79,70,229,0.16) 0%, rgba(16,185,129,0.12) 100%)',
      border: '1px solid',
      borderColor: 'rgba(79,70,229,0.25)',
      backdropFilter: 'blur(8px)',
    }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
            Bookings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage bookings {laundryIdFilter ? `for Laundry #${laundryIdFilter}` : 'across your laundries'}.
          </Typography>
        </Box>
        <Badge
          color="primary"
          badgeContent={totalShown}
          max={999}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Chip icon={<EventIcon />} label={`Showing ${totalShown}/${totalCount}`} variant="outlined" />
        </Badge>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, pb: 6, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
      {gradientHeader}

      {/* Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by booking id, status, service, notes, laundry name…"
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ width: { xs: '100%', md: 220 } }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>

        {laundryIdFilter && (
          <Chip
            color="primary"
            variant="filled"
            label={`Filter: Laundry #${laundryIdFilter}`}
            onDelete={clearLaundryFilter}
            deleteIcon={<CloseIcon />}
          />
        )}
      </Stack>

      {/* List */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}><PlaceholderCard /></Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ mt: 6, borderRadius: 3, p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No bookings found</Typography>
          <Typography color="text.secondary">Try clearing filters or searching with a different term.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {filtered.map((b) => {
            const sched = b?.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : 'Not scheduled';
            const service = b?.serviceType || '—';
            const price = b?.price != null ? Number(b.price).toFixed(2) : '—';
            const lname = b?.Laundry?.name || `Laundry #${b.laundryId}`;

            return (
              <Grid key={b.id} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, boxShadow: 4 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      {statusChip(b.status)}
                      <Tooltip title={lname}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
                          {lname}
                        </Typography>
                      </Tooltip>
                    </Stack>

                    <Divider sx={{ my: 1.25 }} />

                    <Stack spacing={0.8}>
                      <Typography variant="body2" color="text.secondary">Booking ID: <b>{b.id}</b></Typography>
                      <Typography variant="body2" color="text.secondary">Scheduled: <b>{sched}</b></Typography>
                      <Typography variant="body2" color="text.secondary">Service: <b>{service}</b></Typography>
                      <Typography variant="body2" color="text.secondary">Price: <b>{price}</b></Typography>
                      {b.notes && <Typography variant="body2" color="text.secondary">Notes: <b>{b.notes}</b></Typography>}
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
                    {/* Status actions */}
                    <Button size="small" variant="outlined" onClick={() => patchStatus(b.id, 'pending')}>Mark Pending</Button>
                    <Button size="small" variant="contained" onClick={() => patchStatus(b.id, 'confirmed')}>Confirm</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => patchStatus(b.id, 'cancelled')}>Cancel</Button>

                    {/* More */}
                    <Button size="small" variant="text" onClick={() => setDetail(b)}>Details</Button>
                    <Button size="small" color="error" variant="text" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(b.id)}>Delete</Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Details dialog */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking #{detail?.id}</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Stack spacing={1.2}>
              <Typography variant="body2">Status: <b>{detail.status}</b></Typography>
              <Typography variant="body2">Laundry: <b>{detail?.Laundry?.name || `#${detail.laundryId}`}</b></Typography>
              <Typography variant="body2">Scheduled: <b>{detail?.scheduledAt ? new Date(detail.scheduledAt).toLocaleString() : 'Not scheduled'}</b></Typography>
              <Typography variant="body2">Service: <b>{detail?.serviceType || '—'}</b></Typography>
              <Typography variant="body2">Price: <b>{detail?.price != null ? Number(detail.price).toFixed(2) : '—'}</b></Typography>
              <Typography variant="body2">Notes: <b>{detail?.notes || '—'}</b></Typography>
              <Divider />
              <Typography variant="body2">User ID: <b>{detail.userId}</b></Typography>
              <Typography variant="body2">Created: <b>{new Date(detail.createdAt).toLocaleString()}</b></Typography>
              <Typography variant="body2">Updated: <b>{new Date(detail.updatedAt).toLocaleString()}</b></Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        <DialogTitle>Delete booking?</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete booking #{confirmDelete}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={removeBooking}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
