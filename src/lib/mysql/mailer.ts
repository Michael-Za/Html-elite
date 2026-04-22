import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.elitepartnersus.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface Applicant {
  full_name: string;
  email: string;
  whatsapp?: string;
  city?: string;
  field?: string;
  expertise_level?: string;
}

export async function notifyNewApplication(applicant: Applicant) {
  try {
    await transporter.sendMail({
      from: '"Elite Partners CRM" <admin@elite.com>',
      to: 'admin@elite.com',
      subject: `New Career Application — ${applicant.full_name}`,
      html: `
        <h2>🎯 New Application Received</h2>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><b>Name</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${applicant.full_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><b>Email</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${applicant.email}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><b>WhatsApp</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${applicant.whatsapp || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><b>Field</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${applicant.field || '—'}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><b>City</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${applicant.city || '—'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><b>Expertise</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${applicant.expertise_level || '—'}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="https://crm.elitepartnersus.com/hiring" style="background: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View in CRM →
          </a>
        </p>
      `,
    });
    console.log('✅ Notification email sent');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send notification email:', error);
    return { success: false, error };
  }
}
