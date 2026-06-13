import Link from "next/link";

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { verified?: string; token?: string };
}) {
  if (searchParams.token) {
    // NextAuth's verify-email API handles the token; this page shows after redirect
  }

  if (searchParams.verified === "1") {
    return (
      <div className="container-narrow py-20 max-w-md text-center">
        <p className="text-5xl mb-6">✓</p>
        <h1 className="display-lg mb-4">Email verified</h1>
        <p className="text-sm text-ink-700/70 mb-8">Your account is now fully active.</p>
        <Link href="/" className="btn-primary">Go to home</Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-20 max-w-md text-center">
      <h1 className="display-lg mb-4">Check your inbox</h1>
      <p className="text-sm text-ink-700/70">
        We sent a verification link to your email address. Click it to activate your account.
      </p>
      <p className="mt-6 text-xs text-ink-700/50">Didn't receive it? Check your spam folder or contact support.</p>
    </div>
  );
}
