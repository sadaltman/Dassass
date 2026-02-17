const express = require('express');
const router = express.Router();
const {login,createOrganizer,deleteOrganizer,listOrganizers,toggleOrganizerStatus,getPasswordResets,approvePasswordReset,rejectPasswordReset} = require('../controllers/Admincontroller');
const {authenticateUser,requireRole} = require('../middleware/auth');

router.post('/login',login);
router.get('/organizers',authenticateUser,requireRole(['admin']),listOrganizers);
router.post('/organizers',authenticateUser,requireRole(['admin']),createOrganizer);
router.delete('/organizers/:id',authenticateUser,requireRole(['admin']),deleteOrganizer);
router.put('/organizers/:id/toggle',authenticateUser,requireRole(['admin']),toggleOrganizerStatus);

router.get('/password-resets',authenticateUser,requireRole(['admin']),getPasswordResets);
router.put('/password-resets/:id/approve',authenticateUser,requireRole(['admin']),approvePasswordReset);
router.put('/password-resets/:id/reject',authenticateUser,requireRole(['admin']),rejectPasswordReset);

module.exports = router;
