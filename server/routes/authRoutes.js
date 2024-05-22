const express = require('express');
const {registration,login, getUserName, isLoggedIn } = require("../controllers/authController");
const router = express.Router();
const authMiddleware = require('../middleware/auth')


// registration route
router.post('/register',registration);

// login route
router.post('/login',login)

// get username
router.get('/getusername',authMiddleware,getUserName);

// isLoggedIn
router.get('/isloggedin',isLoggedIn)

module.exports = router;