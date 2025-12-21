// app/page.tsx

"use client";

import { useMemo, useState } from "react";

type PredictPayload = {
  year: number;
  odometer: number;
  manufacturer_id: number;
  fuel_id: number;
  transmission_id: number;
  type_id: number;
  age_car: number;
};

export default function HomePage() {
  const [form, setForm] = useState<PredictPayload>({
    year: 2016,
    odometer: 70549,
    manufacturer_id: 0,
    fuel_id: 1,
    transmission_id: 0,
    type_id: 2,
    age_car: 9,
  });

  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      Number.isFinite(form.year) &&
      Number.isFinite(form.odometer) &&
      Number.isFinite(form.manufacturer_id) &&
      Number.isFinite(form.fuel_id) &&
      Number.isFinite(form.transmission_id) &&
      Number.isFinite(form.type_id) &&
      Number.isFinite(form.age_car)
    );
  }, [form]);

  function setNumber<K extends keyof PredictPayload>(key: K, value: string) {
    const n = value === "" ? NaN : Number(value);
    setForm((prev) => ({ ...prev, [key]: n }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPrice(null);

    if (!canSubmit) {
      setError("Veuillez remplir correctement tous les champs (valeurs numériques).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error ?? "Erreur lors de la prédiction.");
        return;
      }

      if (typeof data?.price !== "number") {
        setError("Réponse invalide du serveur (price manquant).");
        return;
      }

      setPrice(data.price);
    } catch (err: any) {
      setError("Impossible de contacter le serveur. Vérifie que Next.js et FastAPI sont lancés.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Car Price Predictor
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Teste ton modèle ML : remplis les caractéristiques et récupère une estimation du prix.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form card */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Entrées du modèle</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Les champs correspondent exactement aux features attendues par l’API.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                /api/predict
              </span>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Année (year)"
                  value={form.year}
                  onChange={(v) => setNumber("year", v)}
                  placeholder="ex: 2016"
                />
                <Field
                  label="Kilométrage (odometer)"
                  value={form.odometer}
                  onChange={(v) => setNumber("odometer", v)}
                  placeholder="ex: 70549"
                />

                <Field
                  label="Marque ID (manufacturer_id)"
                  value={form.manufacturer_id}
                  onChange={(v) => setNumber("manufacturer_id", v)}
                  placeholder="ex: 0"
                />
                <Field
                  label="Carburant ID (fuel_id)"
                  value={form.fuel_id}
                  onChange={(v) => setNumber("fuel_id", v)}
                  placeholder="ex: 1"
                />

                <Field
                  label="Transmission ID (transmission_id)"
                  value={form.transmission_id}
                  onChange={(v) => setNumber("transmission_id", v)}
                  placeholder="ex: 0"
                />
                <Field
                  label="Type ID (type_id)"
                  value={form.type_id}
                  onChange={(v) => setNumber("type_id", v)}
                  placeholder="ex: 2"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Âge voiture (age_car)"
                    value={form.age_car}
                    onChange={(v) => setNumber("age_car", v)}
                    placeholder="ex: 9"
                  />
                </div>
              </div>

              {/* Feedback */}
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Prédiction..." : "Prédire le prix"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      year: 2016,
                      odometer: 70549,
                      manufacturer_id: 0,
                      fuel_id: 1,
                      transmission_id: 0,
                      type_id: 2,
                      age_car: 9,
                    });
                    setPrice(null);
                    setError(null);
                  }}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </section>

          {/* Result card */}
          <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-900">Résultat</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Estimation renvoyée par le modèle.
            </p>

            <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              {price === null ? (
                <div>
                  <div className="text-sm text-zinc-600">Aucune prédiction pour le moment.</div>
                  <div className="mt-2 text-xs text-zinc-500">
                    Clique sur <span className="font-medium">“Prédire le prix”</span>.
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-medium text-zinc-600">Prix estimé</div>
                  <div className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
                    {price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="mt-2 text-xs text-zinc-500">
                    (Valeur brute retournée par l’API)
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 text-xs text-zinc-500">
              Astuce : si tu vois une erreur, vérifie que <span className="font-medium">FastAPI</span>{" "}
              tourne sur <span className="font-medium">localhost:8000</span> et que ta route Next{" "}
              <span className="font-medium">/api/predict</span> est bien créée.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field(props: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { label, value, onChange, placeholder } = props;

  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      <input
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
      />
    </label>
  );
}