"use client";
import React from "react";
import { BarChart, TrendingUp, AlertCircle, Award } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' }
    },
    x: {
      grid: { display: false },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' }
    }
  },
  plugins: {
    legend: { display: false }
  }
};

const chartData = {
  labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'],
  datasets: [
    {
      label: 'Overall ESG Score',
      data: [65, 68, 74, 80, 82, 84.2],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6,
    }
  ]
};

export default function ScoringPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Scoring & Analytics</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Predictive readiness scores and historical trends.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-xs font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Overall Score", value: "84.2", trend: "+2.1%", icon: Award, color: "blue" },
          { label: "Industry Benchmark", value: "76.5", trend: "+7.7%", icon: BarChart, color: "purple" },
          { label: "Identified Risks", value: "3", trend: "-2", icon: AlertCircle, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden">
             <div className="flex items-center justify-between mb-4">
               <div className={`p-2 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                 <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
               </div>
               <div className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">{stat.trend}</div>
             </div>
             <div className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</div>
             <div className="text-4xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass p-8 rounded-3xl border border-white/5">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Score Progression
        </h3>
        <div className="h-[400px] w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
