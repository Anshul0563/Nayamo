const PDFDocument = require("pdfkit");

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safeValue = (value, fallback = "-") => (value !== undefined && value !== null && value !== "" ? value : fallback);

const amountToWords = (value) => {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount)) return "Zero";

  const whole = Math.floor(amount);
  const paise = Math.round((amount - whole) * 100);

  const ones = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
  const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  const convertUnderHundred = (num) => {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    return `${tens[Math.floor(num / 10)]}${num % 10 ? ` ${ones[num % 10]}` : ""}`;
  };

  const convertUnderThousand = (num) => {
    if (num < 100) return convertUnderHundred(num);
    const rem = num % 100;
    const prefix = ones[Math.floor(num / 100)];
    return rem ? `${prefix} hundred ${convertUnderHundred(rem)}` : `${prefix} hundred`;
  };

  const convert = (num) => {
    if (num < 1000) return convertUnderThousand(num);
    if (num < 100000) {
      const thousand = Math.floor(num / 1000);
      const rem = num % 1000;
      return rem ? `${convertUnderThousand(thousand)} thousand ${convertUnderThousand(rem)}` : `${convertUnderThousand(thousand)} thousand`;
    }
    if (num < 10000000) {
      const lakh = Math.floor(num / 100000);
      const rem = num % 100000;
      return rem ? `${convertUnderThousand(lakh)} lakh ${convert(rem)}` : `${convertUnderThousand(lakh)} lakh`;
    }

    const crore = Math.floor(num / 10000000);
    const rem = num % 10000000;
    return rem ? `${convertUnderThousand(crore)} crore ${convert(rem)}` : `${convertUnderThousand(crore)} crore`;
  };

  const words = convert(whole).replace(/\s+/g, " ").trim();
  const finalWords = words.charAt(0).toUpperCase() + words.slice(1);
  return paise > 0 ? `${finalWords} Rupees and ${paise} Paise Only` : `${finalWords} Rupees Only`;
};

const buildInvoiceDocument = (doc, order) => {
  const cream = "#F6F3EE";
  const paper = "#F8F6F2";
  const ink = "#1A1A1A";
  const softInk = "#464646";
  const gold = "#CC9A3E";
  const line = "#D7D0C4";
  const tableHead = "#EDE8E0";
  const rowAlt = "#F3F0EA";
  const white = "#FFFFFF";

  const invoiceNumber = safeValue(order._id, "-");
  const customerName = safeValue(order.user?.name || order.customerName || "Customer", "Customer");
  const customerEmail = safeValue(order.user?.email || order.email || "-");
  const customerPhone = safeValue(order.phone || order.mobile || "-");
  const billingAddress = safeValue(order.address || "-");
  const paymentLabel = safeValue(order.paymentMethod, "-");

  const subtotalValue =
    order.subtotal !== undefined && order.subtotal !== null ? Number(order.subtotal) : Number(order.totalPrice / 1.18 || 0);
  const gstValue =
    order.gstAmount !== undefined && order.gstAmount !== null ? Number(order.gstAmount) : Number(order.totalPrice - subtotalValue || 0);
  const subtotal = subtotalValue;
  const gst = gstValue;
  const grandTotal = Number(order.totalPrice || 0);

  doc.rect(0, 0, 595, 842).fill(paper);

  doc.fillColor(white).font("Helvetica-Bold").fontSize(70).text("NAYAMO", 40, 28);
  doc.fillColor(ink).font("Helvetica").fontSize(18).text("Artificial Jewellery", 42, 98);

  doc.moveTo(42, 122).lineTo(240, 122).strokeColor(gold).stroke();
  doc.fillColor(gold).font("Helvetica-Bold").fontSize(18).text("✦", 247, 111);
  doc.moveTo(255, 122).lineTo(330, 122).strokeColor(gold).stroke();

  doc.fillColor(ink).font("Helvetica-Bold").fontSize(27).text("TAX INVOICE", 390, 36);

  const invoiceDetailX = 380;
  doc.fillColor(softInk).font("Helvetica").fontSize(12).text("Invoice No.", invoiceDetailX, 82).text("Invoice Date", invoiceDetailX, 106).text("Order No.", invoiceDetailX, 130).text("Order Date", invoiceDetailX, 154);

  doc.fillColor(ink).font("Helvetica-Bold").fontSize(12).text(invoiceNumber, 500, 82).text(formatDate(order.createdAt), 500, 106).text(safeValue(order.orderNumber || order.orderId || "-", "-"), 500, 130).text(formatDate(order.createdAt), 500, 154);

  doc.moveTo(42, 180).lineTo(553, 180).strokeColor(line).stroke();

  const leftColX = 42;
  const rightColX = 330;
  const sectionY = 196;

  doc.fillColor(ink).font("Helvetica-Bold").fontSize(15).text("Sold By :", leftColX, sectionY);
  doc.fillColor(softInk).font("Helvetica").fontSize(12).text("Nayamo", leftColX, sectionY + 28).text("Roshan vihar, Najafgarh,", leftColX, sectionY + 48).text("New Delhi, 110043", leftColX, sectionY + 66).text("India", leftColX, sectionY + 84).text("GSTIN : 07TCRPS8655B1ZK", leftColX, sectionY + 108);

  doc.fillColor(ink).font("Helvetica-Bold").fontSize(15).text("Bill To :", rightColX, sectionY);
  doc.fillColor(softInk).font("Helvetica").fontSize(12).text(customerName, rightColX, sectionY + 28).text(billingAddress, rightColX, sectionY + 48).text(customerPhone, rightColX, sectionY + 84);

  const tableTop = 332;
  const tableWidth = 515;
  const cellHeight = 34;

  doc.roundedRect(40, tableTop, tableWidth, cellHeight, 0).fill(tableHead);
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(10).text("S.No.", 52, tableTop + 10).text("Product", 110, tableTop + 10).text("HSN", 338, tableTop + 10).text("Qty", 396, tableTop + 10).text("Unit Price", 436, tableTop + 10).text("Tax", 490, tableTop + 10).text("Amount", 520, tableTop + 10);

  let currentY = tableTop + cellHeight;
  order.items.forEach((item, index) => {
    const itemName = safeValue(item.product?.title || item.name || "Product", "Product");
    const itemQty = Number(item.quantity || 0);
    const itemPrice = Number(item.price || 0);
    const itemTotal = itemQty * itemPrice;
    const taxAmount = Number(item.taxAmount || (itemTotal * 0.18) || 0);

    if (index % 2 === 0) {
      doc.rect(40, currentY, tableWidth, cellHeight).fill(rowAlt);
    }

    doc.fillColor(ink).font("Helvetica").fontSize(10).text(String(index + 1), 52, currentY + 10).text(itemName, 110, currentY + 10, { width: 200 }).text(String(item.product?.hsn || item.hsn || "7117"), 338, currentY + 10).text(String(itemQty), 405, currentY + 10).text(formatCurrency(itemPrice), 432, currentY + 10).text(`${formatCurrency(taxAmount)}\n(18%)`, 488, currentY + 8, { width: 70 }).text(formatCurrency(itemTotal), 520, currentY + 10);

    currentY += cellHeight;
  });

  doc.rect(40, currentY, tableWidth, cellHeight).fill(white).stroke(line);
  doc.fillColor(ink).font("Helvetica").fontSize(11).text("Total Items: " + String(order.items?.length || 0), 44, currentY + 10);
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(10).text("Sub Total", 410, currentY + 10).text(formatCurrency(subtotal), 510, currentY + 10);

  currentY += cellHeight;
  doc.rect(40, currentY, tableWidth, cellHeight).fill(white).stroke(line);
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(10).text("Total Tax (18%)", 410, currentY + 10).text(formatCurrency(gst), 510, currentY + 10);

  currentY += cellHeight;
  doc.rect(40, currentY, tableWidth, cellHeight).fill(white).stroke(line);
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(10).text("Shipping Charges", 410, currentY + 10).text("₹ 0.00", 510, currentY + 10);

  currentY += cellHeight;
  doc.rect(40, currentY, tableWidth, cellHeight).fill(white).stroke(line);
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(11).text("Order Total", 410, currentY + 10).text(formatCurrency(grandTotal), 500, currentY + 10);

  doc.fillColor(ink).font("Helvetica-Bold").fontSize(11).text("Amount in Words:", 42, currentY + 48);
  doc.fillColor(softInk).font("Helvetica").fontSize(12).text(amountToWords(grandTotal), 42, currentY + 68, { width: 350 });

  doc.fillColor(softInk).font("Helvetica").fontSize(10).text("Thank you for shopping with Nayamo.", 42, 760).text("We hope you love your purchase!", 42, 775);

  doc.moveTo(385, 700).lineTo(528, 700).strokeColor(gold).stroke();
  doc.fillColor(ink).font("Helvetica-Bold").fontSize(18).text("Anshul", 430, 705);
  doc.fillColor(softInk).font("Helvetica").fontSize(10).text("Authorized Signature", 430, 724);

  doc.fillColor(ink).font("Helvetica").fontSize(12).text("☎ +91 99773951349", 42, 812); 
  doc.fillColor(ink).font("Helvetica").fontSize(12).text("✉ support@nayamo.in", 212, 812);
  doc.fillColor(ink).font("Helvetica").fontSize(12).text("◌ www.nayamo.in", 420, 812);
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
