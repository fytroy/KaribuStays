export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/book/:path*", "/reviews/:path*"],
};
