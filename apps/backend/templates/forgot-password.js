const forgotPasswordHTML = (resetUrl) => `
  <h1>Password Reset Request</h1>
  <p>You requested a password reset. Please click the link below to reset your credentials. This link is valid for 15 minutes.</p>
  <a href="${resetUrl}" style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
  <p>If you did not request this, please ignore this email.</p>
`;

module.exports = forgotPasswordHTML;
