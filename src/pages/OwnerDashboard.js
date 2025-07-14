import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import { BookingContext } from '../context/BookingContext';

const OwnerDashboard = () => {
  const [ownerBookings, setOwnerBookings] = useState([]);
  const { user } = useContext(BookingContext);

  useEffect(() => {
    if (user?.token) {
      axios
        .get('http://localhost:5000/api/bookings/owner', {
          headers: { Authorization: user.token }
        })
        .then(res => setOwnerBookings(res.data))
        .catch(err => console.error('Failed to fetch owner bookings:', err));
    }
  }, [user]);

  return (
    <Box
      sx={{
        mt: { xs: 8, sm: 10 },     // push below fixed AppBar
        px: { xs: 2, sm: 4 },
        pb: 4,
        backgroundColor: '#f9f9f9',
        minHeight: '100vh'
      }}
    >
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Incoming Bookings
      </Typography>

      {ownerBookings.length === 0 ? (
        <Typography>No bookings at the moment.</Typography>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {ownerBookings.map((b, idx) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={idx}
              sx={{ display: 'flex' }}    // allow card to stretch
            >
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,            // equal-height cards
                  borderRadius: 2,
                  boxShadow: 3
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {b.Laundry?.name || 'Unnamed Laundry'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    User ID: {b.userId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {b.status}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, mt: 'auto' }}>
                  {/* You could add Accept/Reject buttons here */}
                  <Button size="small">View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default OwnerDashboard;
