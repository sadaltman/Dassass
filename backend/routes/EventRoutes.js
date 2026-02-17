const express = require('express');
const router = express.Router();
const {createEvent,getAllEvents,getEventById,updateEvent,deleteEvent,getMyEvents,getTrendingEvents} = require('../controllers/EventController');
const {authenticateUser,requireRole} = require('../middleware/auth');
const optionalAuth = (req,res,next) =>{
    const authHeader = req.headers['authorization'];
    if(!authHeader) return next();
    
    const jwt = require('jsonwebtoken');
    const tokenParts = authHeader.split(' ');
    if(tokenParts[0] !== 'Bearer' || !tokenParts[1]) return next();
    
    try{
        const data = jwt.verify(tokenParts[1],process.env.JWT_SECRET);
        req.userInfo = data;
    }
    catch(err){}
    next();
};

router.post('/',authenticateUser,requireRole(['organizer']),createEvent);
router.get('/trending',getTrendingEvents);
router.get('/',optionalAuth,getAllEvents);
router.get('/my-events',authenticateUser,requireRole(['organizer']),getMyEvents);
router.get('/:id',getEventById);
router.put('/:id',authenticateUser,requireRole(['organizer']),updateEvent);
router.delete('/:id',authenticateUser,requireRole(['organizer']),deleteEvent);
module.exports = router;
