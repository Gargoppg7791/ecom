const sgMail = require('@sendgrid/mail');

const sendEmail = async (email, subject, text) => {
    try {
        console.log("Attempting to send email with SendGrid");
        console.log("Using API Key:", process.env.SENDGRID_API_KEY ? "Present" : "Missing");
        console.log("From Email:", process.env.SENDGRID_FROM_EMAIL);

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const msg = {
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL, // This must be verified in SendGrid
            subject: subject,
            text: text,
            html: text.replace(/\n/g, '<br>'), // Convert newlines to HTML breaks
        };

        console.log("Sending email to:", email);
        const response = await sgMail.send(msg);
        console.log("Email sent successfully:", response[0].statusCode);
        return true;
    } catch (error) {
        console.error("Detailed email sending error:", {
            message: error.message,
            code: error.code,
            response: error.response?.body,
            stack: error.stack
        });
        throw new Error(`Email could not be sent: ${error.message}`);
    }
};

module.exports = sendEmail;