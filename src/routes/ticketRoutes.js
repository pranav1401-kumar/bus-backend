const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  getOpenTickets,
  getClosedTickets,
  getTicketByseat,
  getPassengerDetails,
  bookTicket,
  updateTicket,
  cancelTicket,
  resetAllTickets,
  getStats,
} = require('../controllers/ticketController');
const { bookTicketValidation, updateTicketValidation } = require('../middleware/validation');

// ─── Ticket Routes ─────────────────────────────────────────────────────────────
// GET  /api/tickets              → all tickets
router.get('/', getAllTickets);

// GET  /api/tickets/open         → all open tickets
router.get('/open', getOpenTickets);

// GET  /api/tickets/closed       → all booked tickets
router.get('/closed', getClosedTickets);

// GET  /api/tickets/:seatNumber          → status of a specific seat
router.get('/:seatNumber', getTicketByseat);

// GET  /api/tickets/:seatNumber/passenger → passenger details
router.get('/:seatNumber/passenger', getPassengerDetails);

// POST /api/tickets/:seatNumber/book     → book a seat
router.post('/:seatNumber/book', bookTicketValidation, bookTicket);

// PUT  /api/tickets/:seatNumber          → update ticket/passenger
router.put('/:seatNumber', updateTicketValidation, updateTicket);

// DELETE /api/tickets/:seatNumber        → cancel a booking
router.delete('/:seatNumber', cancelTicket);

module.exports = router;
