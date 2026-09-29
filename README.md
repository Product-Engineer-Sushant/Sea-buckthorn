# Sea Buckthorn React + Nodemailer Order Website

## What changed
The WhatsApp order flow has been replaced with:
React order form → Express API → Nodemailer SMTP → your email inbox.

SMTP credentials are kept on the server in `.env` and are never sent to the browser.

## 1. Install
Node.js 18+ recommended.

```bash
npm install
```

## 2. Configure email
Copy `.env.example` to `.env`.

For Gmail, use:
- SMTP_HOST=smtp.gmail.com
- SMTP_PORT=587
- SMTP_SECURE=false
- SMTP_USER=your Gmail address
- SMTP_PASS=your Gmail App Password
- ORDER_EMAIL=the inbox where you want orders

### Gmail App Password
Do NOT put your normal Gmail password in `.env`.
Turn on 2-Step Verification on your Google account and create a Google App Password, then put the 16-character app password in `SMTP_PASS`.

For other providers, replace the SMTP host/port/security values with that provider's SMTP settings.

## 3. Run both frontend and backend

```bash
npm run dev
```

This starts:
- React/Vite: http://localhost:5173
- Express/Nodemailer API: http://localhost:5000

Open http://localhost:5173.

## 4. Test
Fill the order form and click "Confirm Order & Send Email".
The server sends the order details to `ORDER_EMAIL`.

## 5. Production

Vite's `/api` proxy only works locally. The order form needs the Express server,
because the server sends the email.

### One Node service (recommended)

Deploy this repository to Render, Railway, or another Node host.

- Build command: `npm run build`
- Start command: `npm start`
- Add `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and
  `ORDER_EMAIL` in the host's environment-variable dashboard.
- Optionally set `CLIENT_ORIGIN` to the public site URL (comma-separate multiple
  allowed frontend URLs).

The server now serves the compiled `dist` site and API together, so no API URL is
needed for this layout.

### Separate frontend and backend deployments

Deploy the backend using `npm start` and set its SMTP variables. On the frontend
host, set `VITE_API_URL=https://your-public-api-domain.com` **before** building
and redeploy. Set `CLIENT_ORIGIN` on the backend to the frontend's exact public
URL. Never use `localhost` in production values, and never commit `.env`.
