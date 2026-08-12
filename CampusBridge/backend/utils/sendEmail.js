const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        console.log("SENDING EMAIL. process.env.EMAIL_USER = ", process.env.EMAIL_USER);
        console.log("SENDING EMAIL. process.env.EMAIL_PASS = ", process.env.EMAIL_PASS ? "<HIDDEN>" : undefined);

        // If no real credentials exist in .env or MOCK_EMAIL is true, just log the email and succeed
        if (process.env.MOCK_EMAIL === 'true' || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('\n================================================');
            console.log(`[MOCK EMAIL] TO: ${options.email}`);
            console.log(`[SUBJECT] ${options.subject}`);
            console.log(`[MESSAGE]\n${options.message}`);
            console.log('================================================\n');
            console.log('NOTE: To send real emails, please configure EMAIL_USER and EMAIL_PASS in your backend/.env file.\n');
            return true;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"CampusBridge" <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = sendEmail;
