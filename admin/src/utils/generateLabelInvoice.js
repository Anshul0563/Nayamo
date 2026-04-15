// admin/src/utils/generateLabelInvoice.js
// PRO VERSION - Real Barcode + QR + Premium Layout

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

export const generateLabelInvoice = async (orders = []) => {
  for (const order of orders) {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    const trackingId =
      "NYM" +
      order._id.slice(-8).toUpperCase();

    // =========================
    // QR DATA
    // =========================
    const qrPayload = JSON.stringify({
      trackingId,
      orderId: order._id,
      customer: order.user?.name,
      amount: order.totalPrice,
      phone: order.phone,
    });

    const qrImage = await QRCode.toDataURL(
      qrPayload
    );

    // =========================
    // REAL BARCODE IMAGE
    // =========================
    const canvas =
      document.createElement("canvas");

    JsBarcode(canvas, trackingId, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: 2,
      height: 45,
    });

    const barcodeImage =
      canvas.toDataURL("image/png");

    // =========================
    // PAGE BORDER
    // =========================
    doc.setDrawColor(0);
    doc.rect(5, 5, 200, 287);

    // =========================
    // HEADER
    // =========================
    doc.setFillColor(20, 20, 20);
    doc.rect(5, 5, 200, 14, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("NAYAMO SHIPPING LABEL", 10, 14);

    doc.setTextColor(0, 0, 0);

    // =========================
    // CUSTOMER BOX
    // =========================
    doc.rect(8, 24, 92, 52);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SHIP TO", 11, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(
      order.user?.name || "Customer",
      11,
      37
    );

    const addressLines =
      doc.splitTextToSize(
        order.address || "-",
        84
      );

    doc.text(addressLines, 11, 44);

    doc.text(
      `Phone: ${
        order.phone || "N/A"
      }`,
      11,
      68
    );

    // =========================
    // ORDER BOX
    // =========================
    doc.rect(104, 24, 93, 52);

    doc.setFont("helvetica", "bold");
    doc.text("ORDER INFO", 108, 30);

    doc.setFont("helvetica", "normal");

    doc.text(
      `Tracking ID: ${trackingId}`,
      108,
      38
    );
    doc.text(
      `Order ID: ${order._id.slice(-8)}`,
      108,
      46
    );
    doc.text(
      `Payment: ${order.paymentMethod.toUpperCase()}`,
      108,
      54
    );
    doc.text(
      `Amount: ₹${order.totalPrice}`,
      108,
      62
    );

    // =========================
    // QR + BARCODE
    // =========================
    doc.addImage(
      qrImage,
      "PNG",
      148,
      66,
      38,
      38
    );

    doc.addImage(
      barcodeImage,
      "PNG",
      15,
      82,
      120,
      22
    );

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(
      trackingId,
      55,
      108
    );

    // =========================
    // PRODUCTS TABLE
    // =========================
    autoTable(doc, {
      startY: 115,
      theme: "grid",
      head: [
        [
          "Product",
          "Qty",
          "Price",
          "Total",
        ],
      ],
      body: order.items.map((item) => [
        item.product?.title ||
          "Product",
        item.quantity,
        `₹${item.product?.price || 0}`,
        `₹${
          (item.product?.price || 0) *
          item.quantity
        }`,
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [25, 25, 25],
      },
    });

    // =========================
    // INVOICE SECTION
    // =========================
    let y =
      doc.lastAutoTable.finalY + 10;

    doc.setFillColor(245, 245, 245);
    doc.rect(8, y, 189, 10, "F");

    doc.setFontSize(13);
    doc.setFont(
      "helvetica",
      "bold"
    );
    doc.text(
      "TAX INVOICE",
      82,
      y + 7
    );

    y += 16;

    doc.setFontSize(10);
    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Invoice No: INV-${order._id.slice(
        -6
      )}`,
      10,
      y
    );
    doc.text(
      `Date: ${new Date().toLocaleDateString()}`,
      145,
      y
    );

    y += 8;

    doc.text(
      `Bill To: ${
        order.user?.name
      }`,
      10,
      y
    );

    y += 6;

    doc.text(
      doc.splitTextToSize(
        order.address,
        180
      ),
      10,
      y
    );

    y += 18;

    autoTable(doc, {
      startY: y,
      theme: "grid",
      head: [
        [
          "Description",
          "Qty",
          "Rate",
          "Amount",
        ],
      ],
      body: order.items.map((item) => [
        item.product?.title ||
          "Product",
        item.quantity,
        `₹${item.product?.price || 0}`,
        `₹${
          (item.product?.price || 0) *
          item.quantity
        }`,
      ]),
      foot: [
        [
          "",
          "",
          "Grand Total",
          `₹${order.totalPrice}`,
        ],
      ],
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [25, 25, 25],
      },
      footStyles: {
        fillColor: [230, 230, 230],
        textColor: 0,
      },
    });

    // =========================
    // FOOTER
    // =========================
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(
      "This is a computer generated invoice. Thank you for shopping with Nayamo.",
      10,
      286
    );

    doc.save(
      `${trackingId}.pdf`
    );
  }
};