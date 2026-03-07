import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, marina, dockSlip, boatName, boatLength, services, notes,
    anythingElse, boatType, beam, estimateTotal, estimateLineItems } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const servicesList = services || 'None specified';

  try {
    await resend.emails.send({
      from: 'Brian Cline <detailing@sailorskills.com>',
      to: 'standardhuman@gmail.com',
      replyTo: email,
      subject: `Detailing Estimate Request — ${name}${boatName ? ` (${boatName})` : ''}${estimateTotal ? ` — $${estimateTotal}` : ''}`,
      text: [
        `Detailing Estimate Request`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        marina ? `Marina: ${marina}` : null,
        dockSlip ? `Dock/Slip: ${dockSlip}` : null,
        boatName ? `Boat: ${boatName}` : null,
        boatLength ? `Length: ${boatLength} ft` : null,
        beam ? `Beam: ${beam} ft` : null,
        boatType ? `Type: ${boatType}` : null,
        ``,
        `Services: ${servicesList}`,
        estimateTotal ? `\nCalculator Estimate: $${estimateTotal}` : null,
        estimateLineItems ? `Breakdown: ${estimateLineItems}` : null,
        anythingElse ? `\nAdditional Services Requested:\n${anythingElse}` : null,
        notes ? `\nNotes:\n${notes}` : null,
      ].filter(Boolean).join('\n'),
      html: `
        <h2>Detailing Estimate Request</h2>
        <table style="border-collapse:collapse; font-family:sans-serif;">
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          ${phone ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Phone</td><td>${phone}</td></tr>` : ''}
          ${marina ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Marina</td><td>${marina}</td></tr>` : ''}
          ${dockSlip ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Dock/Slip</td><td>${dockSlip}</td></tr>` : ''}
          ${boatName ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Boat</td><td>${boatName}</td></tr>` : ''}
          ${boatLength ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Length</td><td>${boatLength} ft</td></tr>` : ''}
          ${beam ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Beam</td><td>${beam} ft</td></tr>` : ''}
          ${boatType ? `<tr><td style="padding:4px 12px 4px 0; font-weight:bold;">Type</td><td>${boatType === 'sail' ? 'Sailboat' : 'Powerboat'}</td></tr>` : ''}
        </table>
        <hr style="margin:16px 0;">
        <p><strong>Services:</strong> ${servicesList}</p>
        ${estimateTotal ? `
          <div style="margin:16px 0; padding:12px; background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px;">
            <p style="margin:0; font-weight:bold; color:#0369a1;">Calculator Estimate: $${estimateTotal}</p>
            ${estimateLineItems ? `<p style="margin:4px 0 0; font-size:13px; color:#4b5563;">${estimateLineItems}</p>` : ''}
          </div>
        ` : ''}
        ${anythingElse ? `<p><strong>Additional Services Requested:</strong></p><p>${anythingElse.replace(/\n/g, '<br>')}</p>` : ''}
        ${notes ? `<p><strong>Notes:</strong></p><p>${notes.replace(/\n/g, '<br>')}</p>` : ''}
        <hr style="margin:16px 0;">
        <p style="color:#888; font-size:12px;">Sent from briancline.co detailing estimate form</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
