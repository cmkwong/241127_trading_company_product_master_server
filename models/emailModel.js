import nodemailer from 'nodemailer';
import path from 'path';

import logger from '../utils/logger.js';
import {} from 'dotenv/config';

export const send = (subject, text, filenames = []) => {
  const attachmentPath = '../dev-data/compareReport/pdfs';
  const transport = {
    host: process.env.EMAIL_SERVER,
    port: process.env.EMAIL_SERVER_PORT,
    service: 'outlook',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PW,
    },
  };
  let options = {
    from: 'chris.cheung@apholdingshk.com',
    to: 'chris.cheung@apholdingshk.com',
    subject,
    text,
  };
  if (filenames.length > 0) {
    let attachments = [];
    for (let filename of filenames) {
      attachments.push({
        filename,
        path: path.join(__dirname, attachmentPath, filename),
        contentType: 'application/pdf',
      });
    }
    options['attachments'] = attachments;
  }
  const transporter = nodemailer.createTransport(transport);
  transporter.sendMail(options, (error, info) => {
    if (error) logger.error(error);
    else console.log(info);
  });
};

// exports.send = send;
