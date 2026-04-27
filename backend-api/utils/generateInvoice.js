const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const INVOICES_DIR = path.join(__dirname, '../../invoices');

/**
 * Generate a professional PDF invoice for a sale.
 * Supports multi-item carts.
 * @returns {string} Absolute path to the generated PDF.
 */
const generateInvoice = (sale) => {
    if (!fs.existsSync(INVOICES_DIR)) {
        fs.mkdirSync(INVOICES_DIR, { recursive: true });
    }

    const invoicePath = path.join(INVOICES_DIR, `invoice_${sale.sale_id}.pdf`);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(invoicePath);
    doc.pipe(stream);

    // ── Color palette ──────────────────────────────────────────────
    const ACCENT = '#F5A623';
    const DARK   = '#1A1A2E';
    const GREY   = '#6B7280';
    const LIGHT  = '#F9FAFB';

    // ── Header background band ─────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 120).fill(DARK);

    // Company name
    doc.fontSize(26).font('Helvetica-Bold').fillColor(ACCENT)
       .text('SATGURU ELECTRICALS', 50, 35);
    doc.fontSize(10).font('Helvetica').fillColor('#AAAAAA')
       .text('Your Trusted Electronics Partner', 50, 65);
    doc.fontSize(9).fillColor('#AAAAAA')
       .text('📍 Satguru SmartShop • GST: 27XXXXX1234X1ZX', 50, 82);

    // Invoice label (top-right)
    doc.fontSize(22).font('Helvetica-Bold').fillColor('#FFFFFF')
       .text('INVOICE', 370, 35, { width: 175, align: 'right' });
    doc.fontSize(10).font('Helvetica').fillColor(ACCENT)
       .text(`# ${sale.sale_id}`, 370, 62, { width: 175, align: 'right' });
    doc.fontSize(9).fillColor('#AAAAAA')
       .text(new Date(sale.timestamp).toLocaleString('en-IN', {
           day: '2-digit', month: 'short', year: 'numeric',
           hour: '2-digit', minute: '2-digit'
       }), 370, 80, { width: 175, align: 'right' });

    // ── Bill-to section ────────────────────────────────────────────
    doc.rect(50, 135, 250, 75).fill(LIGHT).stroke('#E5E7EB');
    doc.fontSize(8).font('Helvetica-Bold').fillColor(GREY)
       .text('BILL TO', 62, 147);
    doc.fontSize(13).font('Helvetica-Bold').fillColor(DARK)
       .text(sale.customer || 'Walk-in Customer', 62, 160);
    doc.fontSize(9).font('Helvetica').fillColor(GREY)
       .text(`Payment: ${sale.payment_method || 'Cash'}`, 62, 180);
    doc.fontSize(9).fillColor(GREY)
       .text(`Date: ${new Date(sale.timestamp).toLocaleDateString('en-IN')}`, 62, 193);

    // ── Items table ────────────────────────────────────────────────
    const tableTop = 230;
    const col = { item: 50, desc: 80, qty: 320, unit: 375, total: 455 };

    // Table header
    doc.rect(50, tableTop, 495, 24).fill(DARK);
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
    doc.text('#',           col.item, tableTop + 7);
    doc.text('PRODUCT',     col.desc,  tableTop + 7);
    doc.text('QTY',         col.qty,   tableTop + 7, { width: 50, align: 'center' });
    doc.text('UNIT PRICE',  col.unit,  tableTop + 7, { width: 70, align: 'right' });
    doc.text('TOTAL',       col.total, tableTop + 7, { width: 60, align: 'right' });

    // Rows
    let rowY = tableTop + 30;
    const items = sale.items || [];

    items.forEach((item, idx) => {
        const rowBg = idx % 2 === 0 ? '#FFFFFF' : LIGHT;
        doc.rect(50, rowY - 5, 495, 26).fill(rowBg).stroke('#E5E7EB');

        doc.fontSize(9).font('Helvetica').fillColor(DARK);
        doc.text(String(idx + 1),                            col.item, rowY, { width: 25 });
        doc.text(item.product_name,                          col.desc,  rowY, { width: 230 });
        doc.text(String(item.quantity),                      col.qty,   rowY, { width: 50, align: 'center' });
        doc.text(`₹${item.unit_price.toLocaleString('en-IN')}`, col.unit, rowY, { width: 70, align: 'right' });
        doc.text(`₹${item.line_total.toLocaleString('en-IN')}`,  col.total, rowY, { width: 60, align: 'right' });

        rowY += 26;
    });

    // ── Totals section ─────────────────────────────────────────────
    rowY += 10;
    const totalsX = 350;

    const drawTotalRow = (label, value, bold = false, color = DARK) => {
        doc.fontSize(bold ? 11 : 9).font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(GREY).text(label, totalsX, rowY, { width: 100 });
        doc.fontSize(bold ? 11 : 9).font(bold ? 'Helvetica-Bold' : 'Helvetica')
           .fillColor(color).text(value, totalsX + 100, rowY, { width: 90, align: 'right' });
        rowY += bold ? 20 : 16;
    };

    doc.moveTo(50, rowY - 5).lineTo(545, rowY - 5).stroke('#E5E7EB');
    drawTotalRow('Subtotal',               `₹${sale.subtotal.toLocaleString('en-IN')}`);
    drawTotalRow(`GST (${sale.gst_rate || 18}%)`, `₹${sale.gst_amount.toLocaleString('en-IN')}`);

    // Total highlight band
    doc.rect(totalsX - 5, rowY - 5, 200, 30).fill(ACCENT);
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#000000')
       .text('TOTAL DUE',              totalsX, rowY + 3, { width: 100 });
    doc.text(`₹${sale.total_price.toLocaleString('en-IN')}`, totalsX + 100, rowY + 3, { width: 90, align: 'right' });
    rowY += 40;

    // ── Footer ─────────────────────────────────────────────────────
    const footerY = doc.page.height - 80;
    doc.moveTo(50, footerY).lineTo(545, footerY).stroke('#E5E7EB');
    doc.fontSize(9).font('Helvetica').fillColor(GREY)
       .text('Thank you for shopping at Satguru Electricals!', 50, footerY + 12, { align: 'center', width: 495 });
    doc.fontSize(8).fillColor('#AAAAAA')
       .text('This is a computer-generated invoice. No signature required.', 50, footerY + 28, { align: 'center', width: 495 });
    doc.fontSize(8).fillColor(ACCENT)
       .text(`Invoice ID: ${sale.sale_id}`, 50, footerY + 44, { align: 'center', width: 495 });

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(invoicePath));
        stream.on('error', reject);
    });
};

module.exports = { generateInvoice };
