const httpStatus = require('http-status');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const config = require('../config');

const signup = async (req, res, next) => {
  const { email, username, firstName, lastName, password } = req.body;

  try {
    // Check if the user already exists
    const user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUser = new User({
      email,
      username,
      firstName,
      lastName,
      password: hashedPassword,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Return the saved user
    return res.status(httpStatus.OK).json({
      success: true,
      status: httpStatus.OK,
      data: savedUser
    })
  } catch (error) {
    console.error(error);
    return next(err)
  }
}

const signin = async (req, res, next) => {
  const { emailOrUsername, password } = req.body;

  try {
    // Find the user in the database using their email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
    });

    // If the user is not found, send an error response
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.UNAUTHORIZED,
        data: {message: 'Invalid email or username'}
      })
    }

    console.log(user)

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If the passwords don't match, send an error response
    if (!passwordMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        status: httpStatus.UNAUTHORIZED,
        data: {message: 'Invalid password'}
      })
    }

    // Create a JWT token to authenticate the user
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    // Send a success response with the JWT token
    return res.status(httpStatus.OK).json({ 
      success: true,
      status: httpStatus.ACCEPTED,
      data: {token: token}
     });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });  }
}

const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Find user by ID
    const user = await User.findById(req.userId);

    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(httpStatus.UNAUTHORIZED).json({ 
        success: false,
        status: httpStatus.UNAUTHORIZED,
        data: {message: 'Current password is incorrect' }
       });
    }

    // Update password and save user
    user.password = newPassword;
    await user.save();

    return res.status(httpStatus.OK).json({ 
      success: true,
      status: httpStatus.OK,
      data: { message: 'Password updated successfully' }
     });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message }); 
  }
}

// Generate a unique reset code
const generateResetCode = async (user) => {
  const code = crypto.randomBytes(20).toString('hex');
  user.resetCode = code;
  await user.save();
  return code;
};

// Send a password reset email
const sendResetEmail = async (user, resetCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.userEmail,
      pass: config.email.password
    }
  });

  const mailOptions = {
    from: config.email.userEmail,
    to: user.email,
    subject: 'Password Reset Request',
    text: `Hi ${user.firstname},\n\n` +
          `You recently requested a password reset for your account.\n\n` +
          `To reset your password, please visit the following link and enter the code:\n\n` +
          `${config.clientURL}/api/auth/reset-password?code=${resetCode}\n\n` +
          `If you did not request a password reset, please ignore this email.\n\n` +
          `Best regards,\n` +
          `The Team`
  };

  await transporter.sendMail(mailOptions);
};

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ 
        success: false,
        status: httpStatus.NOT_FOUND,
        data: { message: 'User not found' }
       });
    }

    const resetCode = await generateResetCode(user);
    await sendResetEmail(user, resetCode);

    return res.status(httpStatus[200]).json({ 
      success: true,
      status: httpStatus[200],
      data: { message: 'Password reset email sent' }
     });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message }); 
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ resetCode: req.body.code });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({ 
        success: false,
        status: httpStatus.NOT_FOUND,
        data: { message: 'Reset code not found' }
       });
    }

    user.password = req.body.password;
    user.resetCode = undefined;
    await user.save();

    return res.status(httpStatus[200]).json({ 
      success: true,
      status: httpStatus[200],
      data: { message: 'Password reset successfully' }
     });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message }); 
  }
}



module.exports = {
  signup,
  signin,
  updatePassword,
  forgotPassword,
  resetPassword
}

