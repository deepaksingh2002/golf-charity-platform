const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Golf Charity Platform" <${process.env.EMAIL_FROM || 'noreply@golfcharity.com'}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Golf Charity Platform, ${user.name}!</h1>
    <p>Thank you for registering. You can now subscribe to support your selected charity and enter your scores for the upcoming draw.</p>
  `;
  await sendEmail({ email: user.email, subject: 'Welcome to Golf Charity Platform', html });
};

const sendDrawResultEmail = async (user, drawResults, userMatch) => {
  const won = userMatch > 0;
  const html = `
    <h1>Draw Results for ${drawResults.month}</h1>
    <p>The winning numbers are: <strong>${drawResults.drawnNumbers.join(', ')}</strong></p>
    <p>You matched <strong>${userMatch}</strong> numbers.</p>
    ${won ? '<p>Congratulations! You are a winner in this tier. Please log in to your dashboard to claim your prize.</p>' : '<p>Better luck next month!</p>'}
  `;
  await sendEmail({ email: user.email, subject: `Draw Results: ${drawResults.month}`, html });
};

const sendWinnerVerificationEmail = async (user, prize) => {
  const html = `
    <h1>Congratulations ${user.name}!</h1>
    <p>You have won <strong>$${prize}</strong> in the latest draw.</p>
    <p>To claim your payout, please log in to your dashboard and upload your proof of identity. Once verified, we will process your payment.</p>
  `;
  await sendEmail({ email: user.email, subject: 'Action Required: Claim Your Prize', html });
};

const sendPaymentConfirmationEmail = async (user, amount) => {
  const html = `
    <h1>Payment Confirmation</h1>
    <p>Hi ${user.name}, your payout of <strong>$${amount}</strong> has been processed successfully.</p>
    <p>Thank you for supporting your charity!</p>
  `;
  await sendEmail({ email: user.email, subject: 'Prize Payment Processed', html });
};

module.exports = {
  sendWelcomeEmail,
  sendDrawResultEmail,
  sendWinnerVerificationEmail,
  sendPaymentConfirmationEmail
};
