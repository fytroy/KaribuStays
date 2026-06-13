import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "Karibu Stays <noreply@karibustays.co.ke>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Verify your Karibu Stays account",
    html: `
      <p>Habari! Please verify your email address to activate your Karibu Stays account.</p>
      <p><a href="${url}" style="background:#2C4A3E;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block;">Verify email</a></p>
      <p style="color:#888;font-size:12px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Karibu Stays password",
    html: `
      <p>You requested a password reset for your Karibu Stays account.</p>
      <p><a href="${url}" style="background:#C8553D;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block;">Reset password</a></p>
      <p style="color:#888;font-size:12px">This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  });
}
