const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization').replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a mechanic token
    if (decoded.mechanicId) {
      req.user = { mechanicId: decoded.mechanicId };
    } else if (decoded.userId) {
      req.user = { userId: decoded.userId };
    } else {
      return res.status(401).json({ message: 'Invalid token' });
    }

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 