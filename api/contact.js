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

    const siteOrigin =
        req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : baseUrl);

    try {
        const formData = new FormData();
        formData.append('access_key', process.env.WEB3FORMS_ACCESS_KEY);
        formData.append('subject', body.subject || 'New Inquiry from Portfolio Website');
        formData.append('name', body.name || '');
        formData.append('email', body.email || '');
        formData.append('matter', body.matter || '');
        formData.append('message', body.message || '');
        formData.append('h-captcha-response', body['h-captcha-response'] || '');

        const web3Response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
                Origin: siteOrigin,
                Referer: `${siteOrigin}/`,
            },
            body: formData,
        });

        const rawBody = await web3Response.text();
        let result;
        try {
            result = JSON.parse(rawBody);
        } catch (parseError) {
            console.error(
                `Web3Forms returned a non-JSON response (status ${web3Response.status}):`,
                rawBody.slice(0, 500)
            );
            res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
            res.end();
            return;
        }

        const status = result.success ? 'true' : 'false';
        if (!result.success) {
            console.error('Web3Forms rejected the submission:', result.message || result);
        }
        res.writeHead(303, { Location: `${baseUrl}?submitted=${status}#contact` });
        res.end();
    } catch (error) {
        console.error('Error forwarding submission to Web3Forms:', error);
        res.writeHead(303, { Location: `${baseUrl}?submitted=false#contact` });
        res.end();
    }
};
