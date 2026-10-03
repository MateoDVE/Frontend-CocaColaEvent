import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const number = (n: number) => new Intl.NumberFormat("es-CL").format(n);
export const percent = (n: number, d: number) =>
  d > 0 ? `${((n / d) * 100).toFixed(1).replace(".", ",")}%` : "—";
export const date = (s: string, tz = "America/Santiago") =>
  new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeZone: tz,
  }).format(new Date(s));
export const time = (s: string, tz = "America/Santiago") =>
  new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  }).format(new Date(s));
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map(
            (v) =>
              '"' +
              String(v)
                .replace(/^[=+@-]/, "'")
                .replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
