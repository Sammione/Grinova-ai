"use client";
import React from "react";
import { BarChart } from "lucide-react";

export default function ScoringPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
      <div className="p-6 rounded-3xl bg-purple-500/10 border border-purple-500/20">
        <BarChart className="w-12 h-12 text-purple-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">ESG Scoring & Analytics</h1>
        <p className="text-white/40 max-w-md mx-auto">Dive deeper into your predictive readiness scores. View historical trends and compare against industry benchmarks.</p>
      </div>
    </div>
  );
}
