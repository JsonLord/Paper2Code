import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "DEBUG: Submit job endpoint is active." });
}

export async function POST() {
  return NextResponse.json({ message: "DEBUG: POST received." });
}
