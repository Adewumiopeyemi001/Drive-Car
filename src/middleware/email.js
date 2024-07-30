import nodemailer from 'nodemailer';
import CustomError from './customes.js';

const emailSenderTemplate = async (msg, subject, receiver) => {
  try {
    // Check if receiver is defined and is a string or array
    if (
      !receiver ||
      (typeof receiver !== 'string' && !Array.isArray(receiver))
    ) {
      throw new Error('Invalid recipient address');
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GOOGLE_USER,
      to: receiver,
      subject: subject,
      html: msg,
    };

    await transporter.sendMail(mailOptions);

    return `Message sent' `;
  } catch (err) {
    console.log(err);
    throw new CustomError(500, 'Server Error');
  }
};

export default emailSenderTemplate;
