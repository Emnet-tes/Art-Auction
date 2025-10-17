import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(body),
     });

    const data = await response.json();

    if (response.status < 200 || response.status >= 300) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
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