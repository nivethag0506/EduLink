const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }
            if (!req.user.isVerified && req.user.role !== 'Admin') {
                return res.status(403).json({ message: 'Account pending admin verification.' });
            }
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const restrictCollege = (req, res, next) => {
    const requestedCollegeId = req.params.collegeId || req.body.collegeId || req.query.collegeId;
    if (!requestedCollegeId) {
        return next(); // or block depending on strictness
    }

    if (req.user.collegeId.toString() !== requestedCollegeId.toString() && req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Forbidden. Cross-college access is not allowed.' });
    }
    next();
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as admin' });
    }
};

module.exports = { protect, restrictCollege, adminOnly };
