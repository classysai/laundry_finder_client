import React, { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  return (
    <BookingContext.Provider value={{ user, setUser, bookings, setBookings }}>
      {children}
    </BookingContext.Provider>
  );
};
