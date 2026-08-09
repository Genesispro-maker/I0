"use server"
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,  
    pass: process.env.SMTP_PASS,
  },
});

export async function Email(to: string, resetUrl: string): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return {
        success: false, 
        error: "Email service not configured"
    };
  }

  try {
    await transporter.sendMail({
      from: `"I/O" <genesispro502@gmail.com>`,
      to,
      subject: "Reset your password",
      text: `You requested a password reset. Reset Password: ${resetUrl}. This link expires in 1 hour.`,
      html: `
        <div style="background-color: #09090b; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%; text-align: center;">
          <div style="max-width: 480px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 4px; padding: 10px; text-align: left;">
            
            <p style="color: #fafafa; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 24px; line-height: 1.5;">
              You requested a password reset.
            </p>
            
            <div style="margin-bottom: 24px;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #fafafa; color: #09090b; font-size: 14px; font-weight: 500; text-decoration: none; padding: 5px 10px; border-radius: 6px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); transition: background-color 0.2s;">
                Reset Password
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #27272a; margin-top: 24px; margin-bottom: 24px;" />
    
            <p style="color: #a1a1aa; font-size: 13px; line-height: 1.6; margin: 0;">
              This link expires in 1 hour. If you didn't request this, please ignore this email safely.
            </p>
          </div>
        </div>`
    })

    return {
        success: true
    };
  } catch (err) {
    return {
        success: false, 
        error: "Failed to send email"
    };
  }
}