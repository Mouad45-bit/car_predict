// app/history/page.tsx

import { MinimalHeader } from "@/app/components/MinimalHeader";
import { readHistory } from "@/app/lib/historyCsv";

type Option = { id: number; label: string };

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

const TYPES: Option[] = [
  { id: 0, label: "Berline" },
  { id: 1, label: "SUV" },
  { id: 2, label: "Citadine" },
  { id: 3, label: "Pickup" },
  { id: 4, label: "Break" },
  { id: 5, label: "Monospace" },
];

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

function labelOf(list: Option[], id: number) {
  return list.find((x) => x.id === id)?.label ?? `#${id}`;
}

function money(x: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    x
  );
}

export default async function HistoryPage() {
  const rows = await readHistory(300);
  const last = rows[0];

  const finitePrices = rows
    .filter((r) => Number.isFinite(r.price))
    .map((r) => r.price);
  const avgPrice =
    finitePrices.length === 0
      ? null
      : finitePrices.reduce((acc, p) => acc + p, 0) / finitePrices.length;

  return (
    <main className="min-h-screen bg-zinc-50">
      <MinimalHeader current="history" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl uppercase font-semibold tracking-tight text-zinc-900">
            historique des prédictions
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Total affiché : {rows.length}
          </p>
        </div>

        {/**/}
        <div className="flex flex-col gap-6">
          {/* Table card */}
          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="text-medium font-semibold text-zinc-900">
                Liste des recherches
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold text-zinc-700">
                  <tr className="[&>th]:px-6 [&>th]:py-2">
                    <th>Date</th>
                    <th>Année</th>
                    <th>Kilométrage</th>
                    <th>Marque</th>
                    <th>Carburant</th>
                    <th>Transmission</th>
                    <th>Type</th>
                    <th>Âge</th>
                    <th className="text-right">Prix</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-3 py-8 text-center text-zinc-500"
                      >
                        Aucun historique pour le moment.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr key={r.ts + idx} className="[&>td]:px-3 [&>td]:py-4">
                        <td className="whitespace-nowrap text-zinc-700">
                          {new Date(r.ts).toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap text-zinc-700">{r.year}</td>
                        <td className="whitespace-nowrap text-zinc-700">{r.odometer}</td>

                        <td className="whitespace-nowrap">
                          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700">
                            {labelOf(MANUFACTURERS, r.manufacturer_id)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap">
                          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700">
                            {labelOf(FUELS, r.fuel_id)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap">
                          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700">
                            {labelOf(TRANSMISSIONS, r.transmission_id)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap">
                          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs text-zinc-700">
                            {labelOf(TYPES, r.type_id)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap text-zinc-700">{r.age_car}</td>

                        <td className="text-right font-medium text-zinc-900">
                          {Number.isFinite(r.price) ? money(r.price) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Résumé card (en dessous) */}
          <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-medium font-semibold text-zinc-900">Résumé</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Quelques infos rapides sur l’historique.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-medium text-zinc-600">Total</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                  {rows.length}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-medium text-zinc-600">
                  Prix moyen
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                  {avgPrice === null || !Number.isFinite(avgPrice)
                    ? "-"
                    : money(avgPrice)}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="text-xs font-medium text-zinc-600">
                  Dernière
                </div>
                {last ? (
                  <div className="mt-2 text-sm text-zinc-700 space-y-1">
                    <div className="text-xs text-zinc-500">
                      {new Date(last.ts).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Marque:</span>{" "}
                      {labelOf(MANUFACTURERS, last.manufacturer_id)}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {labelOf(TYPES, last.type_id)}
                    </div>
                    <div>
                      <span className="font-medium">Prix:</span>{" "}
                      {Number.isFinite(last.price) ? money(last.price) : "-"}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-zinc-600">
                    Aucune donnée.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
