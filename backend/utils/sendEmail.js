const nodemailer = require("nodemailer");

// HTML templates
const orderCancelledTemplate = require("./emailTemplates/orderCancelled");
const baseTemplate = require("./emailTemplates/baseTemplate");

/* ================= MAIL TRANSPORT ================= */

function getTransporter() {
  const user = (process.env.EMAIL_USER || "").trim();
  const pass = (process.env.EMAIL_PASS || "").trim();

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
}

/* ================= ORDER CREATED ================= */

async function sendOrderCreatedEmail({ to, name, orderId, total, items = [] }) {
  const itemsHtml = items.length > 0
    ? items.map((item) => `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #334155;">
            <strong style="color:#ffffff;">${item.title || "Product"}</strong>
            <div style="font-size:11px; color:#94a3b8;">Qty: ${item.qty} ${item.size ? `• Size: ${item.size}` : ""}</div>
          </td>
          <td align="right" style="padding:10px 0; border-bottom:1px solid #334155; color:#ffffff; font-weight:700;">
            ₹${(item.price * item.qty).toLocaleString("en-IN")}
          </td>
        </tr>
      `).join("")
    : "";

  const html = baseTemplate({
    title: "Order Confirmed & Processing!",
    badge: "● SHIPMENT PREPARATION IN PROGRESS",
    content: `
      <p>Hi <strong style="color:#ffffff;">${name || "Valued Customer"}</strong>,</p>

      <p>Thank you for shopping with <strong>IONYX Store</strong>! We have received your order <strong style="color:#38bdf8;">#${orderId}</strong> and our team is already preparing it for express shipment.</p>

      <!-- ORDER SUMMARY CARD -->
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px; margin-bottom:12px;">
          <tr>
            <td style="color:#94a3b8;">Order Number:</td>
            <td align="right" style="color:#38bdf8; font-weight:800;">#${orderId}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;">Order Status:</td>
            <td align="right" style="color:#34d399; font-weight:800;">● Processing</td>
          </tr>
        </table>

        ${itemsHtml ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px; margin-top:12px;">
            ${itemsHtml}
          </table>
        ` : ""}

        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-top:16px; pt-12; border-top:1px solid #475569;">
          <tr>
            <td style="color:#ffffff; font-weight:800; padding-top:12px;">Total Paid:</td>
            <td align="right" style="color:#38bdf8; font-weight:900; font-size:18px; padding-top:12px;">
              ₹${Number(total || 0).toLocaleString("en-IN")}
            </td>
          </tr>
        </table>
      </div>

      <!-- LIVE ORDER TRACKING CTA BUTTON -->
      <div style="margin:28px 0; text-align:center;">
        <a href="http://localhost:3000/track-order?id=${orderId}" class="btn-primary">
          Track Your Shipment Live →
        </a>
      </div>

      <p style="font-size:12px; color:#94a3b8; text-align:center;">
        You can also track your shipment anytime on our website without logging in.
      </p>
    `,
  });

  await getTransporter().sendMail({
    from: `"IONYX Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed • #${orderId}`,
    html,
  });
}

/* ================= ORDER CANCELLED ================= */

async function sendOrderCancelledEmail({ to, name, orderId, total }) {
  const html = orderCancelledTemplate({
    name,
    orderId,
    total,
  });

  await getTransporter().sendMail({
    from: `"IONYX Store" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Cancelled • #${orderId}`,
    html,
  });
}

/* ================= ADMIN OTP ACCESS EMAIL ================= */

async function sendAdminOtpEmail({ to, name, otp }) {
  const html = baseTemplate({
    title: "Admin Portal Access Passcode",
    badge: "● SECURE VERIFICATION CODE",
    content: `
      <p>Hi <strong style="color:#ffffff;">${name || "Admin"}</strong>,</p>

      <p>Your one-time login access verification passcode for the <strong>IONYX Admin Portal</strong> is:</p>

      <!-- 6-DIGIT OTP HERO BOX -->
      <div style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%); color:#38bdf8; font-size:36px; font-weight:900; letter-spacing:12px; text-align:center; padding:22px; border-radius:18px; margin:24px 0; border:1px solid #38bdf8; box-shadow:0 10px 30px rgba(56, 189, 248, 0.2);">
        ${otp}
      </div>

      <p style="font-size:13px; color:#94a3b8; text-align:center;">
        This code is valid for <strong>10 minutes</strong>. Do not share this passcode with anyone.
      </p>
    `,
  });

  await getTransporter().sendMail({
    from: `"IONYX Security" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your Admin Access Passcode • ${otp}`,
    html,
  });
}

/* ================= EXPORTS ================= */

module.exports = {
  sendOrderCreatedEmail,
  sendOrderCancelledEmail,
  sendAdminOtpEmail,
};
