const PDFDocument = require("pdfkit");

/* =========================================================
   NAYAMO - PROFESSIONAL E-COMMERCE TAX INVOICE
   PDFKit / A4
   ========================================================= */

/* -----------------------------
   BRAND / BUSINESS INFORMATION
------------------------------ */

const BUSINESS = {
  name: "NAYAMO",
  legalName: "Nayamo",
  category: "Artificial Jewellery",
  address: "Roshan Vihar, Najafgarh, New Delhi, 110043",
  country: "India",
  gstin: "07TCRPS8655B1ZK",
  phone: "+91 9773951349",
  website: "nayamo.in",
  email: "support@nayamo.in",
  signatory: "Anshul",
};

/* -----------------------------
   COLORS
------------------------------ */

const COLORS = {
  white: "#FFFFFF",
  paper: "#FFFFFF",
  ink: "#171717",
  softInk: "#555555",
  muted: "#777777",
  line: "#D9D9D9",
  lightLine: "#EAEAEA",
  tableHead: "#F5F5F5",
  rowAlt: "#FAFAFA",
  gold: "#B88A2D",
  totalBg: "#F7F7F7",
};

/* -----------------------------
   PAGE
------------------------------ */

const PAGE = {
  width: 595.28,
  height: 841.89,
  left: 40,
  right: 555,
  contentWidth: 515,
};

/* -----------------------------
   BASIC HELPERS
------------------------------ */

const safeValue = (value, fallback = "-") => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
};

const formatCurrency = (value) => {
  const amount = toNumber(value);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   AMOUNT TO WORDS
   ========================================================= */

const amountToWords = (value) => {
  const amount = toNumber(value);

  if (!Number.isFinite(amount)) {
    return "Zero Rupees Only";
  }

  const rounded = Math.round(amount * 100) / 100;

  const whole = Math.floor(rounded);
  const paise = Math.round((rounded - whole) * 100);

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

  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];

  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const underHundred = (num) => {
    if (num < 10) return ones[num];

    if (num < 20) {
      return teens[num - 10];
    }

    return `${tens[Math.floor(num / 10)]}${
      num % 10 ? ` ${ones[num % 10]}` : ""
    }`;
  };

  const underThousand = (num) => {
    if (num < 100) {
      return underHundred(num);
    }

    const hundred = Math.floor(num / 100);
    const remainder = num % 100;

    return remainder
      ? `${ones[hundred]} hundred ${underHundred(remainder)}`
      : `${ones[hundred]} hundred`;
  };

  const convert = (num) => {
    if (num < 1000) {
      return underThousand(num);
    }

    if (num < 100000) {
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;

      return remainder
        ? `${underThousand(thousand)} thousand ${underThousand(
            remainder
          )}`
        : `${underThousand(thousand)} thousand`;
    }

    if (num < 10000000) {
      const lakh = Math.floor(num / 100000);
      const remainder = num % 100000;

      return remainder
        ? `${underThousand(lakh)} lakh ${convert(remainder)}`
        : `${underThousand(lakh)} lakh`;
    }

    const crore = Math.floor(num / 10000000);
    const remainder = num % 10000000;

    return remainder
      ? `${underThousand(crore)} crore ${convert(remainder)}`
      : `${underThousand(crore)} crore`;
  };

  const words =
    convert(whole)
      .replace(/\s+/g, " ")
      .trim();

  const finalWords =
    words.charAt(0).toUpperCase() + words.slice(1);

  if (paise > 0) {
    return `${finalWords} Rupees and ${paise} Paise Only`;
  }

  return `${finalWords} Rupees Only`;
};

/* =========================================================
   ADDRESS HELPERS
   ========================================================= */

const getCustomerAddress = (order) => {
  const addressObject =
    order?.shippingAddress ||
    order?.billingAddress;

  if (addressObject && typeof addressObject === "object") {
    const parts = [
      addressObject.address,
      addressObject.addressLine1,
      addressObject.addressLine2,
      addressObject.city,
      addressObject.state,
      addressObject.pincode ||
        addressObject.postalCode ||
        addressObject.zip,
      addressObject.country,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(", ");
    }
  }

  if (typeof order?.address === "string") {
    return order.address;
  }

  return "-";
};

/* =========================================================
   ORDER DATA
   ========================================================= */

const getOrderData = (order) => {
  const customerName = safeValue(
    order?.user?.name ||
      order?.customerName ||
      order?.shippingAddress?.name ||
      "Customer",
    "Customer"
  );

  const customerEmail = safeValue(
    order?.user?.email ||
      order?.email ||
      order?.shippingAddress?.email ||
      "-"
  );

  const customerPhone = safeValue(
    order?.phone ||
      order?.mobile ||
      order?.customerPhone ||
      order?.shippingAddress?.phone ||
      "-"
  );

  const billingAddress = getCustomerAddress(order);

  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  return {
    invoiceNumber: safeValue(
      order?._id ||
        order?.invoiceNumber ||
        order?.invoiceNo,
      "-"
    ),

    orderNumber: safeValue(
      order?.orderNumber ||
        order?.orderId ||
        order?.orderNo ||
        order?._id,
      "-"
    ),

    invoiceDate: formatDate(
      order?.invoiceDate ||
        order?.createdAt ||
        new Date()
    ),

    orderDate: formatDate(
      order?.orderDate ||
        order?.createdAt ||
        new Date()
    ),

    customerName,
    customerEmail,
    customerPhone,
    billingAddress,

    paymentMethod: safeValue(
      order?.paymentMethod,
      "-"
    ),

    items,
  };
};

/* =========================================================
   FINANCIAL CALCULATIONS
   ========================================================= */

const getFinancialData = (order) => {
  const items = Array.isArray(order?.items)
    ? order.items
    : [];

  /*
   * NAYAMO Artificial Jewellery
   * HSN 7117
   * GST = 3%
   *
   * Calculation:
   * Item Total = Qty × Unit Price
   * Subtotal = Sum of Item Totals
   * Discount = Order Discount
   * Taxable Value = Subtotal - Discount
   * GST = Taxable Value × 3%
   * Grand Total = Taxable Value + GST + Shipping
   */

  const GST_RATE = 0.03;

  /* -----------------------------
     ITEM SUBTOTAL
  ------------------------------ */

  const calculatedItemSubtotal = items.reduce(
    (sum, item) => {
      const quantity = Number(item?.quantity || 0);

      const unitPrice = Number(
        item?.price ??
        item?.unitPrice ??
        item?.product?.price ??
        0
      );

      return sum + quantity * unitPrice;
    },
    0
  );

  /* -----------------------------
     BACKEND VALUES
  ------------------------------ */

  const backendSubtotal =
    order?.subtotal !== undefined &&
    order?.subtotal !== null
      ? Number(order.subtotal)
      : null;

  const backendDiscount =
    Number(
      order?.discountAmount ??
      order?.discount ??
      0
    ) || 0;

  const backendShipping =
    Number(
      order?.shippingCharges ??
      order?.shippingCharge ??
      order?.shippingCost ??
      order?.deliveryCharge ??
      0
    ) || 0;

  const backendGST =
    order?.gstAmount !== undefined &&
    order?.gstAmount !== null
      ? Number(order.gstAmount)
      : null;

  const backendTotal =
    order?.totalPrice !== undefined &&
    order?.totalPrice !== null
      ? Number(order.totalPrice)
      : null;

  /* -----------------------------
     SUBTOTAL
  ------------------------------ */

  const subtotal =
    backendSubtotal !== null &&
    Number.isFinite(backendSubtotal)
      ? backendSubtotal
      : calculatedItemSubtotal;

  /* -----------------------------
     DISCOUNT
  ------------------------------ */

  const discount = Math.max(
    backendDiscount,
    0
  );

  /* -----------------------------
     TAXABLE VALUE
  ------------------------------ */

  const taxableValue = Math.max(
    subtotal - discount,
    0
  );

  /* -----------------------------
     GST
  ------------------------------ */

  /*
   * If backend already contains GST,
   * use it.
   *
   * Otherwise calculate GST at 3%.
   */

  const gst =
    backendGST !== null &&
    Number.isFinite(backendGST)
      ? backendGST
      : taxableValue * GST_RATE;

  /* -----------------------------
     GRAND TOTAL
  ------------------------------ */

  /*
   * If backend already has a properly
   * calculated total AND subtotal/GST
   * are available, preserve that total.
   *
   * Otherwise calculate it ourselves.
   */

  let grandTotal;

  if (
    backendTotal !== null &&
    Number.isFinite(backendTotal) &&
    backendSubtotal !== null &&
    backendGST !== null
  ) {
    grandTotal = backendTotal;
  } else {
    grandTotal =
      taxableValue +
      gst +
      backendShipping;
  }

  /*
   * Round everything to 2 decimals
   */

  return {
    subtotal: Number(
      subtotal.toFixed(2)
    ),

    discount: Number(
      discount.toFixed(2)
    ),

    taxableValue: Number(
      taxableValue.toFixed(2)
    ),

    shipping: Number(
      backendShipping.toFixed(2)
    ),

    gst: Number(
      gst.toFixed(2)
    ),

    gstRate: 3,

    grandTotal: Number(
      grandTotal.toFixed(2)
    ),
  };
};

/* =========================================================
   ITEM TAX
   ========================================================= */

const getItemTax = (
  item,
  itemTotal,
  financialData
) => {
  /*
   * If backend has item-level tax,
   * use that value.
   */

  if (
    item?.taxAmount !== undefined &&
    item?.taxAmount !== null
  ) {
    return Number(
      Number(item.taxAmount).toFixed(2)
    );
  }

  /*
   * Otherwise calculate 3% GST
   * on the item's taxable value.
   */

  const itemTax =
    itemTotal * 0.03;

  return Number(
    itemTax.toFixed(2)
  );
};

/* =========================================================
   DRAWING HELPERS
   ========================================================= */

const drawLine = (
  doc,
  x1,
  y1,
  x2,
  y2,
  color = COLORS.line,
  width = 0.7
) => {
  doc
    .save()
    .strokeColor(color)
    .lineWidth(width)
    .moveTo(x1, y1)
    .lineTo(x2, y2)
    .stroke()
    .restore();
};

const drawText = (
  doc,
  text,
  x,
  y,
  options = {}
) => {
  const {
    font = "Helvetica",
    size = 10,
    color = COLORS.ink,
    width,
    align = "left",
    lineGap = 0,
  } = options;

  doc
    .font(font)
    .fontSize(size)
    .fillColor(color)
    .text(
      safeValue(text, ""),
      x,
      y,
      {
        ...(width ? { width } : {}),
        align,
        lineGap,
      }
    );
};

const drawLabelValue = (
  doc,
  label,
  value,
  x,
  y,
  labelWidth = 85,
  valueWidth = 140
) => {
  drawText(doc, label, x, y, {
    font: "Helvetica",
    size: 9,
    color: COLORS.softInk,
    width: labelWidth,
  });

  drawText(doc, value, x + labelWidth, y, {
    font: "Helvetica-Bold",
    size: 9,
    color: COLORS.ink,
    width: valueWidth,
  });
};

/* =========================================================
   HEADER
   ========================================================= */

const drawHeader = (
  doc,
  data
) => {
  const top = 34;

  /* Brand */

  drawText(
    doc,
    BUSINESS.name,
    PAGE.left,
    top,
    {
      font: "Helvetica-Bold",
      size: 34,
      color: COLORS.ink,
    }
  );

  drawText(
    doc,
    BUSINESS.category,
    PAGE.left + 2,
    top + 42,
    {
      font: "Helvetica",
      size: 11,
      color: COLORS.softInk,
    }
  );

  drawLine(
    doc,
    PAGE.left,
    top + 64,
    PAGE.left + 125,
    top + 64,
    COLORS.gold,
    1
  );

  /* Invoice heading */

  drawText(
    doc,
    "TAX INVOICE",
    400,
    top + 4,
    {
      font: "Helvetica-Bold",
      size: 22,
      color: COLORS.ink,
      width: 155,
      align: "right",
    }
  );

  drawLabelValue(
    doc,
    "Invoice No.",
    data.invoiceNumber,
    380,
    top + 48,
    72,
    140
  );

  drawLabelValue(
    doc,
    "Invoice Date",
    data.invoiceDate,
    380,
    top + 68,
    72,
    140
  );

  drawLabelValue(
    doc,
    "Order No.",
    data.orderNumber,
    380,
    top + 88,
    72,
    140
  );

  drawLabelValue(
    doc,
    "Order Date",
    data.orderDate,
    380,
    top + 108,
    72,
    140
  );

  drawLine(
    doc,
    PAGE.left,
    168,
    PAGE.right,
    168
  );
};

/* =========================================================
   SELLER / CUSTOMER
   ========================================================= */

const drawParties = (
  doc,
  data
) => {
  const y = 185;

  /* Seller */

  drawText(
    doc,
    "SOLD BY",
    PAGE.left,
    y,
    {
      font: "Helvetica-Bold",
      size: 12,
    }
  );

  drawText(
    doc,
    BUSINESS.legalName,
    PAGE.left,
    y + 25,
    {
      font: "Helvetica-Bold",
      size: 10,
    }
  );

  drawText(
    doc,
    BUSINESS.address,
    PAGE.left,
    y + 44,
    {
      font: "Helvetica",
      size: 9.5,
      color: COLORS.softInk,
      width: 230,
    }
  );

  drawText(
    doc,
    BUSINESS.country,
    PAGE.left,
    y + 75,
    {
      font: "Helvetica",
      size: 9.5,
      color: COLORS.softInk,
    }
  );

  drawText(
    doc,
    `GSTIN: ${BUSINESS.gstin}`,
    PAGE.left,
    y + 96,
    {
      font: "Helvetica-Bold",
      size: 9.5,
      color: COLORS.ink,
    }
  );

  /* Customer */

  const rightX = 315;

  drawText(
    doc,
    "BILL TO",
    rightX,
    y,
    {
      font: "Helvetica-Bold",
      size: 12,
    }
  );

  drawText(
    doc,
    data.customerName,
    rightX,
    y + 25,
    {
      font: "Helvetica-Bold",
      size: 10,
    }
  );

  drawText(
    doc,
    data.billingAddress,
    rightX,
    y + 44,
    {
      font: "Helvetica",
      size: 9.5,
      color: COLORS.softInk,
      width: 235,
      height: 42,
    }
  );

  drawText(
    doc,
    `Mobile: ${data.customerPhone}`,
    rightX,
    y + 82,
    {
      font: "Helvetica",
      size: 9.5,
      color: COLORS.softInk,
      width: 235,
    }
  );

  if (
    data.customerEmail &&
    data.customerEmail !== "-"
  ) {
    drawText(
      doc,
      `Email: ${data.customerEmail}`,
      rightX,
      y + 101,
      {
        font: "Helvetica",
        size: 9,
        color: COLORS.softInk,
        width: 235,
      }
    );
  }
};

/* =========================================================
   TABLE HEADER
   ========================================================= */

const TABLE = {
  x: 40,
  width: 515,
  headerHeight: 30,

  columns: [
    {
      key: "serial",
      title: "S.No.",
      width: 40,
      align: "center",
    },
    {
      key: "product",
      title: "Product",
      width: 185,
      align: "left",
    },
    {
      key: "hsn",
      title: "HSN",
      width: 52,
      align: "center",
    },
    {
      key: "qty",
      title: "Qty",
      width: 42,
      align: "center",
    },
    {
      key: "price",
      title: "Unit Price",
      width: 72,
      align: "right",
    },
    {
      key: "tax",
      title: "GST",
      width: 60,
      align: "right",
    },
    {
      key: "amount",
      title: "Amount",
      width: 64,
      align: "right",
    },
  ],
};

const getColumnX = (index) => {
  let x = TABLE.x;

  for (let i = 0; i < index; i++) {
    x += TABLE.columns[i].width;
  }

  return x;
};

const drawTableHeader = (
  doc,
  y
) => {
  doc
    .rect(
      TABLE.x,
      y,
      TABLE.width,
      TABLE.headerHeight
    )
    .fillAndStroke(
      COLORS.tableHead,
      COLORS.line
    );

  TABLE.columns.forEach(
    (column, index) => {
      const x = getColumnX(index);

      drawText(
        doc,
        column.title,
        x + 4,
        y + 9,
        {
          font: "Helvetica-Bold",
          size: 8.5,
          color: COLORS.ink,
          width: column.width - 8,
          align: column.align,
        }
      );
    }
  );

  return y + TABLE.headerHeight;
};

/* =========================================================
   PRODUCT ROW
   ========================================================= */

const getItemRowHeight = (
  doc,
  item
) => {
  const itemName = safeValue(
    item?.product?.title ||
      item?.name ||
      item?.productName ||
      "Product",
    "Product"
  );

  const productWidth =
    TABLE.columns[1].width - 12;

  doc.font("Helvetica").fontSize(8.5);

  const height =
    doc.heightOfString(
      itemName,
      {
        width: productWidth,
      }
    );

  return Math.max(
    34,
    Math.min(60, height + 18)
  );
};

const drawProductRow = (
  doc,
  item,
  index,
  y,
  financialData
) => {
  const rowHeight =
    getItemRowHeight(doc, item);

  if (index % 2 === 0) {
    doc
      .rect(
        TABLE.x,
        y,
        TABLE.width,
        rowHeight
      )
      .fill(COLORS.rowAlt);
  }

  doc
    .rect(
      TABLE.x,
      y,
      TABLE.width,
      rowHeight
    )
    .strokeColor(COLORS.lightLine)
    .stroke();

  const itemName = safeValue(
    item?.product?.title ||
      item?.name ||
      item?.productName ||
      "Product",
    "Product"
  );

  const quantity = toNumber(
    item?.quantity,
    0
  );

  const unitPrice = toNumber(
    item?.price ||
      item?.unitPrice ||
      item?.product?.price,
    0
  );

  const itemTotal =
    quantity * unitPrice;

  const itemTax =
    getItemTax(
      item,
      itemTotal,
      financialData
    );

  const hsn = safeValue(
    item?.product?.hsn ||
      item?.hsn ||
      "7117",
    "7117"
  );

  const values = [
    String(index + 1),
    itemName,
    hsn,
    String(quantity),
    formatCurrency(unitPrice),
    formatCurrency(itemTax),
    formatCurrency(itemTotal),
  ];

  TABLE.columns.forEach(
    (column, columnIndex) => {
      const x =
        getColumnX(columnIndex);

      drawText(
        doc,
        values[columnIndex],
        x + 4,
        y + 9,
        {
          font:
            columnIndex === 0
              ? "Helvetica-Bold"
              : "Helvetica",
          size: 8.5,
          color: COLORS.ink,
          width: column.width - 8,
          align: column.align,
        }
      );
    }
  );

  return y + rowHeight;
};

/* =========================================================
   SUMMARY
   ========================================================= */

const drawSummary = (
  doc,
  y,
  financialData
) => {
  const summaryX = 330;
  const summaryWidth =
    PAGE.right - summaryX;

  const rows = [
    {
      label: "Subtotal",
      value: financialData.subtotal,
    },
  ];

  if (financialData.discount > 0) {
    rows.push({
      label: "Discount",
      value: -financialData.discount,
    });
  }

  if (financialData.shipping > 0) {
    rows.push({
      label: "Shipping Charges",
      value: financialData.shipping,
    });
  }

  rows.push({
    label: "GST (3%)",
    value: financialData.gst,
  });

  rows.push({
    label: "Grand Total",
    value: financialData.grandTotal,
    total: true,
  });

  const rowHeight = 28;

  rows.forEach((row) => {
    doc
      .rect(
        summaryX,
        y,
        summaryWidth,
        rowHeight
      )
      .fillAndStroke(
        row.total
          ? COLORS.totalBg
          : COLORS.white,
        COLORS.line
      );

    drawText(
      doc,
      row.label,
      summaryX + 10,
      y + 8,
      {
        font: row.total
          ? "Helvetica-Bold"
          : "Helvetica",
        size: row.total ? 10 : 9,
        color: COLORS.ink,
        width: 130,
      }
    );

    const valueText =
      row.value < 0
        ? `-${formatCurrency(
            Math.abs(row.value)
          )}`
        : formatCurrency(row.value);

    drawText(
      doc,
      valueText,
      summaryX + 125,
      y + 8,
      {
        font: row.total
          ? "Helvetica-Bold"
          : "Helvetica",
        size: row.total ? 10 : 9,
        color: COLORS.ink,
        width: summaryWidth - 135,
        align: "right",
      }
    );

    y += rowHeight;
  });

  return y;
};

/* =========================================================
   FOOTER
   ========================================================= */

const drawFooter = (
  doc,
  y
) => {
  drawLine(
    doc,
    PAGE.left,
    y,
    PAGE.right,
    y,
    COLORS.line
  );

  drawText(
    doc,
    "Thank you for shopping with Nayamo.",
    PAGE.left,
    y + 18,
    {
      font: "Helvetica-Bold",
      size: 9,
      color: COLORS.ink,
    }
  );

  drawText(
    doc,
    "We hope you love your purchase!",
    PAGE.left,
    y + 34,
    {
      font: "Helvetica",
      size: 9,
      color: COLORS.softInk,
    }
  );

  /* Signature */

  drawLine(
    doc,
    410,
    y + 50,
    535,
    y + 50,
    COLORS.gold,
    0.8
  );

  drawText(
    doc,
    BUSINESS.signatory,
    430,
    y + 55,
    {
      font: "Helvetica-Bold",
      size: 13,
      color: COLORS.ink,
      width: 100,
      align: "center",
    }
  );

  drawText(
    doc,
    "Authorized Signature",
    410,
    y + 73,
    {
      font: "Helvetica",
      size: 8,
      color: COLORS.muted,
      width: 125,
      align: "center",
    }
  );

  drawLine(
    doc,
    PAGE.left,
    y + 105,
    PAGE.right,
    y + 105,
    COLORS.lightLine
  );

  drawText(
    doc,
    BUSINESS.phone,
    PAGE.left,
    y + 120,
    {
      font: "Helvetica",
      size: 8.5,
      color: COLORS.softInk,
      width: 150,
    }
  );

  drawText(
    doc,
    BUSINESS.email,
    205,
    y + 120,
    {
      font: "Helvetica",
      size: 8.5,
      color: COLORS.softInk,
      width: 170,
      align: "center",
    }
  );

  drawText(
    doc,
    BUSINESS.website,
    430,
    y + 120,
    {
      font: "Helvetica",
      size: 8.5,
      color: COLORS.softInk,
      width: 125,
      align: "right",
    }
  );
};

/* =========================================================
   MAIN INVOICE BUILDER
   ========================================================= */

const buildInvoiceDocument = (
  doc,
  order
) => {
  const data =
    getOrderData(order);

  const financialData =
    getFinancialData(order);

  /*
   * White professional background
   */

  doc
    .rect(
      0,
      0,
      PAGE.width,
      PAGE.height
    )
    .fill(COLORS.paper);

  /* Header */

  drawHeader(doc, data);

  /* Seller / customer */

  drawParties(doc, data);

  /* Product table */

  let currentY = 330;

  currentY =
    drawTableHeader(
      doc,
      currentY
    );

  const items = data.items;

  if (!items.length) {
    doc
      .rect(
        TABLE.x,
        currentY,
        TABLE.width,
        42
      )
      .strokeColor(COLORS.line)
      .stroke();

    drawText(
      doc,
      "No items found",
      TABLE.x + 10,
      currentY + 14,
      {
        font: "Helvetica",
        size: 9,
        color: COLORS.muted,
      }
    );

    currentY += 42;
  } else {
    items.forEach(
      (item, index) => {
        const rowHeight =
          getItemRowHeight(
            doc,
            item
          );

        /*
         * Keep summary/footer on same page
         * where possible.
         */

        const remainingSpace =
          PAGE.height - currentY;

        if (
          remainingSpace <
          rowHeight + 190
        ) {
          doc.addPage();

          currentY = 40;

          drawText(
            doc,
            BUSINESS.name,
            PAGE.left,
            currentY,
            {
              font: "Helvetica-Bold",
              size: 16,
              color: COLORS.ink,
            }
          );

          drawText(
            doc,
            "Tax Invoice - Continued",
            PAGE.right - 180,
            currentY + 2,
            {
              font: "Helvetica-Bold",
              size: 9,
              color: COLORS.muted,
              width: 180,
              align: "right",
            }
          );

          currentY += 32;

          drawLine(
            doc,
            PAGE.left,
            currentY,
            PAGE.right,
            currentY
          );

          currentY += 12;

          currentY =
            drawTableHeader(
              doc,
              currentY
            );
        }

        currentY =
          drawProductRow(
            doc,
            item,
            index,
            currentY,
            financialData
          );
      }
    );
  }

  /*
   * Summary section
   */

  currentY += 8;

  /*
   * Total item count on left
   */

  drawText(
    doc,
    `Total Items: ${items.length}`,
    PAGE.left + 4,
    currentY + 8,
    {
      font: "Helvetica",
      size: 9,
      color: COLORS.softInk,
      width: 220,
    }
  );

  /*
   * Financial summary
   */

  const summaryTop =
    currentY;

  const summaryBottom =
    drawSummary(
      doc,
      summaryTop,
      financialData
    );

  /*
   * Amount in words
   */

  const wordsY =
    summaryBottom + 16;

  drawText(
    doc,
    "Amount in Words:",
    PAGE.left,
    wordsY,
    {
      font: "Helvetica-Bold",
      size: 9,
      color: COLORS.ink,
    }
  );

  drawText(
    doc,
    amountToWords(
      financialData.grandTotal
    ),
    PAGE.left,
    wordsY + 18,
    {
      font: "Helvetica",
      size: 9,
      color: COLORS.softInk,
      width: 515,
    }
  );

  /*
   * Footer
   */

  let footerY =
    wordsY + 58;

  /*
   * Prevent footer from going outside A4.
   */

  if (
    footerY + 140 >
    PAGE.height
  ) {
    doc.addPage();

    footerY = 50;

    drawText(
      doc,
      BUSINESS.name,
      PAGE.left,
      footerY,
      {
        font: "Helvetica-Bold",
        size: 16,
        color: COLORS.ink,
      }
    );

    drawText(
      doc,
      "Invoice Footer",
      PAGE.right - 150,
      footerY + 2,
      {
        font: "Helvetica-Bold",
        size: 9,
        color: COLORS.muted,
        width: 150,
        align: "right",
      }
    );

    footerY += 35;
  }

  drawFooter(
    doc,
    footerY
  );
};

/* =========================================================
   GENERATE INVOICE BUFFER
   ========================================================= */

exports.generateInvoiceBuffer = (
  order
) =>
  new Promise(
    (resolve, reject) => {
      try {
        const doc =
          new PDFDocument({
            size: "A4",
            margin: 40,
            autoFirstPage: true,
            bufferPages: true,
          });

        const chunks = [];

        doc.on(
          "data",
          (chunk) =>
            chunks.push(chunk)
        );

        doc.on(
          "end",
          () =>
            resolve(
              Buffer.concat(chunks)
            )
        );

        doc.on(
          "error",
          reject
        );

        buildInvoiceDocument(
          doc,
          order
        );

        doc.end();
      } catch (error) {
        reject(error);
      }
    }
  );

/* =========================================================
   GENERATE INVOICE DIRECTLY TO RESPONSE
   ========================================================= */

exports.generateInvoice = (
  order,
  res
) => {
  try {
    const doc =
      new PDFDocument({
        size: "A4",
        margin: 40,
        autoFirstPage: true,
        bufferPages: true,
      });

    const invoiceId =
      safeValue(
        order?._id ||
          order?.invoiceNumber ||
          "invoice",
        "invoice"
      );

    res.writeHead(200, {
      "Content-Type":
        "application/pdf",

      "Content-Disposition":
        `inline; filename="invoice-${invoiceId}.pdf"`,

      "Cache-Control":
        "no-store",
    });

    doc.pipe(res);

    buildInvoiceDocument(
      doc,
      order
    );

    doc.end();
  } catch (error) {
    console.error(
      "[NAYAMO INVOICE ERROR]",
      error
    );

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message:
          "Invoice generation failed",
      });
    } else {
      try {
        res.end();
      } catch (_) {}
    }
  }
};
