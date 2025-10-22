import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out successfully" });
  
  // 🧹 Clear cookie by setting it with an empty value and expired date
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    expires: new Date(0), // expire immediately
  });

  return res;
}
