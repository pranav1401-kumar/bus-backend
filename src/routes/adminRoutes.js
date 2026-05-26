const express = require('express');
const router = express.Router();
const { resetAllTickets, getStats } = require('../controllers/ticketController');

// POST /api/admin/reset  → reset all tickets to open
router.post('/reset', resetAllTickets);

// GET  /api/admin/stats  → booking stats
router.get('/stats', getStats);

module.exports = router;
