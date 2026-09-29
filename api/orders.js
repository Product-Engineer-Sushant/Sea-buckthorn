import nodemailer from "nodemailer";

const safe = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { name, phone, district, municipality, address, quantity, total } = body;

    if (!name || !phone || !district || !municipality || !address) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required delivery details."
      });
    }

    const requiredEnv = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "ORDER_EMAIL"];
    if (requiredEnv.some((key) => !process.env[key])) {
      console.error("Order API is missing required SMTP environment variables.");
      return res.status(500).json({
        success: false,
        message: "The order service is not configured yet. Please try again later."
      });
    }

    const qty = Math.max(1, Number(quantity) || 1);
    const orderTotal = Number(total) || qty * 1000;
    const orderId = `SB-${Date.now().toString().slice(-8)}`;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"Customer Orders" <${process.env.SMTP_USER}>`,
      to: process.env.ORDER_EMAIL,
      replyTo: process.env.SMTP_USER,
      subject: `New Order ${orderId} — Sea Buckthorn Serum`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#172019">
          <div style="background:#164c37;color:white;padding:22px;border-radius:12px 12px 0 0">
            <h2 style="margin:0">New Sea Buckthorn Order</h2>
            <p style="margin:8px 0 0">Order ID: <strong>${safe(orderId)}</strong></p>
          </div>
          <div style="padding:24px;border:1px solid #e7e5df;border-top:0">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${safe(name)}<br><strong>Phone:</strong> ${safe(phone)}<br><strong>District:</strong> ${safe(district)}<br><strong>Municipality:</strong> ${safe(municipality)}<br><strong>Address:</strong> ${safe(address)}</p>
            <h3>Order Details</h3>
            <p><strong>Product:</strong> Sea Buckthorn Face Serum<br><strong>Quantity:</strong> ${qty}<br><strong>Total:</strong> Rs. ${orderTotal}<br><strong>Payment:</strong> Cash on Delivery</p>
          </div>
        </div>`,
      text: [
        "New Sea Buckthorn Order",
        `Order ID: ${orderId}`,
        `Customer: ${name}`,
        `Phone: ${phone}`,
        `District: ${district}`,
        `Municipality: ${municipality}`,
        `Address: ${address}`,
        `Quantity: ${qty}`,
        `Total: Rs. ${orderTotal}`,
        "Payment: Cash on Delivery"
      ].join("\n")
    });

    return res.status(201).json({ success: true, message: "Order received successfully.", orderId });
  } catch (error) {
    console.error("Order email error:", error);
    return res.status(500).json({ success: false, message: "Unable to send the order right now. Please try again." });
  }
}
