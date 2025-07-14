import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { BookingContext } from '../context/BookingContext';

const UserDashboard = () => {
  const [laundries, setLaundries] = useState([]);
  const { user } = useContext(BookingContext);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/laundries')
      .then((res) => setLaundries(res.data))
      .catch((err) => console.error('Failed to fetch laundries:', err));
  }, []);

  const handleBook = async (laundryId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/bookings',
        { laundryId },
        { headers: { Authorization: user.token } }
      );
      alert('Booking requested!');
    } catch (err) {
      alert('Booking failed');
    }
  };

  return (
    <Box
      sx={{
        mt: { xs: 8, sm: 10 },     // space below fixed AppBar
        px: { xs: 2, sm: 4 },      // responsive side padding
        pb: 4,                     // bottom padding
        backgroundColor: '#f5f5f5',
        minHeight: '100vh'
      }}
    >
      <Typography variant="h4" gutterBottom>
        Available Laundries
      </Typography>

      <Grid container spacing={3} alignItems="stretch">
        {laundries.map((l) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={l.id}
            sx={{ display: 'flex' }}    // allow card to stretch full height
          >
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,            // make all cards equal height
                borderRadius: 2,
                boxShadow: 3
              }}
            >
              <CardMedia
                component="img"
                height="160"
                image={l.imageUrl || '/placeholder-laundry.jpg'}
                alt={l.name}
                sx={{ objectFit: 'cover' }} // uniform cropping
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {l.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {l.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleBook(l.id)}
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
