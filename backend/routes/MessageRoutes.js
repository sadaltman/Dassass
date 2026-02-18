const express = require('express');
const router = express.Router();
const {postMessage,getMessages,deleteMessage,pinMessage,reactToMessage} = require('../controllers/MessageController');
const {authenticateUser,requireRole} = require('../middleware/auth');

router.post('/events/:eventId/messages',authenticateUser,postMessage);
router.get('/events/:eventId/messages',authenticateUser,getMessages);
router.delete('/messages/:id',authenticateUser,requireRole(['organizer']),deleteMessage);
router.put('/messages/:id/pin',authenticateUser,requireRole(['organizer']),pinMessage);
router.post('/messages/:id/react',authenticateUser,reactToMessage);

module.exports = router;
