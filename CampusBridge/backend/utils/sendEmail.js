const { Resend } = require('resend');

const sendEmail = async (options) => {
    try {
        console.log("SENDING EMAIL VIA RESEND");

        const resendApiKey = process.env.RESEND_API_KEY;
        
        if (process.env.MOCK_EMAIL === 'true' || !resendApiKey) {
            console.log('\n================================================');
            console.log(`[MOCK EMAIL] TO: ${options.email}`);
            console.log(`[SUBJECT] ${options.subject}`);
            console.log(`[MESSAGE]\n${options.message}`);
            console.log('================================================\n');
            console.log('NOTE: To send real emails via Resend, configure RESEND_API_KEY in your backend/.env file.\n');
            return true;
        }

        const resend = new Resend(resendApiKey);

        // NOTE: On the free tier of Resend without a verified domain, 
        // you MUST send FROM 'onboarding@resend.dev'.
        // You can only send TO the email address you used to register your Resend account.
        const { data, error } = await resend.emails.send({
            from: 'CampusBridge <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        });

        if (error) {
            console.error('Resend API error:', error);
            return false;
        }

        console.log('Email sent successfully via Resend:', data);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = sendEmail;
