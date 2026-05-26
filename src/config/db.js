const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

const TOTAL_SEATS = 40;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bus_ticketing');
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    await seedTickets();
  } catch (err) {
    console.error(`[DB] Connection error: ${err.message}`);
    process.exit(1);
  }
};

// Seed 40 tickets if they don't exist yet
const seedTickets = async () => {
  const count = await Ticket.countDocuments();
  if (count === TOTAL_SEATS) {
    console.log(`[DB] ${TOTAL_SEATS} tickets already exist — skipping seed`);
    return;
  }

  console.log(`[DB] Seeding ${TOTAL_SEATS} tickets...`);
  await Ticket.deleteMany({});

  const tickets = [];
  for (let i = 1; i <= TOTAL_SEATS; i++) {
    tickets.push({
      seatNumber: i,
      status: 'open',
      deck: i <= 20 ? 'lower' : 'upper',
    });
  }

  await Ticket.insertMany(tickets);
  console.log(`[DB] Seeded ${TOTAL_SEATS} tickets successfully`);
};

module.exports = { connectDB, seedTickets };
