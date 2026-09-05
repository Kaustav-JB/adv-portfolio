# Nisha Shreya — Advocate Portfolio

Personal portfolio site for Nisha Shreya, an AIBE XXI-qualified advocate based in Lucknow, Uttar Pradesh.

## Stack

- Static HTML + Tailwind CSS (CDN) + vanilla JS
- Lucide icons
- Contact form: native HTML form → Vercel Serverless Function (`api/contact.js`) → email delivery service, with hCaptcha spam protection

## Structure

```
index.html          Page markup
public/style.css     Custom CSS (glassmorphism theme, on top of Tailwind)
public/custom.js     Page behavior (nav, scroll effects, confirmation modal)
public/images/       Photos and internship-related imagery
public/pdf/          Downloadable CV
api/contact.js       Serverless function that forwards form submissions for email delivery
```

## Copyright

Copyright (c) 2026 Nisha Shreya. All Rights Reserved.

This repository is publicly viewable for reference and portfolio purposes only. No part of its contents may be copied, modified, distributed, or reused without prior written permission. See [LICENSE](./LICENSE) for full terms.
