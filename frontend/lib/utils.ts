import { clsx, type ClassValue } from "clsx"
import { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAuthHeader(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : null;
}