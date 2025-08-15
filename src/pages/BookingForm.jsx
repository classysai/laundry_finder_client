import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Box, Paper, Stack, Typography, TextField, MenuItem, Button, Divider, Alert
} from '@mui/material';
import dayjs from 'dayjs';
import { BookingContext } from '../context/BookingContext';
import { createBooking, getBookingById, updateBooking } from '../api/bookings';

const SERVICE_OPTIONS = ['Wash & Fold', 'Dry Clean', 'Ironing', 'Pickup & Delivery'];

export default function BookingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [searchParams] = useSearchParams();
  const presetLaundryId = searchParams.get('laundryId') || '';
  const navigate = useNavigate();
  const { user } = useContext(BookingContext);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    laundryId: presetLaundryId, // prefill from query
    scheduledAt: '',
    serviceType: '',
    notes: '',
    price: '',
    status: 'pending',
  });

  const canChangeStatus = useMemo(() => user?.role === 'owner', [user]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      if (!isEdit || !user?.token) return;
      try {
        setFetching(true);
        const { data } = await getBookingById(id, user.token);
        if (ignore) return;
        setForm({
          laundryId: data?.laundryId ?? data?.Laundry?.id ?? '',
          scheduledAt: data?.scheduledAt ? dayjs(data.scheduledAt).format('YYYY-MM-DDTHH:mm') : '',
          serviceType: data?.serviceType || '',
          notes: data?.notes || '',
          price: data?.price ?? '',
          status: data?.status || 'pending',
        });
      } catch (e) {
        setError('Failed to load booking');
      } finally {
        if (!ignore) setFetching(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [id, isEdit, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        const payload = {
          scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
          serviceType: form.serviceType || null,
          notes: form.notes || null,
          price: form.price === '' ? null : Number(form.price),
          ...(canChangeStatus ? { status: form.status } : {}),
        };
        await updateBooking(id, payload, user.token);
      } else {
        if (!form.laundryId) throw new Error('Laundry is required');
        const payload = {
          laundryId: form.laundryId,
          scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
          serviceType: form.serviceType || null,
          notes: form.notes || null,
          price: form.price === '' ? null : Number(form.price),
        };
        await createBooking(payload, user.token);
      }
      navigate('/dashboard'); // keep your existing redirect after save
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  const showLaundryInput = !isEdit && !presetLaundryId;

  return (
    <Box sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 4 }, pb: 6, backgroundColor: '#f7f8fa', minHeight: '100vh' }}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {isEdit ? 'Edit Booking' : 'Create Booking'}
          </Typography>
          <Typography color="text.secondary">
            {isEdit ? 'Update the booking details below.' : 'Fill the form to create a new booking.'}
          </Typography>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {showLaundryInput ? (
              <TextField
                label="Laundry ID"
                name="laundryId"
                value={form.laundryId}
                onChange={handleChange}
                required
                helperText="Enter the Laundry ID to book"
              />
            ) : (
              !isEdit && (
                <TextField
                  label="Laundry ID"
                  value={presetLaundryId}
                  InputProps={{ readOnly: true }}
                  helperText="Selected from the laundry card"
                />
              )
            )}

            <TextField
              label="Scheduled At"
              name="scheduledAt"
              type="datetime-local"
              value={form.scheduledAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              helperText="Choose preferred date & time"
            />

            <TextField
              label="Service Type"
              name="serviceType"
              select
              value={form.serviceType}
              onChange={handleChange}
            >
              {SERVICE_OPTIONS.map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              multiline
              minRows={3}
            />

            <TextField
              label="Estimated Price (£)"
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              inputProps={{ step: '0.01' }}
            />

            {isEdit && canChangeStatus && (
              <TextField
                label="Status"
                name="status"
                select
                value={form.status}
                onChange={handleChange}
                helperText="Only owners can change status"
              >
                {['pending','confirmed','cancelled'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            )}

            <Divider />
            <Stack direction="row" spacing={1.5}>
              <Button type="submit" variant="contained" disabled={loading || fetching}>
                {isEdit ? 'Save Changes' : 'Create Booking'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>Cancel</Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
