const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass:process.env.SMTP_USER,
  },
});

const sendEmail = async ({to, subject, body})=>{
  const response = await transporter.sendEmail({
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html:body
  })
  return response

}

module.exports = sendEmail