const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');

const authenticate = (req, res, next) => {
    // Get the JWT token from the request headers
    console.log(req.headers)
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
      // If no token is provided, send a 401 Unauthorized response
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          status: httpStatus.UNAUTHORIZED,
          data: {message: 'No token provided'}
        })
      }
      try {
        // Verify the JWT token using the JWT_SECRET environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // Set the user ID on the request object for subsequent middleware functions to use
        req.userId = decoded.userId;
    
        // Call the next middleware function in the chain
        next();
      } catch (error) {
        // If the JWT token is invalid, send a 401 Unauthorized response
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            status: httpStatus.UNAUTHORIZED,
            data: {message: 'Invalid token'}
          })      }
  }

module.exports = authenticate;