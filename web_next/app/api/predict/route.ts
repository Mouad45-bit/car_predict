// app/api/predict/route.ts

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const r = await fetch(`${process.env.ML_API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    return NextResponse.json({ error: "ML API error" }, { status: 500 });
  }

  const data = await r.json();
  return NextResponse.json(data);
}