const express = require('express')
const controller = require('../controllers/index.controller')

let router = express.Router()



//// GET

// Display home page
router.get('/', controller.get.home)

// Display about page
router.get('/about', controller.get.about)

// Display the error if there is one
router.get('/error', controller.get.error)



module.exports = router