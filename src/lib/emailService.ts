// Email service using Gmail API + Google Identity Services (OAuth2)
// The admin connects their Gmail account once; the access token is stored in localStorage.

declare global {
  interface Window {
    google: any;
  }
}

export interface EmailSettings {
  clientId: string;
  connectedEmail: string;
  accessToken: string;
  tokenExpiry: number; // Unix ms timestamp
}

const STORAGE_KEY = 'qwc_email_settings';
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email';

// ─── Persistence helpers ───────────────────────────────────────────────────

export const getEmailSettings = (): EmailSettings | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveEmailSettings = (settings: EmailSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const clearEmailSettings = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isTokenValid = (settings: EmailSettings): boolean => {
  return !!(settings.accessToken && Date.now() < settings.tokenExpiry - 60_000);
};

// ─── Load Google Identity Services script ─────────────────────────────────

export const loadGoogleScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const existing = document.getElementById('google-gsi');
    if (existing) { existing.addEventListener('load', () => resolve()); return; }
    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

// ─── Connect Gmail (OAuth2 token flow) ────────────────────────────────────

export const connectGmail = async (clientId: string): Promise<EmailSettings> => {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GMAIL_SCOPE,
      callback: async (response: any) => {
        if (response.error) { reject(new Error(`OAuth error: ${response.error}`)); return; }

        try {
          // Fetch the connected email address
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${response.access_token}` },
          });
          const userInfo = await userRes.json();

          const settings: EmailSettings = {
            clientId,
            connectedEmail: userInfo.email,
            accessToken: response.access_token,
            tokenExpiry: Date.now() + response.expires_in * 1000,
          };
          saveEmailSettings(settings);
          resolve(settings);
        } catch (err) {
          reject(err);
        }
      },
    });
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

// ─── Re-authenticate silently (no consent prompt) ─────────────────────────

export const refreshGmailToken = async (settings: EmailSettings): Promise<EmailSettings> => {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: settings.clientId,
      scope: GMAIL_SCOPE,
      hint: settings.connectedEmail,
      callback: (response: any) => {
        if (response.error) { reject(new Error(`Token refresh error: ${response.error}`)); return; }
        const updated: EmailSettings = {
          ...settings,
          accessToken: response.access_token,
          tokenExpiry: Date.now() + response.expires_in * 1000,
        };
        saveEmailSettings(updated);
        resolve(updated);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
  });
};

// ─── Send dispatch receipt email via Gmail API ────────────────────────────

export interface OrderForEmail {
  id: number;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  created_at: string;
  order_items?: Array<{
    quantity: number;
    price_at_sale: number;
    products?: { title: string };
  }>;
}

const buildEmailBody = (order: OrderForEmail): string => {
  const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const orderRef = `#${String(order.id).slice(-8).toUpperCase()}`;

  const itemLines = order.order_items?.map(item => {
    const name = item.products?.title || 'Product';
    const lineTotal = (item.price_at_sale * item.quantity).toLocaleString();
    return `  ${item.quantity}x  ${name.padEnd(36, ' ')}  Ksh ${lineTotal}`;
  }).join('\n') || '  (No item details available)';

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    QUINNS WELLNESS CENTRE
      ORDER RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${order.customer_name},

Thank you for your order. Below is your official receipt.

Order Reference : ${orderRef}
Date            : ${orderDate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ITEMS ORDERED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemLines}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TOTAL  :  Ksh ${Number(order.total_amount).toLocaleString()}
  SHIPPING :  FREE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅  YOUR ORDER HAS BEEN DISPATCHED

Your order is on its way to you. If you have any
questions, please reply to this email.

Warm regards,
The Quinns Wellness Centre Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Quinns Wellness Centre
  Premium Health & Wellness Supplements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
};

const encodeEmail = (from: string, to: string, name: string, subject: string, body: string): string => {
  const lines = [
    `From: Quinns Wellness Centre <${from}>`,
    `To: ${name} <${to}>`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=UTF-8`,
    '',
    body,
  ];
  const raw = lines.join('\r\n');
  return btoa(unescape(encodeURIComponent(raw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const sendDispatchReceipt = async (
  settings: EmailSettings,
  order: OrderForEmail,
): Promise<void> => {
  if (!order.customer_email) throw new Error('No customer email on this order.');

  // Auto-refresh token if expired
  let activeSettings = settings;
  if (!isTokenValid(settings)) {
    activeSettings = await refreshGmailToken(settings);
  }

  const subject = `Order Dispatched — Receipt ${`#${String(order.id).slice(-8).toUpperCase()}`} | Quinns Wellness Centre`;
  const body = buildEmailBody(order);
  const raw = encodeEmail(activeSettings.connectedEmail, order.customer_email, order.customer_name, subject, body);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${activeSettings.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gmail API error: ${res.status}`);
  }
};
