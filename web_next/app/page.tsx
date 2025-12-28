// app/page.tsx
"use client";

import { MinimalHeader } from "./components/MinimalHeader";
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

type Option = {
  id: number;
  label: string;
};

// 8 marques (manufacturer_id: 0..7) — EXEMPLES réalistes
const MANUFACTURERS: Option[] = [
  { id: 0, label: "Dacia" },
  { id: 1, label: "Renault" },
  { id: 2, label: "Peugeot" },
  { id: 3, label: "Volkswagen" },
  { id: 4, label: "Hyundai" },
  { id: 5, label: "Toyota" },
  { id: 6, label: "Kia" },
  { id: 7, label: "BMW" },
];

// 6 types (type_id: 0..5) — EXEMPLES réalistes
const TYPES: Option[] = [
  { id: 0, label: "Berline" },
  { id: 1, label: "SUV" },
  { id: 2, label: "Citadine" },
  { id: 3, label: "Pickup" },
  { id: 4, label: "Break" },
  { id: 5, label: "Monospace" },
];

// Carburant + Transmission (labels réels)
const FUELS: Option[] = [
  { id: 0, label: "Essence" },
  { id: 1, label: "Diesel" },
  { id: 2, label: "Électrique" },
  { id: 3, label: "Hybride" },
];

const TRANSMISSIONS: Option[] = [
  { id: 0, label: "Manuelle" },
  { id: 1, label: "Automatique" },
];

export default function HomePage() {
  const CURRENT_YEAR = new Date().getFullYear();

  const [form, setForm] = useState<PredictPayload>({
    year: 2016,
    odometer: 70549,
    manufacturer_id: 0,
    fuel_id: 1,
    transmission_id: 0,
    type_id: 2,
    age_car: Math.max(0, CURRENT_YEAR - 2016),
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
      Number.isFinite(form.type_id)
    );
  }, [form]);

  function setNumber<K extends keyof PredictPayload>(key: K, value: string) {
    const n = value === "" ? NaN : Number(value);
    setForm((prev) => ({ ...prev, [key]: n }));
  }

  function setSelect<K extends keyof PredictPayload>(key: K, value: string) {
    const n = Number(value);
    setForm((prev) => ({ ...prev, [key]: n }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPrice(null);

    if (!canSubmit) {
      setError("Veuillez remplir correctement tous les champs (valeurs valides).");
      return;
    }

    const age_car = Number.isFinite(form.year)
      ? Math.max(0, CURRENT_YEAR - form.year)
      : NaN;

    const payload: PredictPayload = {
      ...form,
      age_car,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    } catch {
      setError("Impossible de contacter le serveur. Vérifie que Next.js et FastAPI sont lancés.");
    } finally {
      setLoading(false);
    }
  }

  const computedAge = Number.isFinite(form.year)
    ? Math.max(0, CURRENT_YEAR - form.year)
    : NaN;

  return (
    <main className="min-h-screen bg-zinc-50">
      <MinimalHeader current="home" />

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl uppercase font-semibold tracking-tight text-zinc-900">
            prédiction du prix
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Remplis les caractéristiques et récupère une estimation du prix.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Form card */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-medium font-semibold text-zinc-900">Entrées du modèle</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Année (ex: 2016)"
                  value={form.year}
                  onChange={(v) => {
                    setNumber("year", v);
                    setForm((prev) => {
                      const yy = v === "" ? NaN : Number(v);
                      return {
                        ...prev,
                        year: yy,
                        age_car: Number.isFinite(yy) ? Math.max(0, CURRENT_YEAR - yy) : NaN,
                      };
                    });
                  }}
                  placeholder="ex: 2016"
                />

                <Field
                  label="Kilométrage (en km)"
                  value={form.odometer}
                  onChange={(v) => setNumber("odometer", v)}
                  placeholder="ex: 70549"
                />

                <SelectField
                  label="Marque"
                  value={form.manufacturer_id}
                  onChange={(v) => setSelect("manufacturer_id", v)}
                  options={MANUFACTURERS}
                />

                <SelectField
                  label="Carburant"
                  value={form.fuel_id}
                  onChange={(v) => setSelect("fuel_id", v)}
                  options={FUELS}
                />

                <SelectField
                  label="Transmission"
                  value={form.transmission_id}
                  onChange={(v) => setSelect("transmission_id", v)}
                  options={TRANSMISSIONS}
                />

                <SelectField
                  label="Type de voiture"
                  value={form.type_id}
                  onChange={(v) => setSelect("type_id", v)}
                  options={TYPES}
                />

                <Field
                  label="Âge (calculé automatiquement)"
                  value={computedAge}
                  onChange={() => {}}
                  placeholder="auto"
                  disabled
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                      age_car: Math.max(0, CURRENT_YEAR - 2016),
                    });
                    setPrice(null);
                    setError(null);
                  }}
                  className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Réinitialiser
                </button>
              </div>
            </form>
          </section>

          {/* Result card */}
          <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-medium font-semibold text-zinc-900">Résultat</h2>
            <p className="mt-1 text-sm text-zinc-600">Estimation renvoyée par le modèle.</p>

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
                  <div className="mt-2 text-xs text-zinc-500">(Valeur brute retournée par l’API)</div>
                </div>
              )}
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
  disabled?: boolean;
}) {
  const { label, value, onChange, placeholder, disabled } = props;

  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      <input
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode="numeric"
        disabled={disabled}
        className={[
          "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400",
          "focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200",
          disabled ? "cursor-not-allowed bg-zinc-50 text-zinc-600" : "",
        ].join(" ")}
      />
    </label>
  );
}

function SelectField(props: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  options: Option[];
}) {
  const { label, value, onChange, options } = props;

  return (
    <label className="block">
      <span className="text-xs font-medium text-zinc-700">{label}</span>

      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-10 text-sm text-zinc-900 shadow-sm outline-none",
            "focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200",
          ].join(" ")}
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </label>
  );
}