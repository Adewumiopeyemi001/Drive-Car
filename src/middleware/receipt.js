// const PDFDocument = require('pdfkit');
// const fs = require('fs');
import PDFDocument from 'pdfkit';
import fs from 'fs';

export const createReceiptPDF = (data) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('receipt.pdf'));

  // Add user info
  doc.text(`User: ${data.user.email}`);

  // Add car info
  doc.text(`Car: ${data.car.model}`);

  // Add booking info
  doc.text(`Booking Dates: ${data.booking.start} to ${data.booking.end}`);

  // Add payment info
  doc.text(`Amount Paid: ${data.payment.totalAmount}`);

  doc.end();
}
