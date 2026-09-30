import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// In-memory OTP storage for direct OTP mode (expires in 10 minutes)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(email.toLowerCase().trim(), { code: otp, expiresAt });

    const gmailUser = process.env.GMAIL_USER || 'official.trojen@gmail.com';
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailPass) {
      // Send directly via Gmail SMTP from official.trojen@gmail.com
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FormFlow Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F1F5F5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(38, 59, 59, 0.08); border: 1px solid #E2E8F0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #263B3B 0%, #355353 50%, #4F7C7A 100%); padding: 36px 32px 30px 32px; text-align: center;">
              <!-- Brand Logo Icon -->
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="width: 48px; height: 48px; border-radius: 14px; background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-size: 24px; font-weight: 800; line-height: 48px; text-align: center;">
                    F
                  </td>
                </tr>
              </table>
              <div style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-top: 12px;">FormFlow</div>
              <div style="display: inline-block; margin-top: 8px; padding: 4px 14px; background: rgba(255, 255, 255, 0.16); border-radius: 20px; color: #E8F3F1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">
                Secure Identity Verification
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #1E293B; line-height: 1.3;">
                Your One-Time Passcode
              </h1>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello,<br>
                We received a request to verify your identity for your FormFlow account (<strong style="color: #1E293B;">${email}</strong>). Use the secure 6-digit code below to complete your authentication:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #F8FAFB; border: 2px solid #E2E8F0; border-radius: 16px; margin: 24px 0; text-align: center;">
                <tr>
                  <td style="padding: 26px 16px 22px 16px;">
                    <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
                      Verification Code
                    </div>
                    <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #263B3B; font-family: 'SF Mono', Monaco, Consolas, 'Liberation Mono', monospace; line-height: 1; padding-left: 12px; margin-bottom: 14px;">
                      ${otp}
                    </div>
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td style="background: #E8F3F1; border-radius: 20px; padding: 5px 14px; color: #4F7C7A; font-size: 12px; font-weight: 700;">
                          ⏱ Valid for 10 minutes &bull; Single-use only
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Information Grid -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px; line-height: 1.3;">🔒</td>
                        <td style="padding-left: 10px; font-size: 12.5px; line-height: 1.5; color: #475569;">
                          <strong style="color: #1E293B;">Security Reminder:</strong> Never share this code with anyone. FormFlow employees and automated systems will never request your verification code.
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="height: 10px;"></td>
                      </tr>
                      <tr>
                        <td width="24" valign="top" style="font-size: 16px; line-height: 1.3;">⚡</td>
                        <td style="padding-left: 10px; font-size: 12.5px; line-height: 1.5; color: #475569;">
                          <strong style="color: #1E293B;">Didn't request this?</strong> If you didn't attempt to sign up or log in, you can safely ignore this email. No changes have been made to your credentials.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="border-top: 1px solid #E2E8F0; margin: 24px 0 20px 0;"></div>

              <!-- Footer Signature -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 12px; line-height: 1.6; color: #94A3B8; text-align: center;">
                    Sent with security by <strong>FormFlow Identity Protection</strong><br>
                    Official dispatch: <a href="mailto:${gmailUser}" style="color: #4F7C7A; text-decoration: none; font-weight: 600;">${gmailUser}</a><br>
                    &copy; 2026 FormFlow &bull; SBIT Hackathon Track WEB-08 &bull; All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      await transporter.sendMail({
        from: `"FormFlow Security" <${gmailUser}>`,
        to: email,
        subject: `Your FormFlow Verification Code: ${otp}`,
        html: htmlContent,
      });

      return NextResponse.json({ success: true, message: 'OTP sent from official.trojen@gmail.com' });
    }

    // If GMAIL_APP_PASSWORD is not set yet in .env, indicate test mode or Supabase fallback
    return NextResponse.json({
      success: true,
      message: 'OTP generated. Configure GMAIL_APP_PASSWORD in .env for custom Gmail sender.',
      demoOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
