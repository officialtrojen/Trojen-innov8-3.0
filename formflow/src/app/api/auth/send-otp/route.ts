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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #4F7C7A, #52796F); color: #ffffff; font-weight: bold; font-size: 22px; line-height: 44px;">F</div>
            <h2 style="color: #263B3B; margin: 12px 0 4px 0; font-size: 22px;">Verification Code</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Use the 6-digit code below to sign in to FormFlow.</p>
          </div>
          
          <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4F7C7A; font-family: monospace;">${otp}</span>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">This code is valid for <strong>10 minutes</strong>. If you did not request this email, please safely ignore it.</p>
          
          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
          <div style="font-size: 12px; color: #94a3b8; text-align: center;">
            Sent by <strong>FormFlow Team</strong> &bull; <a href="mailto:${gmailUser}" style="color: #4F7C7A; text-decoration: none;">${gmailUser}</a>
          </div>
        </div>
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
