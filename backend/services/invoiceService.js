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
  return paise > 0 ? `${words} rupees and ${paise} paise only` : `${words} rupees only`;
};

const buildInvoiceDocument = (doc, order) => {
  const gold = "#D4A853";
  const black = "#111111";
  const gray = "#5B5B5B";
  const light = "#F7F4EE";
  const soft = "#FAFAF8";
  const line = "#E6DFD2";
  const white = "#FFFFFF";

  const invoiceNumber = safeValue(order._id, "- ");
  const customerName = safeValue(order.user?.name || order.customerName || "Customer", "Customer");
  const customerEmail = safeValue(order.user?.email || order.email || "-");
  const customerPhone = safeValue(order.phone || order.mobile || "-");
  const billingAddress = safeValue(order.address || "-");
  const paymentLabel = safeValue(order.paymentMethod, "-");
  const subtotal = Number(order.subtotal ?? order.totalPrice / 1.18 || 0);
  const gst = Number(order.gstAmount ?? order.totalPrice - subtotal || 0);
  const grandTotal = Number(order.totalPrice || 0);

  const headerHeight = 92;
  doc
    .rect(0, 0, 595, headerHeight)
    .fill(black);

  doc
    .fillColor(gold)
    .font("Helvetica-Bold")
    .fontSize(27)
    .text("NAYAMO", 42, 30);

  doc
    .fillColor("white")
    .font("Helvetica")
    .fontSize(10)
    .text("Premium Jewellery Store", 42, 63);

  doc
    .fillColor(white)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("TAX INVOICE", 430, 32);

  doc
    .fillColor("#E8E0D0")
    .font("Helvetica")
    .fontSize(9)
    .text("Invoice No.", 420, 60)
    .text("Date", 420, 74)
    .text("Payment", 420, 88);

  doc
    .fillColor(white)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(invoiceNumber, 485, 60)
    .text(formatDate(order.createdAt), 485, 74)
    .text(paymentLabel.toUpperCase(), 485, 88);

  const sellerY = 115;
  doc
    .roundedRect(40, sellerY, 255, 110, 8)
    .fillAndStroke(light, line);

  doc
    .fillColor(black)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Seller", 56, sellerY + 16)
    .font("Helvetica")
    .fontSize(10)
    .text("Nayamo Jewellery Pvt. Ltd.", 56, sellerY + 36)
    .text("Delhi, India", 56, sellerY + 52)
    .text("support@nayamo.in", 56, sellerY + 68)
    .text("+91 9718176159", 56, sellerY + 84)
    .text("GSTIN: 07TCRPS8655B1ZK", 56, sellerY + 100);

  doc
    .roundedRect(310, sellerY, 245, 110, 8)
    .fillAndStroke(light, line);

  doc
    .fillColor(black)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Bill To", 326, sellerY + 16)
    .font("Helvetica")
    .fontSize(10)
    .text(customerName, 326, sellerY + 36, { width: 200 })
    .text(customerEmail, 326, sellerY + 52, { width: 200 })
    .text(customerPhone, 326, sellerY + 68, { width: 200 })
    .text(billingAddress, 326, sellerY + 84, { width: 200 });

  const tableTop = 250;
  const tableWidth = 515;

  doc
    .roundedRect(40, tableTop, tableWidth, 26, 6)
    .fill(black);

  doc
    .fillColor(white)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Product", 52, tableTop + 8)
    .text("Qty", 310, tableTop + 8)
    .text("Price", 382, tableTop + 8)
    .text("Amount", 468, tableTop + 8);

  let y = tableTop + 35;
  order.items.forEach((item, index) => {
    const itemName = safeValue(item.product?.title || item.name || "Product", "Product");
    const itemQty = Number(item.quantity || 0);
    const itemPrice = Number(item.price || 0);
    const itemTotal = itemQty * itemPrice;

    if (index % 2 === 0) {
      doc.rect(40, y - 5, tableWidth, 30).fill(soft);
    }

    doc
      .fillColor(black)
      .font("Helvetica")
      .fontSize(10)
      .text(itemName, 52, y, { width: 230 })
      .text(String(itemQty), 315, y)
      .text(formatCurrency(itemPrice), 372, y)
      .text(formatCurrency(itemTotal), 455, y);

    y += 30;
  });

  const summaryY = y + 20;
  doc
    .roundedRect(330, summaryY, 225, 130, 10)
    .fillAndStroke(light, line);

  doc
    .fillColor(black)
    .font("Helvetica")
    .fontSize(10)
    .text("Subtotal", 350, summaryY + 18)
    .text(formatCurrency(subtotal), 475, summaryY + 18)
    .text("GST (18%)", 350, summaryY + 42)
    .text(formatCurrency(gst), 475, summaryY + 42);

  doc
    .moveTo(350, summaryY + 68)
    .lineTo(528, summaryY + 68)
    .strokeColor("#D5CAB6")
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Grand Total", 350, summaryY + 82)
    .text(formatCurrency(grandTotal), 455, summaryY + 82);

  const amountWordsY = summaryY + 150;
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(gray)
    .text("Amount in words", 42, amountWordsY)
    .font("Helvetica")
    .fillColor(black)
    .text(`${amountToWords(grandTotal)}`, 42, amountWordsY + 16, { width: 360 });

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(gray)
    .text("This is a computer-generated invoice and does not require a signature.", 40, 760, { align: "center", width: 515 });

  doc
    .moveTo(390, 710)
    .lineTo(525, 710)
    .strokeColor(gold)
    .stroke();

  doc
    .fillColor(black)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("Anshul", 430, 716);

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(gray)
    .text("Authorized Signature", 420, 732);

  doc
    .fontSize(11)
    .fillColor(gold)
    .text("Thank you for shopping with NAYAMO", 40, 780, { align: "center", width: 515 });
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
