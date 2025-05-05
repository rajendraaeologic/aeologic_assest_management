import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

const sendEmail = async (
  to: string,
  subject: string,
  text: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: text,
  };
  console.log("Sending email with options:", mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error: any) {
    console.error("Email send error:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};

export { sendEmail };
