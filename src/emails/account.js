const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'amgadramses96@gmail.com',
        subject: 'Thanks for joining in',
        text: `Welcome to the app, ${name}! Let us know how you get along with the app.`
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'amgadramses96@gmail.com',
        subject: 'How can we improve?',
        text: `We are sorry to hear that you terminated your account, ${name}. Please let us know how can we improve our services to meet your demands?`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}