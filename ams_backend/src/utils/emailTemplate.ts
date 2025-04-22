export const generateUserWelcomeEmail = (
  userName: string,
  email: string,
  password: string
): string => {
  return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
        <h2>Hi ${userName},</h2>
  
        <p>Welcome to our platform! Your account has been created successfully.</p>
  
        <h3>Your login credentials:</h3>
        <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
  
        <p style="margin-top: 20px;"><strong>Please keep this information safe and confidential.</strong></p>
        <p>It is recommended that you change your password after your first login.</p>
  
        <p style="margin-top: 30px;">Thank you,<br/>The Team</p>
      </div>
    `;
};

export const generateUserEmailUpdateNotification = (
  userName: string,
  newEmail: string,
  password: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
      <h2>Hello ${userName},</h2>

      <p>We would like to inform you that your email address has been successfully updated.</p>

      <h3>Your new email address:</h3>
      <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <p><strong>Email:</strong> ${newEmail}</p>
      </div>

      <h3>Your new login password:</h3>
      <div style="background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <p><strong>Password:</strong> ${password}</p>
      </div>

      <p style="margin-top: 20px;"><strong>If you did not make this change, please contact us immediately.</strong></p>
      <p>You can change your password anytime from your account settings.</p>

      <p style="margin-top: 30px;">Thank you,<br/>The Team</p>
    </div>
  `;
};
