const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    // port: 587,
    // secureConnection: false,
    secure: true,
    auth: {
      user: process.env.MAIL_ID,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  let info = await transporter.sendMail({
    from: "Sophis' Dev",
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  });

  console.log("Message Sent: ", info.messageId);
  console.log("Preview Url: ", nodemailer.getTestMessageUrl(info));
});

module.exports = sendEmail;
