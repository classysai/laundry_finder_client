import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingContext } from './context/BookingContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Navbar from './components/Navbar';
// import OwnerDashboard from './pages/OwnerDashboard';
import BookingDetails from './pages/BookingDetails';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import Bookings from './pages/Bookings';

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
        {/* <Route path="/owner" element={<OwnerDashboard />} /> */}
        <Route path="/owner/booking/:id" element={<BookingDetails />} />
        <Route path="/bookings" element={<Bookings />} />
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
        <Route path="/bookings/new" element={user ? <BookingForm /> : <Navigate to="/login" />} />
<Route path="/bookings/:id/edit" element={user ? <BookingForm /> : <Navigate to="/login" />} />
<Route path="/my-bookings" element={user ? <MyBookings /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
