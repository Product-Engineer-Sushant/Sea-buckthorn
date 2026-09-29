import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "ORDER_EMAIL"];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length) {
  console.warn(`Missing environment variables: ${missing.join(", ")}`);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "order-email-api" });
});

app.post("/api/orders", async (req, res) => {
  try {
    const { name, phone, district, municipality, address, quantity, total } = req.body;

    if (!name || !phone || !district || !municipality || !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required delivery details."
      });
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const orderTotal = Number(total) || qty * 1000;
    const orderId = `SB-${Date.now().toString().slice(-8)}`;

    const safe = (value) =>
      String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#172019">
        <div style="background:#164c37;color:white;padding:22px;border-radius:12px 12px 0 0">
          <h2 style="margin:0">New Sea Buckthorn Order</h2>
          <p style="margin:8px 0 0">Order ID: <strong>${safe(orderId)}</strong></p>
        </div>
        <div style="padding:24px;border:1px solid #e7e5df;border-top:0">
          <h3>Customer Details</h3>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666">Name</td><td><strong>${safe(name)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666">Phone</td><td>${safe(phone)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">District</td><td>${safe(district)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Municipality</td><td>${safe(municipality)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Address</td><td>${safe(address)}</td></tr>
          </table>

          <h3 style="margin-top:25px">Order Details</h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #ddd">
            <tr style="background:#f7f5ee">
              <th style="text-align:left;padding:10px">Product</th>
              <th style="padding:10px">Qty</th>
              <th style="text-align:right;padding:10px">Total</th>
            </tr>
            <tr>
              <td style="padding:12px">Sea Buckthorn Face Serum</td>
              <td style="text-align:center">${qty}</td>
              <td style="text-align:right;padding:12px">Rs. ${orderTotal}</td>
            </tr>
          </table>

          <div style="margin-top:20px;background:#fff4ec;padding:16px;border-radius:8px">
            <strong>Payment: Cash on Delivery</strong>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Customer Orders" <${process.env.SMTP_USER}>`,
      to: process.env.ORDER_EMAIL,
      replyTo: process.env.SMTP_USER,
      subject: `New Order ${orderId} — Sea Buckthorn Serum`,
      html,
      text: [
        `New Sea Buckthorn Order`,
        `Order ID: ${orderId}`,
        ``,
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `District: ${district}`,
        `Municipality: ${municipality}`,
        `Address: ${address}`,
        ``,
        `Product: Sea Buckthorn Face Serum`,
        `Quantity: ${qty}`,
        `Total: Rs. ${orderTotal}`,
        `Payment: Cash on Delivery`
      ].join("\n")
    });

    res.status(201).json({
      success: true,
      message: "Order received successfully.",
      orderId
    });
  } catch (error) {
    console.error("Order email error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to send the order right now. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Order server running on http://localhost:${PORT}`);
});
