import nodemailer from "nodemailer"

type SendEmailOptions = {
    to: string
    subject: string
    text?: string
    html?: string
    from?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const smtpHost = process.env.SMTP_HOST || "smtp.example.com"
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587
    const smtpUser = process.env.SMTP_USER || ""
    const smtpPass = process.env.SMTP_PASS || ""
    const smtpSender = process.env.SMTP_SENDER || "noreply@klickbee.com"
    const smtpSecure = process.env.SMTP_SECURE === "true"

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
            tls: {
                rejectUnauthorized: false
            }
        })

        // Verify connection
        await transporter.verify()

        const info = await transporter.sendMail({
            from: options.from || `Klickbee CRM <${smtpSender}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        })

        console.log(`✅ Email sent to ${options.to}: ${info.messageId}`)

        return { success: true, messageId: info.messageId }
    } catch (error: unknown) {
        console.error('❌ Failed to send email:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return { success: false, error: errorMessage }
    }
}

// Send invitation email
export async function sendInvitationEmail(params: {
    to: string
    tenantName: string
    role: string
    inviteUrl: string
    inviterName?: string
}): Promise<{ success: boolean; error?: string }> {
    const { to, tenantName, role, inviteUrl, inviterName } = params

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're invited to join ${tenantName}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Klickbee CRM</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="color: #333; margin-top: 0;">You're Invited!</h2>
            
            <p style="color: #666; font-size: 16px;">
                ${inviterName ? `<strong>${inviterName}</strong> has invited you` : 'You have been invited'} to join 
                <strong>${tenantName}</strong> on Klickbee CRM.
            </p>
            
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #666;">
                    <strong>Role:</strong> 
                    <span style="background: #000; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase;">
                        ${role}
                    </span>
                </p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                Click the button below to accept your invitation and create your account:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${inviteUrl}" style="background: #000; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                    Accept Invitation
                </a>
            </div>
            
            <p style="color: #999; font-size: 13px; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteUrl}" style="color: #666; word-break: break-all;">${inviteUrl}</a>
            </p>
            
            <div style="border-top: 1px solid #e5e5e5; margin-top: 30px; padding-top: 20px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                    This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e5e5; border-top: none;">
            <p style="color: #999; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Klickbee CRM. All rights reserved.
            </p>
        </div>
    </body>
    </html>
    `

    const text = `
You're invited to join ${tenantName} on Klickbee CRM!

${inviterName ? inviterName + ' has invited you' : 'You have been invited'} to join ${tenantName} on Klickbee CRM.

Role: ${role}

Click the link below to accept your invitation and create your account:
${inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this invitation, please ignore this email.
    `

    const result = await sendEmail({
        to,
        subject: `You're invited to join ${tenantName} on Klickbee CRM`,
        text,
        html,
    })

    return result
}
