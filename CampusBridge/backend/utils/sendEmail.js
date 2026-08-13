const sendEmail = async (options) => {
    try {
        console.log("SENDING EMAIL VIA BREVO");

        const brevoApiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.EMAIL_USER; // The email verified in Brevo
        
        if (process.env.MOCK_EMAIL === 'true' || !brevoApiKey || !senderEmail) {
            console.log('\n================================================');
            console.log(`[MOCK EMAIL] TO: ${options.email}`);
            console.log(`[SUBJECT] ${options.subject}`);
            console.log(`[MESSAGE]\n${options.message}`);
            console.log('================================================\n');
            console.log('NOTE: To send real emails via Brevo, configure BREVO_API_KEY and EMAIL_USER in your backend/.env file.\n');
            return true;
        }

        const payload = {
            sender: {
                name: "CampusBridge",
                email: senderEmail
            },
            to: [
                { email: options.email }
            ],
            subject: options.subject,
            textContent: options.message,
            htmlContent: options.html || options.message
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Brevo API error:', data);
            return false;
        }

        console.log('Email sent successfully via Brevo:', data);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

module.exports = sendEmail;
