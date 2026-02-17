const express = require('express');
const router = express.Router();
const {postMessage,getMessages,deleteMessage,pinMessage} = require('../controllers/MessageController');
const {authenticateUser,requireRole} = require('../middleware/auth');

router.post('/events/:eventId/messages',authenticateUser,requireRole(['participant']),postMessage);
router.get('/events/:eventId/messages',authenticateUser,getMessages);
router.delete('/messages/:id',authenticateUser,requireRole(['organizer']),deleteMessage);
router.put('/messages/:id/pin',authenticateUser,requireRole(['organizer']),pinMessage);

module.exports = router;
