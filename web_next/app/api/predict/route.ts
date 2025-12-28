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
  const base = process.env.ML_API_URL || "http://127.0.0.1:8000";

  // Timeout (sinon fetch peut attendre à l'infini)
  const controller = new AbortController();
  const timeoutMs = 8000;
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const body = (await req.json()) as PredictPayload;

    console.log("[/api/predict] -> calling ML API:", `${base}/predict`, body);

    const r = await fetch(`${base}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await r.text(); // plus robuste que r.json() (évite plantage si HTML)
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    console.log("[/api/predict] <- ML API status:", r.status, data);

    if (!r.ok) {
      return NextResponse.json(
        { error: data?.detail ?? data?.error ?? `ML API error (${r.status})` },
        { status: 500 }
      );
    }

    const price = data?.price;
    if (typeof price !== "number") {
      return NextResponse.json(
        { error: "Réponse invalide du serveur (price manquant)." },
        { status: 500 }
      );
    }

    // ✅ Lancer l'écriture CSV sans bloquer la réponse (évite le “freeze”)
    appendHistory({ ...body, price }).catch((err) => {
      console.error("[/api/predict] appendHistory failed:", err);
    });

    return NextResponse.json({ price }, { status: 200 });
  } catch (e: any) {
    const msg =
      e?.name === "AbortError"
        ? `Timeout: l'API ML ne répond pas après ${timeoutMs}ms.`
        : `Erreur serveur (predict): ${e?.message ?? String(e)}`;

    console.error("[/api/predict] error:", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  } finally {
    clearTimeout(t);
  }
}