import React, { useEffect, useMemo, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import PlaceIcon from '@mui/icons-material/Place';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';

const SERVICE_OPTIONS = ['Wash & Fold', 'Dry Clean', 'Ironing', 'Pickup & Delivery'];

const UserDashboard = () => {
  const [laundries, setLaundries] = useState([]);
  const [q, setQ] = useState('');
  const [service, setService] = useState('all');
  const { user } = useContext(BookingContext);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/laundries')
      .then((res) => setLaundries(res.data || []))
      .catch((err) => console.error('Failed to fetch laundries:', err));
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return laundries.filter(l => {
      const matchesService =
        service === 'all' ||
        (Array.isArray(l.services)
          ? l.services.map(s => String(s).toLowerCase()).includes(service.toLowerCase())
          : String(l.serviceType || '').toLowerCase() === service.toLowerCase()); // fallback if API has single field

      if (!text) return matchesService;

      const hay = [
        l.name,
        l.description,
        l.address,
        Array.isArray(l.services) ? l.services.join(' ') : l.serviceType
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return matchesService && hay.includes(text);
    });
  }, [laundries, q, service]);

  const handleBookNow = (laundryId) => {
    // Redirect user straight to the booking form with prefilled laundryId
    navigate(`/bookings/new?laundryId=${encodeURIComponent(laundryId)}`);
  };

  return (
    <Box
      sx={{
        mt: { xs: 8, sm: 10 },
        px: { xs: 2, sm: 4 },
        pb: 6,
        backgroundColor: '#f5f7fb',
        minHeight: '100vh'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background:
            'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.12) 100%)',
          border: '1px solid rgba(99,102,241,0.25)'
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.4 }}>
              Find a Laundry
            </Typography>
            <Typography color="text.secondary">
              Search, filter, and book in a couple of clicks.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip icon={<LocalLaundryServiceIcon />} label={`${filtered.length} results`} />
          </Stack>
        </Stack>
      </Box>

      {/* Controls */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 3 }}
      >
        <TextField
          fullWidth
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, address, service…"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <ToggleButtonGroup
          value={service}
          exclusive
          onChange={(_, val) => val && setService(val)}
          color="primary"
          sx={{ flexWrap: 'wrap' }}
        >
          <ToggleButton value="all">All</ToggleButton>
          {SERVICE_OPTIONS.map(s => (
            <ToggleButton key={s} value={s}>
              {s}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Results */}
      <Grid container spacing={3} alignItems="stretch">
        {filtered.map((l) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={l.id}
            sx={{ display: 'flex' }}
          >
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                borderRadius: 3,
                boxShadow: 4,
                transition: 'transform .18s ease, box-shadow .18s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 }
              }}
            >
              <CardMedia
                component="img"
                height="160"
                image={l.imageUrl || '/placeholder-laundry.jpg'}
                alt={l.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
                    {l.name}
                  </Typography>
                  {Array.isArray(l.services) && l.services.length > 0 && (
                    <Chip
                      size="small"
                      label={l.services[0]}
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <PlaceIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary" noWrap title={l.address}>
                    {l.address || '—'}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {l.description || 'Quality cleaning services.'}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleBookNow(l.id)}
                >
                  Book Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default UserDashboard;
