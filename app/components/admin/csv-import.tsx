"use client";
import { useState, useRef } from "react";
import { importTeamsFromCSV } from "@/app/db/actions";

export function CSVImportComponent() {
  const [division, setDivision] = useState("");
  const [season, setSeason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!file || !division || !season) return;
    setLoading(true);
    setResult(null);

    const text = await file.text();
    const res = await importTeamsFromCSV(
      text,
      Number(division),
      Number(season),
    );
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <p className="font-medium">Import teams from CSV</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Division</label>
          <input
            type="number"
            placeholder="e.g. 4"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            min={1}
            max={7}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-500">Season</label>
          <input
            type="number"
            placeholder="e.g. 13"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-500">CSV file</label>
        <input
          type="file"
          accept=".csv"
          ref={fileRef}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && <p className="text-sm text-gray-400">{file.name}</p>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!file || !division || !season || loading}
      >
        {loading ? "Importing..." : "Import"}
      </button>

      {result && (
        <p
          className={
            result.success ? "text-green-600 text-sm" : "text-red-500 text-sm"
          }
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
