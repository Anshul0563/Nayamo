const PDFDocument = require("pdfkit");

const buildInvoiceDocument = (doc, order) => {
  const gold = "#D4A853";
  const black = "#111111";
  const gray = "#666666";
  const light = "#F5F5F5";

  doc
    .rect(0, 0, 700, 110)
    .fill(black);

  doc
    .fillColor(gold)
    .fontSize(30)
    .font("Helvetica-Bold")
    .text("NAYAMO", 40, 35);

  doc
    .fillColor("white")
    .fontSize(12)
    .font("Helvetica")
    .text("Premium Jewellery Store", 40, 72);

  doc
    .fillColor(black)
    .fontSize(11)
    .font("Helvetica")
    .text("Nayamo Jewellery Pvt. Ltd.", 40, 130)
    .text("Delhi, India", 40, 148)
    .text("support@nayamo.in", 40, 166)
    .text("+91 9718176159", 40, 184)
    .text("GSTIN: 07TCRPS8655B1ZK", 40, 202);

  doc
    .roundedRect(360, 130, 190, 110, 10)
    .fillAndStroke(light, "#DDDDDD");

  doc
    .fillColor(black)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("TAX INVOICE", 385, 145);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`Invoice #: ${order._id}`, 375, 178)
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 375, 195)
    .text(`Payment: ${order.paymentMethod}`, 375, 212);

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(black)
    .text("Bill To", 40, 270);

  doc
    .font("Helvetica")
    .fontSize(11)
    .text(order.user?.name || "Customer", 40, 295)
    .text(order.user?.email || "-", 40, 312)
    .text(order.phone || "-", 40, 329)
    .text(order.address || "-", 40, 346, { width: 250 });

  const tableTop = 430;

  doc
    .rect(40, tableTop, 515, 30)
    .fill(black);

  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Product", 50, tableTop + 10)
    .text("Qty", 300, tableTop + 10)
    .text("Price", 360, tableTop + 10)
    .text("Total", 470, tableTop + 10);

  let y = tableTop + 40;

  order.items.forEach((item, index) => {
    const itemTotal = item.quantity * item.price;

    if (index % 2 === 0) {
      doc.rect(40, y - 5, 515, 30).fill("#FAFAFA");
    }

    doc
      .fillColor(black)
      .font("Helvetica")
      .fontSize(10)
      .text(item.product?.title || "Product", 50, y, { width: 220 })
      .text(item.quantity.toString(), 305, y)
      .text(`₹${item.price}`, 355, y)
      .text(`₹${itemTotal}`, 470, y);

    y += 35;
  });

  const subtotal = order.totalPrice / 1.18;
  const gst = order.totalPrice - subtotal;
  const summaryY = y + 20;

  doc
    .roundedRect(330, summaryY, 225, 120, 10)
    .fillAndStroke(light, "#DDDDDD");

  doc
    .fillColor(black)
    .font("Helvetica")
    .fontSize(11)
    .text("Subtotal:", 350, summaryY + 20)
    .text(`₹${subtotal.toFixed(2)}`, 470, summaryY + 20)
    .text("GST (18%):", 350, summaryY + 45)
    .text(`₹${gst.toFixed(2)}`, 470, summaryY + 45);

  doc
    .moveTo(350, summaryY + 75)
    .lineTo(530, summaryY + 75)
    .strokeColor("#CCCCCC")
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("Grand Total:", 350, summaryY + 90)
    .text(`₹${order.totalPrice}`, 455, summaryY + 90);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(gray)
    .text("This is a computer-generated invoice and does not require a signature.", 40, 740, { align: "center", width: 520 });

  doc
    .fontSize(11)
    .fillColor(gold)
    .text("Thank you for shopping with Nayamo ❤️", 40, 765, { align: "center", width: 520 });
};

exports.generateInvoiceBuffer = (order) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    buildInvoiceDocument(doc, order);
    doc.end();
  });

exports.generateInvoice = (order, res) => {
  try {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${order._id}.pdf`,
    });

    doc.pipe(res);
    buildInvoiceDocument(doc, order);
    doc.end();
  } catch (err) {
    console.error("[INVOICE ERROR]", err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Invoice generation failed",
      });
    }
  }
};
