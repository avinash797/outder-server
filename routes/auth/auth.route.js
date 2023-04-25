const express = require('express')
const authController = require('../../controllers/auth.controller')
const authenticate = require('../../middlewares/authenticate.middleware')

const router = express.Router()

router.route('/signup').get(authController.signup)
router.route('/signin').get(authController.signin)
router.route('/update-password').get(authenticate, authController.updatePassword)
router.route('/forgot-password').get(authController.forgotPassword)
router.route('/reset-password').get(authController.resetPassword)


module.exports = router
