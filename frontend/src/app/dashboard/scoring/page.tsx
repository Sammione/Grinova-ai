"use client";
import React, { useState, useEffect } from "react";
import { BarChart, TrendingUp, AlertCircle, Award, Target, Activity } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bubble } from 'react-chartjs-2';
import { analyticsApi } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const lineOptions = {
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
    legend: { position: 'top' as const, labels: { color: 'rgba(255,255,255,0.7)' } }
  }
};

const bubbleOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      title: { display: true, text: 'Implementation Effort (Low to High)', color: 'rgba(255,255,255,0.5)' },
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' },
      min: 0,
      max: 10
    },
    y: {
      title: { display: true, text: 'ESG Score Impact', color: 'rgba(255,255,255,0.5)' },
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)' },
      min: 0,
      max: 10
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => context.raw.title
      }
    }
  }
};

export default function ScoringPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await analyticsApi.getHistory();
        setData(history);
      } catch (err) {
        console.error("Failed to load score history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="p-8">Loading advanced analytics...</div>;
  if (!data) return <div className="p-8 text-red-400">Error loading data. Is the backend running?</div>;

  const lineData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Overall ESG Score',
        data: data.scores,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'Environmental',
        data: data.env_scores,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4,
        borderDash: [5, 5]
      },
      {
        label: 'Social',
        data: data.soc_scores,
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.4,
        borderDash: [5, 5]
      },
      {
        label: 'Governance',
        data: data.gov_scores,
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4,
        borderDash: [5, 5]
      }
    ]
  };

  const bubbleData = {
    datasets: [
      {
        label: 'Action Plans',
        data: (data.action_plans || []).map((plan: any) => ({
          x: plan.effort,
          y: plan.impact,
          r: plan.impact * 3, // radius relative to impact
          title: plan.title
        })),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Scoring & Advanced Analytics</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Deep dive into multi-dimensional trends and ROI forecasting.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-xs font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20">
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Overall Score", value: data.current_score.toFixed(1), trend: "+2.1%", icon: Award, color: "blue" },
          { label: "Industry Benchmark", value: data.industry_benchmark.toFixed(1), trend: "+7.7%", icon: BarChart, color: "purple" },
          { label: "Identified Risks", value: data.identified_risks.toString(), trend: "-2", icon: AlertCircle, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
             <div className="flex items-center justify-between mb-4">
               <div className={`p-2 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                 <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
               </div>
               <div className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full uppercase tracking-widest">{stat.trend}</div>
             </div>
             <div className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">{stat.label}</div>
             <div className="text-4xl font-bold group-hover:scale-105 transition-transform">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Line Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-3xl border border-white/5">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Granular E/S/G Trajectory
          </h3>
          <div className="h-[400px] w-full">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* Right Column: Bubble Chart */}
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Action Plan ROI Matrix
          </h3>
          <p className="text-xs text-white/40 mb-4">Focus on items in the top-left (High Impact, Low Effort).</p>
          <div className="h-[350px] w-full">
            <Bubble data={bubbleData} options={bubbleOptions} />
          </div>
        </div>
      </div>

      {/* Root Cause Timeline */}
      <div className="glass p-8 rounded-3xl border border-white/5">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          AI Root-Cause Timeline
        </h3>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {data.timeline && data.timeline.length > 0 ? data.timeline.map((event: any, i: number) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black text-white/50 group-hover:text-amber-400 group-hover:border-amber-400/50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-sm text-white/80">{event.title}</div>
                  <time className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{event.date}</time>
                </div>
                <div className="text-xs text-white/40 leading-relaxed">{event.description}</div>
              </div>
            </div>
          )) : (
            <div className="text-center text-white/40 py-8 text-sm italic">No significant events recorded yet. Run a manual assessment.</div>
          )}
        </div>
      </div>
    </div>
  );
}
