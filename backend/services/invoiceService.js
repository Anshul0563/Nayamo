const PDFDocument =
  require("pdfkit");

exports.generateInvoice =
  (order, res) => {
    const doc =
      new PDFDocument({
        margin: 50,
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${order._id}.pdf`
    );

    doc.pipe(res);

    // =========================
    // HEADER
    // =========================
    doc
      .fontSize(28)
      .text("NAYAMO", {
        align: "center",
      });

    doc
      .fontSize(14)
      .text(
        "Premium Jewellery Store",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    // =========================
    // ORDER INFO
    // =========================
    doc
      .fontSize(18)
      .text("Invoice");

    doc.moveDown();

    doc
      .fontSize(12)
      .text(
        `Order ID: ${order._id}`
      );

    doc.text(
      `Date: ${new Date(
        order.createdAt
      ).toLocaleDateString()}`
    );

    doc.text(
      `Payment: ${order.paymentMethod}`
    );

    doc.text(
      `Status: ${order.status}`
    );

    doc.moveDown(2);

    // =========================
    // CUSTOMER
    // =========================
    doc
      .fontSize(16)
      .text(
        "Customer Details"
      );

    doc.moveDown();

    doc.text(
      `Name: ${
        order.user?.name ||
        "Customer"
      }`
    );

    doc.text(
      `Email: ${
        order.user?.email ||
        "-"
      }`
    );

    doc.text(
      `Phone: ${order.phone}`
    );

    doc.text(
      `Address: ${order.address}`
    );

    doc.moveDown(2);

    // =========================
    // ITEMS
    // =========================
    doc
      .fontSize(16)
      .text("Items");

    doc.moveDown();

    order.items.forEach(
      (item) => {
        doc.text(
          `${
            item.product
              ?.title ||
            "Product"
          }`
        );

        doc.text(
          `Qty: ${
            item.quantity
          }`
        );

        doc.text(
          `Price: ₹${item.price}`
        );

        doc.moveDown();
      }
    );

    // =========================
    // TOTAL
    // =========================
    doc.moveDown();

    doc
      .fontSize(18)
      .text(
        `Total: ₹${order.totalPrice}`,
        {
          align: "right",
        }
      );

    doc.moveDown(2);

    doc
      .fontSize(12)
      .text(
        "Thank you for shopping with Nayamo ❤️",
        {
          align: "center",
        }
      );

    doc.end();
  };