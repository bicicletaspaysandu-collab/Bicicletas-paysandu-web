import express from 'express';
import {
  handleCalWebhook,
  getMyReservations,
  getAllReservations,
  cancelReservation,
  getOccupiedSlots,
  createDirectReservation,
  deleteReservation
} from '../controllers/reservations.js';
import { requireAuth, requireAdmin, requireClient } from '../middleware/auth.js';

const router = express.Router();

// Public webhook endpoint for Cal.com synchronization
router.post('/webhook', handleCalWebhook);

// Get occupied time slots for a date
router.get('/occupied-slots', getOccupiedSlots);

// Create a direct reservation (Native Funnel / Invisible Cal.com Funnel)
router.post('/', requireAuth, requireClient, createDirectReservation);

// Client reservations
router.get('/my-reservations', requireAuth, requireClient, getMyReservations);

// Admin-only route to list all reservations
router.get('/', requireAuth, requireAdmin, getAllReservations);

// Authenticated route to cancel or update a reservation
router.put('/:id/cancel', requireAuth, cancelReservation);

// Authenticated route to delete reservation permanently and cancel in Cal.com
router.delete('/:id', requireAuth, deleteReservation);

export default router;
