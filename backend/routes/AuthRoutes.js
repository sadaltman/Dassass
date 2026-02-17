const express = require('express');
const router = express.Router();
const {register,login,getProfile,updateProfile,changePassword,followOrganizer,unfollowOrganizer} = require('../controllers/AuthController');
const {authenticateUser,requireRole} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile',authenticateUser,requireRole(['participant']),getProfile);
router.put('/profile',authenticateUser,requireRole(['participant']),updateProfile);
router.put('/change-password',authenticateUser,requireRole(['participant']),changePassword);
router.post('/follow/:organizerId',authenticateUser,requireRole(['participant']),followOrganizer);
router.delete('/follow/:organizerId',authenticateUser,requireRole(['participant']),unfollowOrganizer);

module.exports = router;