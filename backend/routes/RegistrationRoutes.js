const express = require('express');
const router = express.Router();
const {registerForEvent,getMyRegistrations,getRegistrationById,cancelRegistration,getEventRegistrations,validateQR,markAttendance,getAttendanceStats,manualAttendance,getPendingPayments,approvePayment,rejectPayment,exportToCalendar} = require('../controllers/RegistrationController');
const {authenticateUser,requireRole} = require('../middleware/auth');

// IMPORTANT: Specific routes MUST come BEFORE parameterized routes!
// Otherwise /pending-payments would match /event/:eventId with eventId="pending-payments"

// Specific routes first
router.get('/pending-payments',authenticateUser,requireRole(['organizer']),getPendingPayments);
router.get('/my-registrations',authenticateUser,requireRole(['participant']),getMyRegistrations);
router.post('/validate-qr',authenticateUser,requireRole(['organizer']),validateQR);

// Parameterized routes after
router.post('/events/:eventId',authenticateUser,requireRole(['participant']),registerForEvent);
router.get('/event/:eventId',authenticateUser,requireRole(['organizer']),getEventRegistrations);
router.get('/event/:eventId/attendance',authenticateUser,requireRole(['organizer']),getAttendanceStats);

router.get('/:id',authenticateUser,requireRole(['participant']),getRegistrationById);
router.delete('/:id',authenticateUser,requireRole(['participant']),cancelRegistration);
router.post('/:id/attendance',authenticateUser,requireRole(['organizer']),markAttendance);
router.put('/:id/manual-attendance',authenticateUser,requireRole(['organizer']),manualAttendance);
router.put('/:id/approve-payment',authenticateUser,requireRole(['organizer']),approvePayment);
router.put('/:id/reject-payment',authenticateUser,requireRole(['organizer']),rejectPayment);
router.get('/:id/calendar',authenticateUser,requireRole(['participant']),exportToCalendar);

module.exports = router;
