let nodemailer;
let emailServiceAvailable = false;

try {
  nodemailer = (await import('nodemailer')).default;
  emailServiceAvailable = true;
} catch (err) {
  console.warn('⚠️  Nodemailer not installed. Email features will be disabled.');
  console.warn('📦 To enable email, run: npm install nodemailer');
}

let transporter;

async function initializeEmailService() {
  if (!emailServiceAvailable) return;

  try {
    // Development: Create Ethereal test account
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('✓ Email service initialized with Ethereal (test mode)');
    } else {
      // Production: Use environment variables for real email service
      transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      console.log('✓ Email service initialized with real email provider');
    }
  } catch (err) {
    console.error('Failed to initialize email service:', err.message);
  }
}

export async function sendPaymentReminder(toEmail, tenantName, amount, tone) {
  if (!emailServiceAvailable) {
    console.warn('Email service not available. Install nodemailer to send emails.');
    return { success: false, error: 'Email service not configured' };
  }

  if (!transporter) {
    await initializeEmailService();
  }

  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  let subject, htmlContent;

  switch (tone) {
    case 'Friendly':
      subject = `Friendly Reminder: Invoice Payment Due - ${amount} XAF`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2D6A4F;">Payment Reminder</h2>
          <p>Hi ${tenantName},</p>
          <p>This is a friendly reminder that your ShopEase invoice of <strong>${amount} XAF</strong> is due.</p>
          <p>Please process this payment at your earliest convenience to ensure uninterrupted service.</p>
          <p>If you've already made this payment, please disregard this message.</p>
          <br/>
          <p>Thank you for your business!</p>
          <p>Best regards,<br/><strong>ShopEase Platform Team</strong></p>
        </div>
      `;
      break;

    case 'Firm':
      subject = `Payment Reminder: Invoice Overdue - ${amount} XAF`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #D35327;">Payment Reminder</h2>
          <p>Dear ${tenantName},</p>
          <p>This is a formal reminder that your ShopEase invoice of <strong>${amount} XAF</strong> is now overdue.</p>
          <p>Please settle this payment as soon as possible to avoid any service interruptions.</p>
          <p>If payment has already been made, please disregard this notice and contact our support team.</p>
          <br/>
          <p>Thank you,<br/><strong>ShopEase Platform Team</strong></p>
        </div>
      `;
      break;

    case 'Final notice':
      subject = `URGENT: Invoice Payment Required - ${amount} XAF`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DC2626; font-weight: bold;">⚠️ URGENT: Payment Required</h2>
          <p>Dear ${tenantName},</p>
          <p><strong style="color: #DC2626;">URGENT:</strong> Your invoice of <strong>${amount} XAF</strong> is now significantly overdue.</p>
          <p>Failure to process this payment immediately may result in suspension of your ShopEase services.</p>
          <p><strong>Please process payment immediately</strong> to prevent service interruption.</p>
          <p>If you have any questions or need assistance, please contact our support team urgently.</p>
          <br/>
          <p>Best regards,<br/><strong>ShopEase Platform Team</strong></p>
        </div>
      `;
      break;

    default:
      subject = `Invoice Payment Reminder - ${amount} XAF`;
      htmlContent = `<p>Invoice amount: ${amount} XAF</p>`;
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@shopease.com',
      to: toEmail,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment reminder email sent:', info);
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Error sending payment reminder:', err);
    throw err;
  }
}

export async function sendPasswordResetEmail(toEmail, resetLink, adminName) {
  if (!emailServiceAvailable) {
    console.warn('Email service not available. Install nodemailer to send emails.');
    return { success: false, error: 'Email service not configured' };
  }

  if (!transporter) {
    await initializeEmailService();
  }

  if (!transporter) {
    throw new Error('Email transporter not initialized');
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2D6A4F;">Password Reset Request</h2>
      <p>Hi ${adminName},</p>
      <p>You requested a password reset for your ShopEase admin account.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="background-color: #D35327; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/><strong>ShopEase Platform Team</strong></p>
    </div>
  `;

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@shopease.com',
      to: toEmail,
      subject: 'ShopEase Admin - Password Reset Request',
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info);
    if (process.env.NODE_ENV !== 'production' && info.messageId) {
      console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('Error sending password reset email:', err);
    throw err;
  }
}

// Initialize on module load
initializeEmailService();

export default { sendPaymentReminder, sendPasswordResetEmail };
