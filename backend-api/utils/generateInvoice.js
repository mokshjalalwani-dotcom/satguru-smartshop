const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoice = (sale, productName) => {
    const invoicePath = path.join(__dirname, '../../invoices', `invoice_${sale.sale_id}.pdf`);
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(invoicePath));
    doc.fontSize(16).text('Satguru Electricals Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Invoice ID: ${sale.sale_id}`);
    doc.text(`Product: ${productName}`);
    doc.text(`Quantity: ${sale.quantity}`);
    doc.text(`Total: ₹${sale.total_price}`);
    doc.text(`Date: ${sale.timestamp}`);
    doc.end();

    return invoicePath;
};

module.exports = { generateInvoice };
