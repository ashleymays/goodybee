const passport = require('../configs/passport.config')
const bcrypt = require('bcrypt')
const User = require('../models/user.model')
const AWS = require('aws-sdk')
const config = require('../configs/credentials.config')
const JWT = require('jsonwebtoken')
const sendEmail = require('../configs/email.config')


class UserController {
    checkPassword = (req, res, route) => {
        if (req.body.newPass !== req.body.confirmPass) {
            return res.render(route, { message: 'Passwords do not match.', isAuthenticated: req.isAuthenticated() })
        }
    }
    
    renderErrorPage = (req, res, err) => res.render('./index/error.ejs', { error: `Error: ${err.message}`, isAuthenticated: req.isAuthenticated() })

    deleteAWSPicture = (s3, bucket, key) => {
        s3.deleteObject({ Bucket: bucket, Key: key }, (err, data) => {
            if (err) return console.error(err)
        })
    }

    addAWSPicture = (s3, params) => {
        s3.putObject(params, (err, data) => {
            if (err) return console.error(err)
        })
    }
}





//// GET

class Get extends UserController {
    home = (req, res) => res.redirect('/user/login')

    login = (req, res) => res.render('./user/login.ejs', { isAuthenticated: req.isAuthenticated() })

    signup = (req, res) => res.render('./user/signup.ejs', { message: undefined, isAuthenticated: req.isAuthenticated() })

    forgotPassword = (req, res) => res.render('./user/forgot-password.ejs', { message: undefined, isAuthenticated: req.isAuthenticated() })

    resetPassword = (req, res) => {
        JWT.verify(req.params.token, config.JWTSecret, (err, data) => {
            if (err) {
                return res.send('<script>alert("Expired or incorrect link. Press "ok" to redirect."); window.location.href = "/user/login"; </script>')
            }
            res.render('./user/reset-password.ejs', { message: undefined, isAuthenticated: req.isAuthenticated() })
        })
    }

    resetPasswordRedirect = (req, res) => res.redirect('/user/login')

    profile = (req, res) => res.render('./user/profile.ejs', { user: req.user, isAuthenticated: req.isAuthenticated() })

    editProfile = (req, res) => res.redirect('/user/profile')
}







//// POST

class Post extends UserController {
    login = passport.authenticate('local', {
        successRedirect: '/user/profile',
        failureRedirect: '/user/login',
        failureFlash: true
    })

    signup = async (req, res) => {
        try {
            // Make sure passwords are equal
            this.checkPassword(req, res, './user/signup.ejs')

            let hashedPassword = await bcrypt.hash(req.body.newPass, config.bcryptSalt);
            const newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hashedPassword,
                recipes: []
            }

            let user = await User.findOne({ email: newUser.email })

            // User has not signed with the same email -> add new user to database
            if (!user) {
                await User.collection.insertOne(newUser)
                res.redirect('/user/login')
            } else {
                res.render('./user/signup.ejs', { message: 'This email is already in use.', isAuthenticated: req.isAuthenticated() })
            }
        } catch (err) {
            res.render('./user/signup.ejs', { message: 'Something went wrong.', isAuthenticated: req.isAuthenticated() })
        }
    }

    forgotPassword = async (req, res) => {
        try {
            let user = await User.findOne({ email: req.body.email })
            if (user) {
                const token = JWT.sign({ id: user.id }, config.JWTSecret, { expiresIn: 3600 })
                let url = `${req.protocol}://${req.get('host')}`
                await user.updateOne({ $set: { resetToken: token }})
                await sendEmail(url, user, token)
                res.render('./user/forgot-password.ejs', { message: 'Email sent!', isAuthenticated: req.isAuthenticated() })
            } else {
                res.render('./user/forgot-password.ejs', { message: 'There is no user associated with this email.', isAuthenticated: req.isAuthenticated() })
            }
        } catch(err) {
            res.render('./user/forgot-password.ejs', { message: 'Something went wrong.', isAuthenticated: req.isAuthenticated() })
        }
    }

    resetPassword = async (req, res) => {
        try {
            // Make sure passwords are equal
            this.checkPassword(req, res, './user/reset-password.ejs')

            let user = await User.findOne({ resetToken: req.params.token })
            let hashedPassword = await bcrypt.hash(req.body.newPass, config.bcryptSalt)
            await user.updateOne({ $set: { password: hashedPassword } })
            res.redirect('/user/login')
        } catch(err) {
            res.render('./user/reset-password.ejs', { message: 'Something went wrong.', isAuthenticated: req.isAuthenticated() })
        }
    }
}








//// PUT

class Put extends UserController {
    addBookmark = async (req, res) => {
        try {
            if (req.isAuthenticated()) {
                let response = await User.updateOne({ email: req.user.email }, { $push: { recipes: req.body }})
                if (response.acknowledged) {
                    res.json('Added bookmark')
                } else {
                    res.json('Failed to save bookmark')
                }
            }            
        } catch(err) {
            this.renderErrorPage(req, res, err)
        }
    }

    removeBookmark = async (req, res) => {
        try {
            let response = await User.updateOne({ email: req.user.email }, { $pull: { recipes: { id: req.body.id } } })
            if (response && response.acknowledged) {
                res.json('Removed bookmark')
            } else {
                res.json('Failed to remove bookmark')
            }
        } catch(err) {
            this.renderErrorPage(req, res, err)
        }
    }

    editProfile = async (req, res) => {
        try {
            // Check that the proposed new email address isn't already in use by a different user.
            let user = await User.findOne({ email: req.body.email })
            if (!user || user.id === req.user.id) {
                let options = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: req.body.email,
                }
                await User.findOneAndUpdate({ email: req.user.email }, { $set: options } )
                res.redirect('/user/profile')
            } else {
                res.send('<script>alert("User with that email already exists. Please use a different one.") </script>')
            }
        } catch(err) {
            res.send('<script>alert("There was an error updating your information."); window.location.href = "/user/profile"; </script>')
        }
    }

    updateProfilePicture = async (req, res) => {
        try {
            let bucket = config.awsBucketName
            let key = req.user.id + Date.now() + req.file.originalname
            let region = config.awsBucketRegion

            let params = {
                Bucket: bucket,
                Key: key,
                Body: req.file.buffer,
                ACL: 'public-read'
            }
    
            AWS.config.update({
                accessKeyId: config.awsBucketAccessKeyID,
                secretAccessKey: config.awsBucketSecretKey,
                "region": region
            })

            let s3 = new AWS.S3()
            
            // Delete old image from S3 bucket and add a new one
            this.deleteAWSPicture(s3, bucket, req.user.profilePictureName)
            this.addAWSPicture(s3, params)
            
            // Add profile picture url to user database document
            let url = `https://${bucket}.s3.amazonaws.com/${key}`
            let response = await User.updateOne({ email: req.user.email }, { $set: { profilePictureURL: url, profilePictureName: key } })
            if (response.acknowledged) {
                res.render('./user/profile.ejs', { user: req.user, isAuthenticated: req.isAuthenticated() })
            }
        } catch(err) {
            this.renderErrorPage(req, res, err)
        }
    }
}







//// DELETE

class Delete extends UserController {
    logOut = (req, res) => {
        req.logout(err => {
            if (err) this.renderErrorPage(req, res, err)
            else res.redirect('/user/login')
        })
    }

    profile = async (req, res) => {
        try {
            let s3 = new AWS.S3()
            this.deleteAWSPicture(s3, config.awsBucketName, req.user.profilePictureName)
            await User.findOneAndDelete(req.user)
            this.logOut(req, res)
        } catch(err) {
            this.renderErrorPage(req, res, err)
        }
    }
}

class Authenticate {
    // user is logged in -> go to profile page
    checkUserAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            return res.redirect('/user/profile')
        }
        return next()
    }
    
    // user is not logged in -> go to login page
    checkUserNotAuthenticated = (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/user/login')
        }
        return next()
    }
}


module.exports = {
    get: new Get(),
    post: new Post(),
    put: new Put(),
    delete: new Delete(),
    auth: new Authenticate()
}