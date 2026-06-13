/**
 * M-Pesa Daraja API client — STK Push (Lipa Na M-Pesa Online)
 * Sandbox docs: https://developer.safaricom.co.ke/docs
 */
import axios from "axios";

const MPESA_BASE_URLS = {
  sandbox: "https://sandbox.safaricom.co.ke",
  production: "https://api.safaricom.co.ke",
} as const;

type Env = keyof typeof MPESA_BASE_URLS;
function env(): Env { return (process.env.MPESA_ENV as Env) || "sandbox"; }
function baseUrl() { return MPESA_BASE_URLS[env()]; }

/** Normalize Kenyan phone to 2547XXXXXXXX format. */
export function normalizeMpesaPhone(raw: string): string {
  let p = raw.replace(/\D/g, "");
  if (p.startsWith("0")) p = "254" + p.slice(1);
  if (p.startsWith("7") || p.startsWith("1")) p = "254" + p;
  if (p.startsWith("+254")) p = p.slice(1);
  if (!p.startsWith("254") || p.length !== 12) {
    throw new Error(`Invalid M-Pesa phone number: ${raw}`);
  }
  return p;
}

function darajaTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return d.getFullYear().toString() + pad(d.getMonth() + 1) + pad(d.getDate()) +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}

function stkPassword(timestamp: string) {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  return Buffer.from(shortcode + passkey + timestamp).toString("base64");
}

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) return cachedToken.value;
  const key = process.env.MPESA_CONSUMER_KEY!;
  const secret = process.env.MPESA_CONSUMER_SECRET!;
  if (!key || !secret) throw new Error("Missing MPESA_CONSUMER_KEY / MPESA_CONSUMER_SECRET");
  const basic = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await axios.get(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${basic}` } }
  );
  const token = res.data.access_token as string;
  const expiresIn = Number(res.data.expires_in ?? 3599);
  cachedToken = { value: token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

export interface STKPushInput {
  phone: string;
  amount: number;
  reference: string;
  description: string;
  callbackUrl?: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export async function initiateSTKPush(input: STKPushInput): Promise<STKPushResponse> {
  const token = await getAccessToken();
  const timestamp = darajaTimestamp();
  const password = stkPassword(timestamp);
  const phone = normalizeMpesaPhone(input.phone);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const callbackUrl = input.callbackUrl || process.env.MPESA_CALLBACK_URL!;
  if (!callbackUrl) throw new Error("Missing MPESA_CALLBACK_URL");
  const amount = Math.max(1, Math.round(input.amount));

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortcode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: input.reference.slice(0, 12),
    TransactionDesc: input.description.slice(0, 13),
  };

  try {
    const res = await axios.post(
      `${baseUrl()}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data as STKPushResponse;
  } catch (err: any) {
    const data = err?.response?.data ?? { message: err?.message };
    throw new Error(`STK Push failed: ${JSON.stringify(data)}`);
  }
}

export async function querySTKStatus(checkoutRequestId: string) {
  const token = await getAccessToken();
  const timestamp = darajaTimestamp();
  const password = stkPassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const res = await axios.post(
    `${baseUrl()}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export interface STKCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: { Item: Array<{ Name: string; Value?: string | number }> };
    };
  };
}

export function parseSTKCallback(body: STKCallbackBody) {
  const cb = body.Body.stkCallback;
  const items = cb.CallbackMetadata?.Item ?? [];
  const getItem = (name: string) => items.find((i) => i.Name === name)?.Value;
  return {
    merchantRequestId: cb.MerchantRequestID,
    checkoutRequestId: cb.CheckoutRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
    amount: Number(getItem("Amount") ?? 0),
    mpesaReceiptNumber: getItem("MpesaReceiptNumber") as string | undefined,
    transactionDate: getItem("TransactionDate") as number | undefined,
    phoneNumber: getItem("PhoneNumber") as number | undefined,
  };
}
