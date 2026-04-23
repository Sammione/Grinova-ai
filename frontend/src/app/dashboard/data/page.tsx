"use client";
import React from "react";
import { Database } from "lucide-react";

export default function DataIngestionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
        <Database className="w-12 h-12 text-emerald-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Ingestion</h1>
        <p className="text-white/40 max-w-md mx-auto">Connect directly to your ERP systems, or upload bulk CSVs for automated data structuring and semantic mapping.</p>
      </div>
      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-xl bg-emerald-600 text-sm font-bold hover:bg-emerald-700 transition-all">
          Connect ERP
        </button>
        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
          Manual Upload
        </button>
      </div>
    </div>
  );
}
