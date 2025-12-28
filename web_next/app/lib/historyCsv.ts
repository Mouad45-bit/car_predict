// app/lib/historyCsv.ts

import fs from "fs/promises";
import path from "path";

export type HistoryRow = {
  ts: string;
  year: number;
  odometer: number;
  manufacturer_id: number;
  fuel_id: number;
  transmission_id: number;
  type_id: number;
  age_car: number;
  price: number;
};

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "predictions_history.csv");

const HEADER =
  "ts,year,odometer,manufacturer_id,fuel_id,transmission_id,type_id,age_car,price\n";

async function ensureCsvExists() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(CSV_PATH, HEADER, "utf-8");
  }
}

export async function appendHistory(row: Omit<HistoryRow, "ts">) {
  await ensureCsvExists();
  const ts = new Date().toISOString();

  const line =
    `${ts},${row.year},${row.odometer},${row.manufacturer_id},${row.fuel_id},` +
    `${row.transmission_id},${row.type_id},${row.age_car},${row.price}\n`;

  await fs.appendFile(CSV_PATH, line, "utf-8");
}

export async function readHistory(limit = 200): Promise<HistoryRow[]> {
  await ensureCsvExists();
  const content = await fs.readFile(CSV_PATH, "utf-8");

  const lines = content.split("\n").filter(Boolean);
  if (lines.length <= 1) return [];

  // Skip header
  const dataLines = lines.slice(1);

  const rows: HistoryRow[] = [];
  for (const l of dataLines) {
    const parts = l.split(",");
    if (parts.length !== 9) continue;

    const [ts, year, odometer, manufacturer_id, fuel_id, transmission_id, type_id, age_car, price] =
      parts;

    rows.push({
      ts,
      year: Number(year),
      odometer: Number(odometer),
      manufacturer_id: Number(manufacturer_id),
      fuel_id: Number(fuel_id),
      transmission_id: Number(transmission_id),
      type_id: Number(type_id),
      age_car: Number(age_car),
      price: Number(price),
    });
  }

  // Les plus récents en haut
  rows.sort((a, b) => (a.ts < b.ts ? 1 : -1));

  return rows.slice(0, limit);
}

export async function getCsvPath() {
  await ensureCsvExists();
  return CSV_PATH;
}