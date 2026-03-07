import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, email, phone,
    vesselMake, vesselModel, vesselLength, vesselYear, vesselCondition,
    currentMarina, currentCity,
    destMarina, destCity,
    schedule, deadline,
    notes,
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const vesselDesc = [vesselYear, vesselMake, vesselModel, vesselLength ? `${vesselLength}ft` : '']
    .filter(Boolean).join(' ') || 'Not specified';

  try {
    await resend.emails.send({
      from: 'Brian Cline <detailing@sailorskills.com>',
      to: 'standardhuman@gmail.com',
      replyTo: email,
      subject: `Delivery Inquiry — ${name} — ${vesselDesc}`,
      text: [
        `Vessel Delivery Inquiry`,
        ``,
        `Contact:`,
        `  Name: ${name}`,
        `  Email: ${email}`,
        phone ? `  Phone: ${phone}` : null,
        ``,
        `Vessel:`,
        vesselMake ? `  Make: ${vesselMake}` : null,
        vesselModel ? `  Model: ${vesselModel}` : null,
        vesselLength ? `  Length: ${vesselLength} ft` : null,
        vesselYear ? `  Year: ${vesselYear}` : null,
        vesselCondition ? `  Condition: ${vesselCondition}` : null,
        ``,
        `Route:`,
        `  From: ${currentMarina || '?'}, ${currentCity || '?'}`,
        `  To: ${destMarina || '?'}, ${destCity || '?'}`,
        ``,
        `Schedule:`,
        schedule ? `  When: ${schedule}` : null,
        deadline ? `  Deadline: ${deadline}` : null,
        notes ? `\nNotes:\n${notes}` : null,
      ].filter(Boolean).join('\n'),
      html: `
        <h2>Vessel Delivery Inquiry</h2>

        <h3 style="color:#345475; margin-top:20px;">Contact</h3>
        <table style="border-collapse:collapse; font-family:sans-serif;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Phone</td><td>${phone}</td></tr>` : ''}
        </table>

        <h3 style="color:#345475; margin-top:20px;">Vessel</h3>
        <table style="border-collapse:collapse; font-family:sans-serif;">
          ${vesselMake ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Make</td><td>${vesselMake}</td></tr>` : ''}
          ${vesselModel ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Model</td><td>${vesselModel}</td></tr>` : ''}
          ${vesselLength ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Length</td><td>${vesselLength} ft</td></tr>` : ''}
          ${vesselYear ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Year</td><td>${vesselYear}</td></tr>` : ''}
          ${vesselCondition ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Condition</td><td>${vesselCondition}</td></tr>` : ''}
        </table>

        <h3 style="color:#345475; margin-top:20px;">Route</h3>
        <table style="border-collapse:collapse; font-family:sans-serif;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">From</td><td>${currentMarina || '—'}, ${currentCity || '—'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">To</td><td>${destMarina || '—'}, ${destCity || '—'}</td></tr>
        </table>

        <h3 style="color:#345475; margin-top:20px;">Schedule</h3>
        <table style="border-collapse:collapse; font-family:sans-serif;">
          ${schedule ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">When</td><td>${schedule}</td></tr>` : ''}
          ${deadline ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Deadline</td><td>${deadline}</td></tr>` : ''}
        </table>

        ${notes ? `
          <h3 style="color:#345475; margin-top:20px;">Notes</h3>
          <p>${notes.replace(/\n/g, '<br>')}</p>
        ` : ''}

        <hr style="margin:16px 0;">
        <p style="color:#888; font-size:12px;">Sent from briancline.co delivery inquiry form</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
