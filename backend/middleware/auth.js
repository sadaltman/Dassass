const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'No authorization header found'
        });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authorization format'
        });
    }
    const tokenValue = tokenParts[1];
    try {
        const data = jwt.verify(tokenValue, process.env.JWT_SECRET);
        req.userInfo = data;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Token verification failed'
        });
    }
};

const requireRole = (allowedroles) => {
    return (req, res, next) => {
        console.log('requireRole check:', { 
            userInfo: req.userInfo, 
            allowedRoles: allowedroles,
            userType: req.userInfo?.userType 
        });
        if (!req.userInfo || !allowedroles.includes(req.userInfo.userType)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};

module.exports = {authenticateUser,requireRole};