import express from 'express';
import {
  handleCalWebhook,
  getMyReservations,
  getAllReservations,
  cancelReservation
} from '../controllers/reservations.js';
import { requireAuth, requireAdmin, requireClient } from '../middleware/auth.js';

const router = express.Router();

// Public webhook endpoint for Cal.com synchronization
router.post('/webhook', handleCalWebhook);

// Client reservations
router.get('/my-reservations', requireAuth, requireClient, getMyReservations);

// Admin-only route to list all reservations
router.get('/', requireAuth, requireAdmin, getAllReservations);

// Authenticated route to cancel a reservation (24h restriction applied inside)
router.put('/:id/cancel', requireAuth, cancelReservation);

export default router;
