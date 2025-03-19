// middleware/admin.js
module.exports = function(req, res, next) {
    // Check if user exists in request (set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token, authorization denied' 
      });
    }
  
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized as an admin' 
      });
    }
  
    next();
  };