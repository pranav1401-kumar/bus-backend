# 🚌 Bus Ticketing Backend API

Node.js + Express + MongoDB REST API for managing bus seat bookings.

## Project Structure

```
bus-backend/
├── src/
│   ├── config/
│   │   └── db.js               # MongoDB connection & seed
│   ├── controllers/
│   │   └── ticketController.js # All business logic
│   ├── events/
│   │   └── busEvents.js        # Event-driven logic (EventEmitter3)
│   ├── middleware/
│   │   └── validation.js       # express-validator rules
│   ├── models/
│   │   └── Ticket.js           # Mongoose schema
│   ├── routes/
│   │   ├── ticketRoutes.js     # /api/tickets/*
│   │   └── adminRoutes.js      # /api/admin/*
│   └── server.js               # Express app entry point
├── .env.example
├── .gitignore
└── package.json
```

## Setup

```bash
npm install
cp .env.example .env        # edit MONGODB_URI and ADMIN_SECRET
npm run dev                 # with nodemon
npm start                   # production
```

## API Reference

### Ticket Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | All 40 tickets |
| GET | `/api/tickets/open` | Open/available tickets |
| GET | `/api/tickets/closed` | Booked tickets |
| GET | `/api/tickets/:seatNumber` | Single ticket status |
| GET | `/api/tickets/:seatNumber/passenger` | Passenger details |
| POST | `/api/tickets/:seatNumber/book` | Book a seat |
| PUT | `/api/tickets/:seatNumber` | Update ticket/passenger |
| DELETE | `/api/tickets/:seatNumber` | Cancel a booking |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Occupancy stats |
| POST | `/api/admin/reset` | Reset all tickets (requires adminSecret) |

### Book Ticket Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com"
}
```

### Reset Body
```json
{
  "adminSecret": "your_admin_secret"
}
```

## Events Fired

- `ticket:booked` — on successful booking
- `ticket:cancelled` — on cancellation/deletion
- `ticket:updated` — on passenger detail update
- `tickets:reset` — on admin reset
- `seat:opened` — any time a seat becomes open
- `seat:closed` — any time a seat becomes booked
