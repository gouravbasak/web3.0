module.exports = function baseTemplate({ title, badge, content }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #060814;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #e2e8f0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          width: 100%;
          table-layout: fixed;
          background-color: #060814;
          padding: 40px 10px;
        }
        .main-card {
          max-width: 580px;
          margin: 0 auto;
          background-color: #0f172a;
          border-radius: 24px;
          border: 1px solid #1e293b;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .header {
          background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #090d16 100%);
          padding: 36px 32px;
          text-align: center;
          border-bottom: 1px solid #1e293b;
        }
        .logo {
          font-size: 28px;
          font-weight: 900;
          letter-spacing: 4px;
          color: #ffffff;
          margin: 0;
          text-transform: uppercase;
        }
        .logo span {
          color: #38bdf8;
        }
        .sub-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          color: #818cf8;
          text-transform: uppercase;
          margin-top: 6px;
        }
        .content {
          padding: 36px 32px;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.7;
        }
        .page-title {
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }
        .badge-pill {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          margin-bottom: 20px;
        }
        .btn-primary {
          display: inline-block;
          padding: 14px 28px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff !important;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
          border-radius: 14px;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
          text-align: center;
        }
        .footer {
          background-color: #090d16;
          padding: 28px 32px;
          text-align: center;
          font-size: 12px;
          color: #64748b;
          border-top: 1px solid #1e293b;
        }
        .footer a {
          color: #38bdf8;
          text-decoration: none;
        }
        .info-box {
          background: #1e293b;
          border-radius: 16px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid #334155;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main-card">
          <!-- HEADER -->
          <div class="header">
            <div class="logo">IO<span>NYX</span></div>
            <div class="sub-tag">FLAGSHIP E-COMMERCE</div>
          </div>

          <!-- BODY CONTENT -->
          <div class="content">
            ${badge ? `<div class="badge-pill">${badge}</div>` : ""}
            <h1 class="page-title">${title}</h1>
            ${content}
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <p style="margin:0 0 8px 0; font-weight:700; color:#94a3b8;">IONYX Enterprise Store</p>
            <p style="margin:0 0 12px 0;">Need help? Contact <a href="mailto:support@ionyx.com">support@ionyx.com</a></p>
            <p style="margin:0; font-size:11px; color:#475569;">
              © ${new Date().getFullYear()} IONYX Inc. All rights reserved. 256-Bit Encrypted Secure Communication.
            </p>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};
