module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const body = req.body || {};
    const baseUrl = body.redirect_base || '/';
    const botcheck = body.botcheck;

    // Honeypot: silently report success without sending an email
    if (botcheck) {
        res.writeHead(303, { Location: `${baseUrl}?submitted=true#contact` });
        res.end();
        return;
    }

    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set in the environment.');
        res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
        res.end();
        return;
    }

    if (!process.env.CONTACT_RECIPIENT_EMAIL) {
        console.error('CONTACT_RECIPIENT_EMAIL is not set in the environment.');
        res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
        res.end();
        return;
    }

    const name = body.name || '';
    const email = body.email || '';
    const matter = body.matter || '';
    const message = body.message || '';

    const html = `
        <h2>New Inquiry from Portfolio Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Nature of Inquiry:</strong> ${matter}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
    `;

    try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Portfolio Contact Form <onboarding@resend.dev>',
                to: [process.env.CONTACT_RECIPIENT_EMAIL],
                reply_to: email || undefined,
                subject: body.subject || 'New Inquiry from Portfolio Website',
                html,
            }),
        });

        const rawBody = await resendResponse.text();
        let result;
        try {
            result = JSON.parse(rawBody);
        } catch (parseError) {
            console.error(
                `Resend returned a non-JSON response (status ${resendResponse.status}):`,
                rawBody.slice(0, 500)
            );
            res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
            res.end();
            return;
        }

        const success = resendResponse.ok && Boolean(result.id);
        if (!success) {
            console.error('Resend rejected the submission:', result);
        }
        res.writeHead(303, { Location: `${baseUrl}?submitted=${success}#contact` });
        res.end();
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
        res.end();
    }
};
