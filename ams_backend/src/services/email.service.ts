import appConfig from '@/config/app';
import {SendEmailCommand} from '@aws-sdk/client-ses';
import logger from "@/config/logger";
import {sesClient} from "@/lib/aws";

const sendEmail = async (to: string, subject: string, message: string): Promise<any> => {
  const params = {
    Destination: {
      ToAddresses: [to]
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: message
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: appConfig.email.from // The verified sender email address
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await sesClient.send(command);
    logger.info(`EMAIL: ${subject}`);
  } catch (err) {
    logger.error(`Error sending email: ${subject}`, err);
  }
};

const sendResetPasswordEmail = async (to: string, token: string): Promise<any> => {
  const subject = 'Reset password';
  const resetPasswordUrl = `${appConfig.appUrl}/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendVerificationEmail = async (to: string, token: string): Promise<any> => {
  const subject = 'Email Verification';
  const verificationEmailUrl = `${appConfig.appUrl}/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}`;
  await sendEmail(to, subject, text);
};

export default {
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail
};
