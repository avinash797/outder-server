const httpStatus = require('http-status');

const User = require('../models/user');


const profile = async (req, res, next) => {
       try {
        // Find user by ID
        const user = await User.findById(req.userId, { password: 0 });
    
        // Handle user data here
        return res.status(httpStatus.OK).json({ 
            success: true,
            status: httpStatus.ACCEPTED,
            data: {message: 'User Found', user}
           });     
         } catch (error) {
            return res.status(httpStatus.OK).json({ 
                success: false,
                status: httpStatus.NOT_ACCEPTABLE,
                data: {message: 'User Not Found'}
               });       }
  }

module.exports = {profile};