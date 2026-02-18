const express = require('express');
const router = express.Router();
const {login,getProfile,updateProfile,getAllOrganizers,getOrganizerById,getEventCsv,getAnalytics,requestPasswordReset} = require('../controllers/OrganiserController');
const {authenticateUser,requireRole} = require('../middleware/auth');

router.post('/login',login);
router.get('/',getAllOrganizers);
router.get('/profile',authenticateUser,requireRole(['organizer']),getProfile);
router.put('/profile',authenticateUser,requireRole(['organizer']),updateProfile);
router.get('/analytics',authenticateUser,requireRole(['organizer']),getAnalytics);
router.get('/events/:eventId/export',authenticateUser,requireRole(['organizer']),getEventCsv);
router.post('/request-password-reset',authenticateUser,requireRole(['organizer']),requestPasswordReset);
router.get('/:id',getOrganizerById);

module.exports = router;
