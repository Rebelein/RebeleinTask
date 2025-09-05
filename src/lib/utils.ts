import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { de } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd. MMM, yyyy", { locale: de });
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd. MMM yyyy, HH:mm", { locale: de });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), "HH:mm 'Uhr'", { locale: de });
}

export function formatSeconds(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const hDisplay = h > 0 ? h + "h " : "";
  const mDisplay = m > 0 ? m + "m " : "";
  const sDisplay = s > 0 ? s + "s" : "";

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  if (s > 0) {
    return `${s}s`;
  }
  
  return "0s";
}
