import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "velora",
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet",
    timestamp: new Date().toISOString(),
  });
}
