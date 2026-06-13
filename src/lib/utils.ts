import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format } from "date-fns";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export const toCents = (n: number) => Math.round(n * 100);
export const fromCents = (n: number) => n / 100;

export function formatKES(cents: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency", currency: "KES", maximumFractionDigits: 0,
  }).format(fromCents(cents));
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.max(1, differenceInCalendarDays(checkOut, checkIn));
}

export function formatDate(d: Date | string, fmt = "MMM d, yyyy") {
  return format(typeof d === "string" ? new Date(d) : d, fmt);
}

export function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function calcBookingTotals(pricePerNightCents: number, cleaningFeeCents: number, nights: number) {
  const subtotal = pricePerNightCents * nights;
  const serviceFee = Math.round(subtotal * 0.08);
  const total = subtotal + cleaningFeeCents + serviceFee;
  return { subtotal, cleaningFee: cleaningFeeCents, serviceFee, total };
}
