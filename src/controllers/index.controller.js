class Get {
    home = (req, res) => res.render('./index/index.ejs', { isAuthenticated: req.isAuthenticated() })

    about = (req, res) => res.render('./index/about.ejs', { isAuthenticated: req.isAuthenticated() })
    
    error = (req, res) => res.render('./index/error.ejs', { error: 'Page not found.', isAuthenticated: req.isAuthenticated() })
}


module.exports = {
    get: new Get(),
}