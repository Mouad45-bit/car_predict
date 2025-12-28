// app/api/predict/route.ts

import { NextResponse } from "next/server";
import { appendHistory } from "@/app/lib/historyCsv";

type PredictPayload = {
  year: number;
  odometer: number;
  manufacturer_id: number;
  fuel_id: number;
  transmission_id: number;
  type_id: number;
  age_car: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PredictPayload;

    // Base URL de ton API FastAPI (avec fallback local)
    const base = process.env.ML_API_URL || "http://127.0.0.1:8000";

    const r = await fetch(`${base}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await r.json();

    if (!r.ok) {
      return NextResponse.json(
        { error: data?.detail ?? data?.error ?? "ML API error" },
        { status: r.status }
      );
    }

    // On s'attend à un { price: number }
    const price = data?.price;
    if (typeof price !== "number") {
      return NextResponse.json(
        { error: "Réponse invalide du serveur (price manquant)." },
        { status: 500 }
      );
    }

    // ✅ Stocker l'historique dans le CSV
    await appendHistory({
      ...body,
      price,
    });

    // Réponse propre au frontend
    return NextResponse.json({ price }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Erreur serveur (predict)." },
      { status: 500 }
    );
  }
}