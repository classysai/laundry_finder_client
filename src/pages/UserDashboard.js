// src/pages/UserDashboard.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button,
  Stack, TextField, InputAdornment, Chip, Divider, Tabs, Tab, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const statusChip = (status) => {
  const map = {
    confirmed: { color: 'success', icon: <VerifiedIcon fontSize="small" /> },
    pending:    { color: 'warning', icon: <PendingIcon  fontSize="small" /> },
    cancelled:  { color: 'error',   icon: <CancelIcon  fontSize="small" /> },
  };
  const key = (status || '').toLowerCase();
  const cfg = map[key] || { color: 'default', icon: <InfoOutlinedIcon fontSize="small" /> };
  return <Chip size="small" color={cfg.color} icon={cfg.icon} label={(status || 'Unknown').toUpperCase()} sx={{ fontWeight: 600, letterSpacing: 0.4 }} />;
};

// Build a Google Maps search URL using address if present, else lat,lng
const mapUrl = (l) => {
  const q = l?.address
    ? encodeURIComponent(l.address)
    : (l?.lat != null && l?.lng != null ? `${l.lat},${l.lng}` : null);
  return q ? `https://www.google.com/maps/search/?api=1&query=${q}` : null;
};

const UserDashboard = () => {
  const [tab, setTab] = useState(0); // 0 = Browse, 1 = My Bookings
  const [laundries, setLaundries] = useState([]);
  const [q, setQ] = useState('');

  const [myBookings, setMyBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { user } = useContext(BookingContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/laundries`)
      .then((res) => setLaundries(res.data || []))
      .catch((err) => console.error('Failed to fetch laundries:', err));
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return laundries;
    return laundries.filter(l => {
      const hay = [l.name, l.description, l.address, String(l.lat), String(l.lng)]
        .filter(Boolean).join(' ').toLowerCase();
      return hay.includes(text);
    });
  }, [laundries, q]);

  const handleBookNow = (laundryId) => navigate(`/bookings/new?laundryId=${encodeURIComponent(laundryId)}`);

  // ----- My Bookings (CRUD) -----
  const authHeader = (tk) => ({ headers: { Authorization: `Bearer ${tk}` } });

  const loadMyBookings = async () => {
    if (!user?.token) return;
    setLoadingBookings(true);
    try {
      const res = await axios.get(`${API}/api/bookings/me`, authHeader(user.token));
      setMyBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch my bookings:', err);
      setMyBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (tab === 1) loadMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  const openEdit = (b) => {
    setEditData({
      id: b.id ?? b._id,
      laundryName: b?.Laundry?.name || 'Laundry',
      serviceType: b?.serviceType || '',
      scheduledAt: b?.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0, 16) : '',
      notes: b?.notes || '',
      price: b?.price || ''
    });
  };

  const saveEdit = async () => {
    if (!editData || !user?.token) return;
    try {
      const payload = {
        scheduledAt: editData.scheduledAt ? new Date(editData.scheduledAt).toISOString() : null,
        serviceType: editData.serviceType || null,
        notes: editData.notes || null,
        price: editData.price === '' ? null : Number(editData.price)
      };
      await axios.put(`${API}/api/bookings/${editData.id}`, payload, authHeader(user.token));
      setMyBookings(prev => prev.map(b => (b.id ?? b._id) === editData.id ? { ...b, ...payload, scheduledAt: payload.scheduledAt } : b));
      setEditData(null);
    } catch (err) {
      console.error('Update booking failed:', err);
      alert('Update failed. Your server must allow editing these fields.');
    }
  };

  const deleteBooking = async (id) => {
    if (!user?.token) return;
    try {
      await axios.delete(`${API}/api/bookings/${id}`, authHeader(user.token));
      setMyBookings(prev => prev.filter(b => (b.id ?? b._id) !== id));
      setDeleteId(null);
    } catch (err) {
      console.error('Delete booking failed:', err);
      alert('Delete failed.');
    }
  };

  return (
    <Box sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 4 }, pb: 6, backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 2, p: 3, borderRadius: 3, background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.12) 100%)', border: '1px solid rgba(99,102,241,0.25)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>Laundry Portal</Typography>
            <Typography color="text.secondary">Browse laundries and manage your bookings.</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Browse Laundries" />
        <Tab label="My Bookings" />
      </Tabs>

      {tab === 0 && (
        <>
          {/* Search only (filters removed) */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, description, address or coordinates…"
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
            />
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Results */}
          <Grid container spacing={3} alignItems="stretch">
            {filtered.map((l) => {
              const maps = mapUrl(l);
              const showAddress = !!l.address;
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={l.id} sx={{ display: 'flex' }}>
                  <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, boxShadow: 4, transition: 'transform .18s ease, box-shadow .18s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 } }}>
                    <CardMedia component="img" height="160" image={l.imageUrl || '/placeholder-laundry.jpg'} alt={l.name} sx={{ objectFit: 'cover' }} />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>{l.name}</Typography>

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <PlaceIcon fontSize="small" />
                        {showAddress ? (
                          <Typography variant="body2" color="text.secondary" noWrap title={l.address}>
                            {l.address}
                          </Typography>
                        ) : maps ? (
                          <Chip
                            size="small"
                            clickable
                            icon={<PlaceIcon />}
                            label="View on Map"
                            component="a"
                            href={maps}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">Location not available</Typography>
                        )}
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {l.description || 'Quality cleaning services.'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button fullWidth variant="contained" onClick={() => handleBookNow(l.id)}>Book Now</Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {tab === 1 && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>My Bookings</Typography>
            <Button variant="outlined" onClick={loadMyBookings}>Refresh</Button>
          </Stack>

          {loadingBookings ? (
            <Typography>Loading your bookings…</Typography>
          ) : myBookings.length === 0 ? (
            <Typography color="text.secondary">No bookings yet. Go to “Browse” and book a laundry.</Typography>
          ) : (
            <Grid container spacing={3} alignItems="stretch">
              {myBookings.map((b) => {
                const id = b?.id ?? b?._id;
                const name = b?.Laundry?.name || 'Laundry';
                const scheduled = b?.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : 'Not scheduled';
                return (
                  <Grid key={id} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                    <Card sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, borderRadius: 3, boxShadow: 4 }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                          <Avatar>{name.charAt(0)}</Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>{name}</Typography>
                            <Typography variant="body2" color="text.secondary">Booking #{id}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          {statusChip(b.status)}
                          {b.serviceType && <Chip size="small" variant="outlined" label={b.serviceType} />}
                        </Stack>
                        <Divider sx={{ my: 1.25 }} />
                        <Typography variant="body2" color="text.secondary">Scheduled: <b>{scheduled}</b></Typography>
                      </CardContent>
                      <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: 'wrap' }}>
                        <Button startIcon={<EditIcon />} variant="outlined" onClick={() => openEdit(b)}>Edit</Button>
                        <Button startIcon={<DeleteIcon />} color="error" variant="text" onClick={() => setDeleteId(id)}>Delete</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      )}

      {/* Edit Booking Dialog */}
      <Dialog open={!!editData} onClose={() => setEditData(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Booking {editData ? `#${editData.id}` : ''}</DialogTitle>
        <DialogContent dividers>
          {editData && (
            <Stack spacing={2}>
              <TextField label="Laundry" value={editData.laundryName} InputProps={{ readOnly: true }} />
              <TextField select label="Service Type" value={editData.serviceType} onChange={(e) => setEditData(d => ({ ...d, serviceType: e.target.value }))}>
                {['Wash & Fold', 'Dry Clean', 'Ironing', 'Pickup & Delivery'].map(s => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
              </TextField>
              <TextField label="Scheduled At" type="datetime-local" value={editData.scheduledAt} onChange={(e) => setEditData(d => ({ ...d, scheduledAt: e.target.value }))} InputLabelProps={{ shrink: true }} />
              <TextField label="Notes" multiline minRows={2} value={editData.notes} onChange={(e) => setEditData(d => ({ ...d, notes: e.target.value }))} />
              <TextField label="Price (optional)" type="number" inputProps={{ step: '0.01' }} value={editData.price} onChange={(e) => setEditData(d => ({ ...d, price: e.target.value }))} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditData(null)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete booking?</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete booking #{deleteId}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteBooking(deleteId)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserDashboard;
