const express = require('express')
const controller = require('../controllers/recipes.controller')

let router = express.Router()

// Redirect to home page
router.get('/', controller.get.home)

// Display searched recipes
router.get('/recipes', controller.get.recipes)

// Display more results for searched recipes
router.get('/more-recipes', controller.get.moreRecipes)

// Display the selected recipe
router.get('/recipe/:id', controller.get.recipe)


module.exports = router