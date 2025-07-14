import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, role, onLogout }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Fixed AppBar */}
      <AppBar position="fixed" sx={{ backgroundColor: '#1976d2', boxShadow: 3 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Brand */}
            <Typography
              variant="h6"
              noWrap
              onClick={() => navigate('/')}
              sx={{
                fontWeight: 'bold',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              LaundrMate
            </Typography>

            {/* Right Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!isLoggedIn ? (
                <>
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outlined"
                    sx={{
                      borderRadius: 20,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    variant="contained"
                    sx={{
                      borderRadius: 20,
                      backgroundColor: 'white',
                      color: '#1976d2',
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      },
                    }}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      color: 'white',
                      textTransform: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {role === 'owner' ? 'Owner Dashboard' : 'My Dashboard'}
                  </Button>
                  <Button
                    onClick={onLogout}
                    color="inherit"
                    sx={{ textTransform: 'none' }}
                  >
                    Logout
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Spacer: pushes rest of the page below the fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;
