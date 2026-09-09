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
    port: 587,
    secure: false,
    requireTLS: true,
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

/* ================= LOGIN OTP EMAIL ================= */

async function sendLoginOtpEmail({ to, name, otp }) {
  const html = baseTemplate({
    title: "Login Verification Passcode",
    badge: "● SECURE VERIFICATION CODE",
    content: `
      <p>Hi <strong style="color:#ffffff;">${name || "Valued Customer"}</strong>,</p>

      <p>Your one-time passcode to log in to your <strong>IONYX Account</strong> is:</p>

      <!-- 6-DIGIT OTP HERO BOX -->
      <div style="background: linear-gradient(135deg, #090d16 0%, #064e3b 100%); color:#34d399; font-size:36px; font-weight:900; letter-spacing:12px; text-align:center; padding:22px; border-radius:18px; margin:24px 0; border:1px solid #34d399; box-shadow:0 10px 30px rgba(52, 211, 153, 0.2);">
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
    subject: `Your Login Passcode • ${otp}`,
    html,
  });
}

/* ================= LOW STOCK ALERT (ADMIN) ================= */

async function sendLowStockAlertEmail({
  to = "gouravbasak248@gmail.com",
  productTitle,
  productId,
  remainingStock,
}) {
  const adminEmail = to || process.env.ADMIN_ALERT_EMAIL || "gouravbasak248@gmail.com";
  const frontendUrl = process.env.FRONTEND_URL || "https://shopit-lilac-rho.vercel.app";

  const isOut = remainingStock <= 0;
  const badgeColor = isOut ? "#ef4444" : "#f59e0b";
  const badgeText = isOut ? "● OUT OF STOCK URGENT" : `● LOW STOCK WARNING (${remainingStock} LEFT)`;

  const html = baseTemplate({
    title: isOut ? "Critical: Product Out of Stock!" : "Urgent: Low Inventory Alert!",
    badge: badgeText,
    content: `
      <p>Hello <strong style="color:#ffffff;">Store Administrator</strong>,</p>

      <p>An order was just placed that reduced the inventory of <strong style="color:#38bdf8;">${productTitle || "a product"}</strong> to a critical level:</p>

      <!-- PRODUCT ALERT CARD -->
      <div class="info-box" style="border-left: 4px solid ${badgeColor};">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin-bottom:12px;">
          <tr>
            <td style="color:#94a3b8; padding:6px 0;">Product:</td>
            <td align="right" style="color:#ffffff; font-weight:800; padding:6px 0;">${productTitle}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8; padding:6px 0;">Product ID:</td>
            <td align="right" style="color:#94a3b8; font-family:monospace; padding:6px 0;">${productId}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8; padding:6px 0;">Remaining Stock:</td>
            <td align="right" style="color:${badgeColor}; font-weight:900; font-size:18px; padding:6px 0;">
              ${remainingStock} units
            </td>
          </tr>
          <tr>
            <td style="color:#94a3b8; padding:6px 0;">Status:</td>
            <td align="right" style="color:${badgeColor}; font-weight:800; padding:6px 0;">
              ${isOut ? "CRITICAL (0 UNITS)" : "CRITICALLY LOW (< 3 UNITS)"}
            </td>
          </tr>
        </table>
      </div>

      <div style="margin:28px 0; text-align:center;">
        <a href="${frontendUrl}/admin/inventory" class="btn-primary" style="background:${badgeColor};">
          Restock Inventory in Admin Panel →
        </a>
      </div>

      <p style="font-size:12px; color:#94a3b8; text-align:center;">
        This is an automated inventory guard email sent directly to your administrative mailbox.
      </p>
    `,
  });

  await getTransporter().sendMail({
    from: `"IONYX Inventory Guard" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 ${isOut ? "OUT OF STOCK" : "LOW STOCK ALERT"}: ${productTitle} (${remainingStock} left)`,
    html,
  });
}

/* ================= ORDER STATUS UPDATE ================= */

async function sendOrderStatusUpdateEmail({
  to,
  name,
  orderId,
  status,
  courierName,
  trackingNumber,
  trackingUrl,
  total,
}) {
  const frontendUrl = process.env.FRONTEND_URL || "https://shopit-lilac-rho.vercel.app";
  const trackLink = `${frontendUrl}/track-order?id=${orderId}`;

  let title = `Order Status: ${status}`;
  let badge = `● STATUS: ${status.toUpperCase()}`;
  let subject = `Shipment Update • #${orderId} is ${status}`;
  let messageContent = "";

  if (status === "Processing") {
    title = "Order Confirmed & Processing!";
    badge = "● SHIPMENT IN PREPARATION";
    subject = `Order Confirmed • #${orderId} is Being Prepared`;
    messageContent = `
      <p>Great news! Your payment is confirmed and our warehouse team is packing your gear with protective express packaging.</p>
    `;
  } else if (status === "Shipped") {
    title = "Your Order Has Been Dispatched! 🚀";
    badge = "● DISPATCHED VIA EXPRESS COURIER";
    subject = `Order Dispatched • #${orderId} is on the way!`;
    messageContent = `
      <p>Exciting news! Your package has been handed over to our courier partner and is officially on its way to you.</p>

      ${courierName || trackingNumber ? `
        <div class="info-box" style="margin:16px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
            ${courierName ? `
              <tr>
                <td style="color:#94a3b8; padding:4px 0;">Courier Partner:</td>
                <td align="right" style="color:#ffffff; font-weight:700; padding:4px 0;">${courierName}</td>
              </tr>
            ` : ""}
            ${trackingNumber ? `
              <tr>
                <td style="color:#94a3b8; padding:4px 0;">Tracking Number (AWB):</td>
                <td align="right" style="color:#38bdf8; font-weight:800; font-family:monospace; padding:4px 0;">${trackingNumber}</td>
              </tr>
            ` : ""}
          </table>
        </div>
      ` : ""}

      ${trackingUrl ? `
        <div style="margin:16px 0; text-align:center;">
          <a href="${trackingUrl}" target="_blank" style="color:#38bdf8; font-size:13px; font-weight:700; text-decoration:underline;">
            Open Courier Tracking Portal →
          </a>
        </div>
      ` : ""}
    `;
  } else if (status === "Out for Delivery") {
    title = "Out for Delivery Today! 📦";
    badge = "● ARRIVING TODAY";
    subject = `Arriving Today • #${orderId} is Out for Delivery`;
    messageContent = `
      <p>Your order is in your local delivery van and will be delivered to your doorstep today. Please keep your phone reachable for the courier executive.</p>
    `;
  } else if (status === "Delivered") {
    title = "Your Package Has Been Delivered! 🎉";
    badge = "● DELIVERED SAFELY";
    subject = `Delivered Successfully • #${orderId}`;
    messageContent = `
      <p>Your package has been safely delivered! We hope you love your new gear.</p>
      <p>If you need any support, warranty assistance, or return/exchange within 7 days, our team is always here to assist.</p>
    `;
  } else {
    messageContent = `<p>The status of your order <strong>#${orderId}</strong> has been updated to: <strong style="color:#38bdf8;">${status}</strong>.</p>`;
  }

  const html = baseTemplate({
    title,
    badge,
    content: `
      <p>Hi <strong style="color:#ffffff;">${name || "Valued Customer"}</strong>,</p>

      ${messageContent}

      <!-- ORDER SUMMARY CARD -->
      <div class="info-box">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
          <tr>
            <td style="color:#94a3b8; padding:4px 0;">Order Number:</td>
            <td align="right" style="color:#38bdf8; font-weight:800; padding:4px 0;">#${orderId}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8; padding:4px 0;">Current Status:</td>
            <td align="right" style="color:#34d399; font-weight:800; padding:4px 0;">● ${status}</td>
          </tr>
          ${total ? `
            <tr>
              <td style="color:#94a3b8; padding:4px 0;">Order Total:</td>
              <td align="right" style="color:#ffffff; font-weight:700; padding:4px 0;">₹${Number(total).toLocaleString("en-IN")}</td>
            </tr>
          ` : ""}
        </table>
      </div>

      <div style="margin:28px 0; text-align:center;">
        <a href="${trackLink}" class="btn-primary">
          Track Your Shipment Live →
        </a>
      </div>

      <p style="font-size:12px; color:#94a3b8; text-align:center;">
        You can track the live milestones of your package at any time on our website.
      </p>
    `,
  });

  await getTransporter().sendMail({
    from: `"IONYX Store" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

/* ================= EXPORTS ================= */

module.exports = {
  sendOrderCreatedEmail,
  sendOrderCancelledEmail,
  sendAdminOtpEmail,
  sendLoginOtpEmail,
  sendLowStockAlertEmail,
  sendOrderStatusUpdateEmail,
};

