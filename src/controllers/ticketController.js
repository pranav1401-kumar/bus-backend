const Ticket = require('../models/Ticket');
const { busEventEmitter, EVENTS } = require('../events/busEvents');
const { seedTickets } = require('../config/db');

// GET /api/tickets — all tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ seatNumber: 1 });
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tickets/open — all open tickets
const getOpenTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: 'open' }).sort({ seatNumber: 1 });
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tickets/closed — all closed (booked) tickets
const getClosedTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: 'closed' }).sort({ seatNumber: 1 });
    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tickets/:seatNumber — status of a specific ticket
const getTicketByseat = async (req, res) => {
  try {
    const { seatNumber } = req.params;
    const seat = parseInt(seatNumber, 10);

    if (isNaN(seat) || seat < 1 || seat > 40) {
      return res.status(400).json({ success: false, message: 'Seat number must be between 1 and 40' });
    }

    const ticket = await Ticket.findOne({ seatNumber: seat });
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket for seat ${seat} not found` });
    }

    res.json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/tickets/:seatNumber/passenger — passenger details for a booked seat
const getPassengerDetails = async (req, res) => {
  try {
    const { seatNumber } = req.params;
    const seat = parseInt(seatNumber, 10);

    if (isNaN(seat) || seat < 1 || seat > 40) {
      return res.status(400).json({ success: false, message: 'Seat number must be between 1 and 40' });
    }

    const ticket = await Ticket.findOne({ seatNumber: seat });
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Ticket for seat ${seat} not found` });
    }

    if (ticket.status === 'open') {
      return res.status(400).json({ success: false, message: `Seat ${seat} is open — no passenger booked` });
    }

    res.json({
      success: true,
      data: {
        seatNumber: ticket.seatNumber,
        deck: ticket.deck,
        firstName: ticket.firstName,
        lastName: ticket.lastName,
        fullName: ticket.fullName,
        email: ticket.email,
        bookedAt: ticket.bookedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/tickets/:seatNumber/book — book a ticket (close it)
const bookTicket = async (req, res) => {
  try {
    const { seatNumber } = req.params;
    const seat = parseInt(seatNumber, 10);

    if (isNaN(seat) || seat < 1 || seat > 40) {
      return res.status(400).json({ success: false, message: 'Seat number must be between 1 and 40' });
    }

    const { firstName, lastName, email } = req.body;

    const ticket = await Ticket.findOne({ seatNumber: seat });
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Seat ${seat} not found` });
    }

    if (ticket.status === 'closed') {
      return res.status(409).json({ success: false, message: `Seat ${seat} is already booked` });
    }

    ticket.status = 'closed';
    ticket.firstName = firstName;
    ticket.lastName = lastName;
    ticket.email = email;
    ticket.bookedAt = new Date();
    await ticket.save();

    // Fire events
    busEventEmitter.emit(EVENTS.TICKET_BOOKED, { seatNumber: seat, firstName, lastName, email });
    busEventEmitter.emit(EVENTS.SEAT_CLOSED, { seatNumber: seat });

    res.status(201).json({ success: true, message: `Seat ${seat} booked successfully`, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/tickets/:seatNumber — update ticket status or passenger info
const updateTicket = async (req, res) => {
  try {
    const { seatNumber } = req.params;
    const seat = parseInt(seatNumber, 10);

    if (isNaN(seat) || seat < 1 || seat > 40) {
      return res.status(400).json({ success: false, message: 'Seat number must be between 1 and 40' });
    }

    const ticket = await Ticket.findOne({ seatNumber: seat });
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Seat ${seat} not found` });
    }

    const { status, firstName, lastName, email } = req.body;

    // Handle status changes
    if (status === 'open') {
      ticket.status = 'open';
      ticket.firstName = null;
      ticket.lastName = null;
      ticket.email = null;
      ticket.bookedAt = null;
      busEventEmitter.emit(EVENTS.SEAT_OPENED, { seatNumber: seat });
    } else if (status === 'closed') {
      if (!firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'firstName, lastName, and email are required to close a ticket',
        });
      }
      ticket.status = 'closed';
      ticket.firstName = firstName;
      ticket.lastName = lastName;
      ticket.email = email;
      ticket.bookedAt = ticket.bookedAt || new Date();
      busEventEmitter.emit(EVENTS.SEAT_CLOSED, { seatNumber: seat });
    } else {
      // Only updating passenger details (no status change)
      if (firstName) ticket.firstName = firstName;
      if (lastName) ticket.lastName = lastName;
      if (email) ticket.email = email;
    }

    await ticket.save();
    busEventEmitter.emit(EVENTS.TICKET_UPDATED, { seatNumber: seat });

    res.json({ success: true, message: `Ticket ${seat} updated`, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/tickets/:seatNumber — cancel a booking (open the seat)
const cancelTicket = async (req, res) => {
  try {
    const { seatNumber } = req.params;
    const seat = parseInt(seatNumber, 10);

    if (isNaN(seat) || seat < 1 || seat > 40) {
      return res.status(400).json({ success: false, message: 'Seat number must be between 1 and 40' });
    }

    const ticket = await Ticket.findOne({ seatNumber: seat });
    if (!ticket) {
      return res.status(404).json({ success: false, message: `Seat ${seat} not found` });
    }

    if (ticket.status === 'open') {
      return res.status(400).json({ success: false, message: `Seat ${seat} is already open` });
    }

    ticket.status = 'open';
    ticket.firstName = null;
    ticket.lastName = null;
    ticket.email = null;
    ticket.bookedAt = null;
    await ticket.save();

    busEventEmitter.emit(EVENTS.TICKET_CANCELLED, { seatNumber: seat });
    busEventEmitter.emit(EVENTS.SEAT_OPENED, { seatNumber: seat });

    res.json({ success: true, message: `Seat ${seat} booking cancelled`, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/reset — admin: reset all tickets to open
const resetAllTickets = async (req, res) => {
  try {
    const { adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid admin secret' });
    }

    await Ticket.updateMany(
      {},
      {
        $set: {
          status: 'open',
          firstName: null,
          lastName: null,
          email: null,
          bookedAt: null,
        },
      }
    );

    busEventEmitter.emit(EVENTS.TICKETS_RESET);

    res.json({ success: true, message: 'All 40 tickets have been reset to open' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/stats — summary stats
const getStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'open' });
    const closed = await Ticket.countDocuments({ status: 'closed' });

    res.json({
      success: true,
      data: {
        total,
        open,
        closed,
        occupancyRate: `${((closed / total) * 100).toFixed(1)}%`,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
