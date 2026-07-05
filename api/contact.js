import { Resend } from 'resend';

export default async function handler(req, res) {
  // Add CORS headers for preflight requests and response safety
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { firstName, lastName, email, phone, message } = req.body;

    // Server-side validation
    if (!firstName || !firstName.trim()) {
      return res.status(400).json({ error: 'First name is required.' });
    }
    if (!lastName || !lastName.trim()) {
      return res.status(400).json({ error: 'Last name is required.' });
    }
    if (!email || !email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required.' });
    }
    if (!message || message.trim().length < 20) {
      return res.status(400).json({ error: 'Message must be at least 20 characters.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in the environment variables.');
      return res.status(500).json({ error: 'Email service configuration error. Please contact the administrator.' });
    }

    const resend = new Resend(apiKey);

    // Send the email using the Resend SDK
    const emailResult = await resend.emails.send({
      from: 'NextGen Pharma <contact@nextgenpharma.org>',
      to: ['contact@nextgenpharma.org'],
      replyTo: email,
      subject: `[Contact Form] ${firstName} ${lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Submission</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #0f172a 0%, #0d9488 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
            .header p { margin: 5px 0 0; color: #ccfbf1; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }
            .content { padding: 30px; }
            .field-row { margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
            .field-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0d9488; letter-spacing: 0.05em; margin-bottom: 6px; }
            .value { font-size: 16px; color: #0f172a; font-weight: 500; }
            .message-box { background-color: #f8fafc; border-left: 4px solid #0d9488; padding: 15px; border-radius: 4px; font-size: 15px; line-height: 1.7; color: #334155; white-space: pre-wrap; font-style: italic; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
            .footer a { color: #0d9488; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <p>NextGen Pharma Solutions</p>
              <h1>New Contact Message</h1>
            </div>
            <div class="content">
              <div class="field-row">
                <div class="label">Full Name</div>
                <div class="value">${firstName} ${lastName}</div>
              </div>
              <div class="field-row">
                <div class="label">Email Address</div>
                <div class="value"><a href="mailto:${email}" style="color: #0d9488; text-decoration: none;">${email}</a></div>
              </div>
              <div class="field-row">
                <div class="label">Phone Number</div>
                <div class="value">${phone ? phone : '<span style="color: #94a3b8; font-style: italic;">Not provided</span>'}</div>
              </div>
              <div class="field-row">
                <div class="label">Message</div>
                <div class="message-box">${message}</div>
              </div>
            </div>
            <div class="footer">
              This message was sent from the official contact form on <a href="https://nextgenpharma.org">nextgenpharma.org</a>.
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (emailResult.error) {
      console.error('Resend delivery error details:', emailResult.error);
      return res.status(400).json({ error: emailResult.error.message });
    }

    return res.status(200).json({ success: true, message: 'Email sent successfully', data: emailResult });
  } catch (error) {
    console.error('Unhandled serverless exception in contact route:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
