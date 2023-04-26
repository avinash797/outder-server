const express = require('express')
const userController = require('../../controllers/user.controller')
const authenticate = require('../../middlewares/authenticate.middleware');

const router = express.Router()

router.route('/profile').get(authenticate, userController.profile)

module.exports = router
