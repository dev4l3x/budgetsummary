const nodemailer = require("nodemailer");

module.exports = () => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.PASSWORD,
    },
  });

  const service = {};

  service.sendEmail = (to, subject, body) => {
    const mail = {
      from: process.env.USER,
      to,
      subject,
      html: body,
    };

    return transport.sendMail(mail);
  };

  return service;
};
