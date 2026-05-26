const EventEmitter = require('eventemitter3');

const busEventEmitter = new EventEmitter();

// Event constants
const EVENTS = {
  TICKET_BOOKED: 'ticket:booked',
  TICKET_CANCELLED: 'ticket:cancelled',
  TICKET_UPDATED: 'ticket:updated',
  TICKETS_RESET: 'tickets:reset',
  SEAT_OPENED: 'seat:opened',
  SEAT_CLOSED: 'seat:closed',
};

// Register event listeners with logging
busEventEmitter.on(EVENTS.TICKET_BOOKED, (data) => {
  console.log(`[EVENT] Ticket booked — Seat #${data.seatNumber} by ${data.firstName} ${data.lastName} (${data.email})`);
});

busEventEmitter.on(EVENTS.TICKET_CANCELLED, (data) => {
  console.log(`[EVENT] Ticket cancelled — Seat #${data.seatNumber}`);
});

busEventEmitter.on(EVENTS.TICKET_UPDATED, (data) => {
  console.log(`[EVENT] Ticket updated — Seat #${data.seatNumber}`);
});

busEventEmitter.on(EVENTS.TICKETS_RESET, () => {
  console.log(`[EVENT] All tickets have been reset by admin`);
});

busEventEmitter.on(EVENTS.SEAT_OPENED, (data) => {
  console.log(`[EVENT] Seat #${data.seatNumber} is now OPEN`);
});

busEventEmitter.on(EVENTS.SEAT_CLOSED, (data) => {
  console.log(`[EVENT] Seat #${data.seatNumber} is now CLOSED/BOOKED`);
});

module.exports = { busEventEmitter, EVENTS };
