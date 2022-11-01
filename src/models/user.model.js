const mongoose = require('mongoose')

const user = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
        default: '',
        required: true
    },
    profilePictureURL: {
        type: String,
        default: '../../public/images/default-user-icon.jpg',
        required: true
    },
    profilePictureName: {
        type: String,
        default: '',
        required: true
    },
    recipes: [{
        type: Object,
        required: true
    }]
})

module.exports = mongoose.model('User', user)