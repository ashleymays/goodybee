const axios = require('axios')
const queryString = require('query-string')
const isEqual = require('lodash.isequal')
const config = require('../configs/credentials.config')



class Controller {
    APP_ID = config.appID
    APP_KEY = config.appKey
    query = {}
    list = []
    nextPageURL = ""
    bkmks = []
    isNewQuery = q => !isEqual(this.query, q)
}

class Get extends Controller { 
    home = (req, res) => res.redirect('/')

    recipes = async (req, res) => {
        try {
            let URL = `https://api.edamam.com/api/recipes/v2?type=public&app_key=${this.APP_KEY}&app_id=${this.APP_ID}&` + queryString.stringify(req.query)
            let response = await axios.get(URL)
            // This 'get' request will be called even when the user requests more recipes (AKA presses the 'Load More' button)
            // So we only reset the list and url when there has been a new query.
            if (this.isNewQuery(req.query)) {
                this.list = response.data.hits
            }

            // Make sure there is a next page of results in the API, otherwise that's the end of the search results
            // Also, only reset this to get the second page of results in the API, the endpoint 'more-recipes' takes care of subsequent recipes
            if (this.isNewQuery(req.query) && response.data._links.hasOwnProperty('next')) {
                this.nextPageURL = response.data._links.next.href
            }

            // Update query
            this.query = req.query

            // If the user is logged in, get their bookmarked recipes and show them when they search for more recipes
            this.bkmks = req.user && req.user.recipes ? req.user.recipes : []
            res.render('./recipes/recipes.ejs', { recipesList: this.list, totalRecipes: response.data.count, searchQuery: this.query.q, bookmarks: this.bkmks, isAuthenticated: req.isAuthenticated() })
        } catch(err) {
            res.render('./index/error.ejs', { error: `Error: ${err.message}`, isAuthenticated: req.isAuthenticated() })
        }
    }
    
    moreRecipes = async (req, res) => {
        try {
            let response = await axios.get(this.nextPageURL)

            // Add the new recipes to the list and display them on the recipes page
            this.list = this.list.concat(response.data.hits)
            this.nextPageURL = response.data._links.next.href
            this.bkmks = req.user && req.user.recipes ? req.user.recipes : []
            res.render('./recipes/recipes.ejs', { recipesList: this.list, totalRecipes: response.data.count, searchQuery: this.query.q, bookmarks: this.bkmks, isAuthenticated: req.isAuthenticated() })
        } catch(err) {
            res.render('./index/error.ejs', { error: `Error: ${err.message}`, isAuthenticated: req.isAuthenticated() })
        }
    }
    
    recipe = async (req, res) => {    
        try {
            const options = {
                method: 'get',
                url: `https://api.edamam.com/api/recipes/v2/${req.params.id}`,
                params: {
                    type: 'public',
                    app_key: this.APP_KEY,
                    app_id: this.APP_ID,
                }
            }
            let response = await axios(options)
            res.render('./recipes/recipe.ejs', { selectedRecipe: response.data, isAuthenticated: req.isAuthenticated() })
        } catch(err) {
            res.render('./index/error.ejs', { error: `Error: ${err.message}`, isAuthenticated: req.isAuthenticated() })
        }
    }
}

module.exports = {
    get: new Get(),
}