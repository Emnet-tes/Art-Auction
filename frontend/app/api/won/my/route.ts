import { getAuthHeader } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
  try {
    const headers = getAuthHeader(req);
    console.log("Headers:", headers);
    if (!headers)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await axios.get(`${process.env.NEXT_BACKEND_URL}/won/my/`, {
      headers,
      withCredentials: true,
    });

    return NextResponse.json(res.data);
  } catch (error: unknown) {

    const err = error as AxiosError<{ message?: string }>;
    return NextResponse.json(
      { error: err.response?.data || err.message },
      { status: err.response?.status || 500 }
    );
  }
}