// app/history/page.tsx

import { MinimalHeader } from "@/app/components/MinimalHeader";
import { readHistory } from "@/app/lib/historyCsv";

export default async function HistoryPage() {
  const rows = await readHistory(300);

  return (
    <main className="min-h-screen bg-zinc-50">
      <MinimalHeader current="history" />

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Historique des prédictions
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Total affiché : {rows.length} (les plus récentes en haut)
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold text-zinc-700">
                <tr className="[&>th]:px-3 [&>th]:py-2">
                  <th>Date</th>
                  <th>year</th>
                  <th>odometer</th>
                  <th>manufacturer</th>
                  <th>fuel</th>
                  <th>trans</th>
                  <th>type</th>
                  <th>age</th>
                  <th className="text-right">price</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-zinc-500">
                      Aucun historique pour le moment.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.ts + idx} className="[&>td]:px-3 [&>td]:py-2">
                      <td className="whitespace-nowrap text-zinc-700">
                        {new Date(r.ts).toLocaleString()}
                      </td>
                      <td>{r.year}</td>
                      <td>{r.odometer}</td>
                      <td>{r.manufacturer_id}</td>
                      <td>{r.fuel_id}</td>
                      <td>{r.transmission_id}</td>
                      <td>{r.type_id}</td>
                      <td>{r.age_car}</td>
                      <td className="text-right font-medium text-zinc-900">
                        {Number.isFinite(r.price) ? r.price.toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}