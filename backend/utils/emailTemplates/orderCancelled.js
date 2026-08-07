const baseTemplate = require("./baseTemplate");

module.exports = function orderCancelledTemplate({
  name,
  orderId,
  total,
}) {
  return baseTemplate({
    title: "Order Cancellation Notice",
    badge: "● REFUND PROCESSED",
    content: `
      <p>Hi <strong style="color:#ffffff;">${name || "Valued Customer"}</strong>,</p>

      <p>We are writing to confirm that your order <strong style="color:#38bdf8;">#${orderId}</strong> has been cancelled as requested.</p>

      <div class="info-box" style="border-left: 4px solid #f43f5e;">
        <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
          <tr>
            <td style="color:#94a3b8; padding-bottom:8px;">Order Reference:</td>
            <td align="right" style="color:#ffffff; font-weight:800; padding-bottom:8px;">#${orderId}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8; padding-bottom:8px;">Total Refund Amount:</td>
            <td align="right" style="color:#38bdf8; font-weight:900; font-size:16px; padding-bottom:8px;">₹${Number(total || 0).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td style="color:#94a3b8;">Refund Method:</td>
            <td align="right" style="color:#e2e8f0; font-weight:700;">Original Payment Method (3-5 Business Days)</td>
          </tr>
        </table>
      </div>

      <p style="font-size:13px; color:#94a3b8;">
        If you did not initiate this cancellation or if you have any questions regarding your refund, please reach out to our dedicated support team.
      </p>

      <div style="margin-top:28px; text-align:center;">
        <a href="http://localhost:3000/products" class="btn-primary">Continue Shopping on IONYX</a>
      </div>
    `,
  });
};
