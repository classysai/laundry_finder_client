import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  Rating
} from '@mui/material';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import SendIcon from '@mui/icons-material/Send';
import Image from './7054960.jpg'; // your hero image

const reviews = [
  {
    name: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    feedback: 'Absolutely love the fast pickup and clean service!'
  },
  {
    name: 'Mark Smith',
    avatar: 'https://i.pravatar.cc/150?img=3',
    rating: 4,
    feedback: 'Good pricing and reliable delivery. Very convenient.'
  },
  {
    name: 'Priya Reddy',
    avatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    feedback: 'My favorite laundry service. Highly recommended!'
  }
];

const Home = () => {
  return (
    <>
      {/* HERO SECTION */}
      <Box
        sx={{
          backgroundColor: '#EA8C9C',
          display: 'flex',
          alignItems: 'center',
          px: { xs: 2, md: 10 },
          mt: '64px',
          py: { xs: 6, md: 10 }
        }}
      >
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Left */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'white',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
              gutterBottom
            >
              LaundrMate
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                maxWidth: 500,
                color: '#fff9f9',
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Book laundry services online — simple, fast, and reliable.
            </Typography>

            <Paper
              component="form"
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                borderRadius: 10,
                padding: '8px 16px',
                maxWidth: 450,
                mb: 3,
                backgroundColor: 'white',
                gap: 2
              }}
            >
              <TextField
                placeholder="Your email address"
                variant="standard"
                InputProps={{ disableUnderline: true }}
                sx={{ flex: 1 }}
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  borderRadius: 50,
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  whiteSpace: 'nowrap'
                }}
                endIcon={<SendIcon />}
              >
                Get Started
              </Button>
            </Paper>

            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                fontSize: '0.9rem',
                color: '#fff'
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <HeadsetMicIcon fontSize="small" />
                123-456-789
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <HeadsetMicIcon fontSize="small" />
                support@laundrmate.com
              </Box>
            </Box>
          </Grid>

          {/* Right */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              src={Image}
              alt="Laundry Illustration"
              sx={{
                width: '100%',
                maxWidth: 500,
                borderRadius: 3,
                boxShadow: 3,
                mx: 'auto'
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* REVIEWS */}
      <Box sx={{ px: { xs: 2, md: 10 }, py: 8, backgroundColor: '#fff' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 4, textAlign: 'center' }}>
          What Our Users Say
        </Typography>

        <Grid container spacing={4}>
          {reviews.map((review, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar src={review.avatar} />
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{review.name}</Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                </Box>
                <Typography color="text.secondary" fontSize="0.95rem">
                  “{review.feedback}”
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default Home;
