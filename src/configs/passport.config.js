const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/user.model')

const verify = async (email, password, done) => {
    try {
        let user = await User.collection.findOne( { 'email': email })
        if (!user) {
            return done(null, false, { message: 'No user found with that email.' })
        }
        let isSamePassword = await bcrypt.compare(password, user.password)
        if (!isSamePassword) {
            return done(null, false, { message: 'Incorrect password.' })
        }
        return done(null, user)
    } catch(err) {
        console.error(err)
    }
}


passport.use(new LocalStrategy({ usernameField: 'email' }, verify))


// persist user information in the login session
passport.serializeUser((user, done) => done(null, user._id))

passport.deserializeUser(async (id, done) => {
    try {
        let user = await User.findById(id)
        return done(null, user)
    } catch(err) {
        return done(err)
    }
})

module.exports = passport