import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 🔒 Read the refresh token from cookies
    const cookieHeader = req.headers.get("cookie");
    const refreshToken = cookieHeader
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // 🔄 Request new access token from Django backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const { access } = await response.json();

    return NextResponse.json({ access }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
  }
}
