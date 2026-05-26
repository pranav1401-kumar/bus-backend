const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 40,
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open',
    },
    // Deck: lower (1-20), upper (21-40)
    deck: {
      type: String,
      enum: ['lower', 'upper'],
      required: true,
    },
    // Passenger details (present only when status is 'closed')
    firstName: {
      type: String,
      default: null,
      trim: true,
    },
    lastName: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    bookedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: full name
ticketSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return null;
});

// Index for fast queries
ticketSchema.index({ status: 1 });
ticketSchema.index({ deck: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
