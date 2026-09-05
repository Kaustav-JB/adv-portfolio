module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const body = req.body || {};
    const baseUrl = body.redirect_base || '/';
    const botcheck = body.botcheck;

    // Honeypot: silently report success without spending a Web3Forms submission
    if (botcheck) {
        res.writeHead(303, { Location: `${baseUrl}?submitted=true#contact` });
        res.end();
        return;
    }

    if (!process.env.WEB3FORMS_ACCESS_KEY) {
        console.error('WEB3FORMS_ACCESS_KEY is not set in the environment.');
        res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
        res.end();
        return;
    }

    try {
        const web3Response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                access_key: process.env.WEB3FORMS_ACCESS_KEY,
                subject: body.subject || 'New Inquiry from Portfolio Website',
                name: body.name || '',
                email: body.email || '',
                matter: body.matter || '',
                message: body.message || '',
                'h-captcha-response': body['h-captcha-response'] || '',
            }),
        });

        const result = await web3Response.json();
        const status = result.success ? 'true' : 'false';
        res.writeHead(303, { Location: `${baseUrl}?submitted=${status}#contact` });
        res.end();
    } catch (error) {
        console.error('Error forwarding submission to Web3Forms:', error);
        res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
        res.end();
    }
};
