// src/pages/OwnerDashboard.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Stack, Avatar,
  Divider, TextField, InputAdornment, ToggleButtonGroup, ToggleButton, Skeleton, Tooltip, Badge
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EventIcon from '@mui/icons-material/Event';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { BookingContext } from '../context/BookingContext';
import { getOwnerBookings, patchStatus, deleteBooking } from '../api/bookings';
import ConfirmDialog from '../components/ConfirmDialog';

const statusChip = (status) => {
  const map = {
    confirmed: { color: 'success', icon: <VerifiedIcon fontSize="small" /> },
    pending: { color: 'warning', icon: <PendingIcon fontSize="small" /> },
    cancelled: { color: 'error', icon: <CancelIcon fontSize="small" /> },
  };
  const key = (status || '').toLowerCase();
  const cfg = map[key] || { color: 'default', icon: <InfoOutlinedIcon fontSize="small" /> };
  return <Chip size="small" color={cfg.color} icon={cfg.icon} label={(status || 'Unknown').toUpperCase()} sx={{ fontWeight: 600, letterSpacing: 0.5 }} />;
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

export default function OwnerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const { user } = useContext(BookingContext);
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const { data } = await getOwnerBookings(user.token);
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch owner bookings:', e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [user]);

  const filtered = useMemo(() => {
    const qlc = q.trim().toLowerCase();
    return bookings.filter(b => {
      const matchesStatus = filterStatus === 'all' || (b.status || '').toLowerCase() === filterStatus;
      if (!qlc) return matchesStatus;
      const hay = [b?.Laundry?.name, b?.Laundry?.address, b?.userId, b?.id, b?.status, b?.serviceType]
        .filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && hay.includes(qlc);
    });
  }, [bookings, q, filterStatus]);

  const onStatus = async (id, next) => {
    try {
      // optimistic
      setBookings(prev => prev.map(x => ((x.id ?? x._id) === id ? { ...x, status: next } : x)));
      await patchStatus(id, next, user.token);
    } catch {
      // fallback: refetch
      fetchData();
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteBooking(toDelete, user.token);
      setBookings(prev => prev.filter(x => (x.id ?? x._id) !== toDelete));
    } catch {
      fetchData();
    } finally {
      setToDelete(null);
    }
  };

  const gradientHeader = (
    <Box sx={{
      mt: { xs: 8, sm: 10 }, mb: 3, px: { xs: 2, sm: 4 }, py: 3, borderRadius: 3,
      background: 'linear-gradient(135deg, rgba(79,70,229,0.16) 0%, rgba(16,185,129,0.12) 100%)',
      border: '1px solid', borderColor: 'rgba(79,70,229,0.25)', backdropFilter: 'blur(8px)',
    }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>Owner Dashboard</Typography>
          <Typography variant="subtitle1" color="text.secondary">Manage and review your incoming bookings</Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Badge color="primary" badgeContent={bookings?.length || 0} max={999} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
            <Chip icon={<EventIcon />} label="Total Bookings" variant="outlined" />
          </Badge>
          <Button variant="contained" onClick={() => navigate('/bookings/new')}>Create Booking</Button>
        </Stack>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 2, sm: 4 }, pb: 6, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
      {gradientHeader}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }} alignItems={{ xs: 'stretch', md: 'center' }}>
        <TextField
          fullWidth value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search by laundry, address, status, user, service…"
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
        <ToggleButtonGroup value={filterStatus} exclusive onChange={(_, val) => val && setFilterStatus(val)} color="primary">
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="confirmed">Confirmed</ToggleButton>
          <ToggleButton value="cancelled">Cancelled</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}><PlaceholderCard /></Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box sx={{ mt: 6, borderRadius: 3, p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>No bookings found</Typography>
          <Typography color="text.secondary">Try adjusting your search or status filters.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {filtered.map((b) => {
            const id = b?.id ?? b?._id;
            const laundryName = b?.Laundry?.name || 'Unnamed Laundry';
            const address = b?.Laundry?.address || 'Address not specified';
            const service = b?.serviceType || 'Service';
            const scheduledAt = b?.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : 'Not scheduled';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={id} sx={{ display: 'flex' }}>
                <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, boxShadow: 4, transition: 'transform .18s ease, box-shadow .18s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                      <Avatar alt={laundryName} src={b?.Laundry?.imageUrl || ''} sx={{ width: 44, height: 44, border: '2px solid #fff' }}>
                        {laundryName?.charAt(0) || 'L'}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Tooltip title={laundryName}>
                          <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: -0.2 }}>{laundryName}</Typography>
                        </Tooltip>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }} title={address}>
                          {address}
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      {statusChip(b?.status)}
                      <Chip size="small" variant="outlined" label={service} sx={{ fontWeight: 600 }} />
                    </Stack>

                    <Divider sx={{ my: 1.5 }} />
                    <Stack spacing={0.5}>
                      <Typography variant="body2" color="text.secondary">Booking ID: <b>{id ?? '—'}</b></Typography>
                      <Typography variant="body2" color="text.secondary">User ID: <b>{b?.userId ?? '—'}</b></Typography>
                      <Typography variant="body2" color="text.secondary">Scheduled: <b>{scheduledAt}</b></Typography>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ px: 2, pb: 2, mt: 'auto', gap: 1 }}>
                    <Button variant="contained" startIcon={<CheckIcon />} onClick={() => onStatus(id, 'confirmed')}>Accept</Button>
                    <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => onStatus(id, 'cancelled')}>Reject</Button>
                    <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/bookings/${id}/edit`)}>Edit</Button>
                    <Button variant="text" color="error" startIcon={<DeleteIcon />} onClick={() => setToDelete(id)}>Delete</Button>
                    <Button variant="text" onClick={() => navigate(`/owner/booking/${id}`, { state: { from: 'owner' } })}>View</Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete booking?"
        subtitle="This action cannot be undone."
        onClose={() => setToDelete(null)}
        onConfirm={onDelete}
        confirmText="Delete"
        color="error"
      />
    </Box>
  );
}
