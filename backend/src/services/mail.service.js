const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendOverdueEmail = (toEmail, userName, taskTitle) => {
  return transporter.sendMail({
    from: `"Task Manager" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: `Overdue Task: "${taskTitle}"`,
    html: `
      <p>Hi ${userName},</p>
      <p>Your task <strong>"${taskTitle}"</strong> was not completed by its deadline.</p>
      <p>Please log in and update its status.</p>
    `,
  });
};
