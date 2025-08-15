import React, { useContext, useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip, Stack } from '@mui/material';
import { BookingContext } from '../context/BookingContext';
import { getMyBookings, deleteBooking } from '../api/bookings';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';

export default function MyBookings() {
  const { user } = useContext(BookingContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await getMyBookings(user.token);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.token) load(); }, [user]);

  const onDelete = async () => {
    try {
      await deleteBooking(toDelete, user.token);
      setBookings(prev => prev.filter(x => (x.id ?? x._id) !== toDelete));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <Box sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 4 }, pb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>My Bookings</Typography>
        <Button variant="contained" onClick={() => navigate('/bookings/new')}>Create Booking</Button>
      </Stack>

      {loading ? 'Loading…' : (
        <Grid container spacing={3}>
          {bookings.map(b => {
            const id = b?.id ?? b?._id;
            return (
              <Grid key={id} item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{b?.Laundry?.name || 'Laundry'}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={(b?.status || 'pending').toUpperCase()} />
                      {b?.serviceType && <Chip label={b.serviceType} variant="outlined" />}
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Scheduled: {b?.scheduledAt ? new Date(b.scheduledAt).toLocaleString() : '—'}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ gap: 1 }}>
                    <Button variant="outlined" onClick={() => navigate(`/bookings/${id}/edit`)}>Edit</Button>
                    <Button color="error" onClick={() => setToDelete(id)}>Delete</Button>
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
        onClose={() => setToDelete(null)}
        onConfirm={onDelete}
        confirmText="Delete"
        color="error"
      />
    </Box>
  );
}
