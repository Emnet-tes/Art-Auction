import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const { access, refresh } = await response.json();

    // ✅ Create NextResponse
    const res = NextResponse.json(
      { message: "Login successful", token: access }, // return token too for test
      { status: 200 }
    );

    // ✅ Attach cookie (plain http → secure: false)
    res.cookies.set("token", refresh, {
      httpOnly: true,
      secure: false,         // 🚨 required for plain http
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,  // 1 day
    });


    return res;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return NextResponse.json(
        { error: err.response?.data || "Login failed" },
        { status: err.response?.status || 500 }
      );
    }
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
