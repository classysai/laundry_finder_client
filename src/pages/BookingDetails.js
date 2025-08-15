// src/pages/BookingDetails.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Stack, Chip, Paper, Divider, Avatar, Button, Grid, Skeleton, Breadcrumbs, Link as MLink
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import RoomIcon from '@mui/icons-material/Room';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import NotesIcon from '@mui/icons-material/Notes';
import PaymentsIcon from '@mui/icons-material/Payments';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { BookingContext } from '../context/BookingContext';
import { getBookingById, patchStatus, deleteBooking } from '../api/bookings';
import ConfirmDialog from '../components/ConfirmDialog';

const Field = ({ label, value, icon }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    {icon}
    <Stack>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body1">{value ?? '—'}</Typography>
    </Stack>
  </Stack>
);

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(BookingContext);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!user?.token) return;
      try {
        setLoading(true);
        const { data } = await getBookingById(id, user.token);
        if (!ignore) setBooking(data);
      } catch (err) {
        if (!ignore) setBooking(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [id, user]);

  const status = (booking?.status || 'Unknown').toUpperCase();
  const canOwnerAct = user?.role === 'owner';

  const doStatus = async (next) => {
    try {
      setBooking(b => ({ ...b, status: next }));
      await patchStatus(id, next, user.token);
    } catch (e) {
      // revert by refetching
      const { data } = await getBookingById(id, user.token);
      setBooking(data);
    }
  };

  const doDelete = async () => {
    try {
      await deleteBooking(id, user.token);
      // back to dashboard
      navigate('/dashboard');
    } catch (e) {
      setConfirmDelete(false);
    }
  };

  const skeleton = (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={2}>
        <Skeleton variant="text" width="50%" height={36} />
        <Skeleton variant="rectangular" height={22} />
        <Divider />
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} item xs={12} sm={6}>
              <Skeleton variant="rectangular" height={54} />
            </Grid>
          ))}
        </Grid>
        <Divider />
        <Skeleton variant="rectangular" height={38} width={160} />
      </Stack>
    </Paper>
  );

  return (
    <Box sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 4 }, pb: 6, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Breadcrumbs>
          <MLink component="button" onClick={() => navigate(-1)} underline="hover" color="inherit">
            Owner Dashboard
          </MLink>
          <Typography color="text.primary">Booking #{id}</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>Booking Details</Typography>
        <Typography variant="body2" color="text.secondary">Detailed view for review and record-keeping</Typography>
      </Stack>

      {loading ? (
        skeleton
      ) : !booking ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <InfoOutlinedIcon />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Booking not found</Typography>
            <Button startIcon={<ArrowBackIosNewIcon />} onClick={() => navigate('/owner')} variant="outlined">
              Back to Dashboard
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
            <Avatar alt={booking?.Laundry?.name || 'Laundry'} src={booking?.Laundry?.imageUrl || ''} sx={{ width: 80, height: 80, border: '3px solid #fff' }}>
              {(booking?.Laundry?.name || 'L').charAt(0)}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }} noWrap>{booking?.Laundry?.name || 'Unnamed Laundry'}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap title={booking?.Laundry?.address}>
                    {booking?.Laundry?.address || 'Address not specified'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={`STATUS: ${status}`} color="primary" variant="outlined" />
                  <Chip label={`ID: ${booking?.id ?? booking?._id ?? '—'}`} variant="outlined" />
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field label="Scheduled" value={booking?.scheduledAt ? new Date(booking.scheduledAt).toLocaleString() : 'Not scheduled'} icon={<EventIcon />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Service Type" value={booking?.serviceType || '—'} icon={<InfoOutlinedIcon />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="User ID" value={booking?.userId ?? '—'} icon={<InfoOutlinedIcon />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Laundry Phone" value={booking?.Laundry?.phone || '—'} icon={<PhoneIcon />} />
                </Grid>
                <Grid item xs={12}>
                  <Field label="Laundry Location" value={booking?.Laundry?.address || '—'} icon={<RoomIcon />} />
                </Grid>
                <Grid item xs={12}>
                  <Field label="Notes" value={booking?.notes || 'No notes provided'} icon={<NotesIcon />} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field label="Estimated Price" value={typeof booking?.price === 'number' ? `£${Number(booking.price).toFixed(2)}` : booking?.price || '—'} icon={<PaymentsIcon />} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button startIcon={<ArrowBackIosNewIcon />} onClick={() => (location.state?.from === 'owner' ? navigate(-1) : navigate('/owner'))} variant="outlined">
                  Back
                </Button>
                <Button startIcon={<EditIcon />} variant="outlined" onClick={() => navigate(`/bookings/${id}/edit`)}>Edit</Button>
                <Button startIcon={<DeleteIcon />} color="error" variant="text" onClick={() => setConfirmDelete(true)}>Delete</Button>
                {canOwnerAct && (
                  <>
                    <Button variant="contained" startIcon={<CheckIcon />} onClick={() => doStatus('confirmed')}>Accept</Button>
                    <Button variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => doStatus('cancelled')}>Reject</Button>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete booking?"
        subtitle="This will permanently remove the booking."
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        confirmText="Delete"
        color="error"
      />
    </Box>
  );
}
