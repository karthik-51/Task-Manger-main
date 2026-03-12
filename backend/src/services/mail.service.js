const nodemailer = require("nodemailer");
const logger = require("../config/logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendOverdueEmail = async (toEmail, userName, taskTitle) => {
  logger.info("Mail service: sending overdue email", { toEmail, taskTitle });
  try {
    const result = await transporter.sendMail({
      from: `"Task Manager" <${process.env.MAIL_USER}>`,
      to: toEmail,
      subject: `Overdue Task: "${taskTitle}"`,
      html: `
      <p>Hi ${userName},</p>
      <p>Your task <strong>"${taskTitle}"</strong> was not completed by its deadline.</p>
      <p>Please log in and update its status.</p>
    `,
    });
    logger.info("Mail service: email sent", { toEmail, taskTitle, messageId: result.messageId });
    return result;
  } catch (err) {
    logger.error("Mail service: failed to send email", err);
    throw err;
  }
};
