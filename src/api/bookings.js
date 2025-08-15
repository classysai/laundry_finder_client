import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const authHeader = (token) => ({ headers: { Authorization: token } });
// If your backend expects Bearer tokens, switch to:
// const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createBooking = (payload, token) =>
  axios.post(`${API_BASE}/api/bookings`, payload, authHeader(token));

export const getOwnerBookings = (token) =>
  axios.get(`${API_BASE}/api/bookings/owner`, authHeader(token));

export const getMyBookings = (token) =>
  axios.get(`${API_BASE}/api/bookings/me`, authHeader(token));

export const getBookingById = (id, token) =>
  axios.get(`${API_BASE}/api/bookings/${id}`, authHeader(token));

export const updateBooking = (id, payload, token) =>
  axios.put(`${API_BASE}/api/bookings/${id}`, payload, authHeader(token));

export const patchStatus = (id, status, token) =>
  axios.patch(`${API_BASE}/api/bookings/${id}/status`, { status }, authHeader(token));

export const deleteBooking = (id, token) =>
  axios.delete(`${API_BASE}/api/bookings/${id}`, authHeader(token));
