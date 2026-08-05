import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Decode common HTML entities so markup stored in the database renders
 * correctly when injected via dangerouslySetInnerHTML.
 */
export function decodeHtmlEntities(input: string | null | undefined): string {
  if (!input) return "";
  const textarea = document.createElement("textarea");
  textarea.innerHTML = input;
  return textarea.value;
}
