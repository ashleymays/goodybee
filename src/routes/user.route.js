const express = require('express')
const controller = require('../controllers/user.controller')
const router = express.Router()
const multer = require('multer')
const upload = multer()




//// GET

// Redirect to login page
router.get('/', controller.get.home)

// Display login page
router.get('/login', controller.auth.checkUserAuthenticated, controller.get.login)

// Display sign up page
router.get('/signup', controller.auth.checkUserAuthenticated, controller.get.signup)

// Display forgot password page
router.get('/forgot-password', controller.get.forgotPassword)

// Redirect to login if no token for reset password
router.get('/reset-password', controller.get.resetPasswordRedirect)

// Display reset password page
router.get('/reset-password/:token', controller.get.resetPassword)

// Display profile page
router.get('/profile', controller.auth.checkUserNotAuthenticated, controller.get.profile)

// Redirect to profile page
router.get('/edit-profile', controller.get.editProfile)





//// POST

// Get login form data
router.post('/login', controller.auth.checkUserAuthenticated, controller.post.login)

// Get sign up form data
router.post('/signup', controller.auth.checkUserAuthenticated, controller.post.signup)

// Get email from user when they've forgotten their password
router.post('/forgot-password', controller.post.forgotPassword)

// Get info to reset password
router.post('/reset-password/:token', controller.post.resetPassword)




//// PUT

// Add bookmark
router.put('/add-bookmark', controller.auth.checkUserNotAuthenticated, controller.put.addBookmark)

// Remove bookmark
router.put('/remove-bookmark', controller.auth.checkUserNotAuthenticated, controller.put.removeBookmark)

// Update profile picture
router.put('/profile-picture', controller.auth.checkUserNotAuthenticated, upload.single('file'), controller.put.updateProfilePicture)

// Edit login information
router.put('/edit-profile', controller.auth.checkUserNotAuthenticated, controller.put.editProfile)


//// DELETE

// Sign Out
router.delete('/logout', controller.auth.checkUserNotAuthenticated, controller.delete.logOut)

// Delete Account
router.delete('/profile', controller.auth.checkUserNotAuthenticated, controller.delete.profile)


module.exports = router