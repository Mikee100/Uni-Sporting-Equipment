const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user info to req.user
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    console.log('Authenticated user:', req.user); // Debug log
    next();
  } catch (err) {
    console.log('JWT error:', err.message); // Log JWT errors
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

// Middleware to check if user has one of the required roles
function authorizeRoles(...roles) {
  return (req, res, next) => {
    console.log('Authorize check:', { user: req.user, allowed: roles }); // Debug log
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('Access denied for user:', req.user); // Debug log
      return res.status(403).json({ message: 'Access denied.' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRoles }; 