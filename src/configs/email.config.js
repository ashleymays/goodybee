const mailer = require('nodemailer')
const config = require('./credentials.config')

// Send email to reset password
module.exports = async (url, user, token) => {
    let transporter = mailer.createTransport({
        service: 'gmail',
        port: 465,
        secure: true,
        auth: {
            user: config.emailUser,
            pass: config.emailPassword
        }
    })

    await user.updateOne({ $set: { resetLink: token } })

    transporter.sendMail({
        from: `Recipe Finder <${config.emailUser}>`,
        to: user.email,
        subject: 'Reset Password Request - Recipe Finder',
        html: `
        <p>Hi ${user.firstName},</p>
        <p>
            You recently requested to reset your password 
            for your Recipe Finder account. Use the button 
            below to reset it. <strong>This password reset is only 
            valid for the next 15 minutes.</strong>
        </p>

        <a href="${url}/user/reset-password/${token}">${url}/user/reset-password/${token}</a>

        <br />

        <p>If you did not request a password reset, please 
            ignore this email.
        </p>
        
        <br />

        <p>Thanks,</p>

        <p>The Recipe Finder Team</p>
        `
    })
}