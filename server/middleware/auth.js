const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
  // Get the token from the header
  const token = req.header('x-auth-token');

  // Check if there is token
  if (!token) {
    return res.status(401).json({ msg: 'No token, Authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not found' });
  }
};
