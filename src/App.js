import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingContext } from './context/BookingContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Navbar from './components/Navbar';

function App() {
  const { user, setUser } = useContext(BookingContext);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('laundrUser');
  };

  return (
    <Router>
      <Navbar isLoggedIn={!!user} role={user?.role} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            user ? (
              user.role === 'owner' ? <OwnerDashboard /> : <UserDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
