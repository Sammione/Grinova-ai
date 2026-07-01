"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertCircle, 
  FileCheck, 
  Users, 
  History, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { analyticsApi } from "@/lib/api";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const radarOptions = {
  scales: {
    r: {
      angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      pointLabels: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 10 } },
      ticks: { display: false },
      suggestedMin: 0,
      suggestedMax: 100
    }
  },
  plugins: {
    legend: { display: false }
  }
};

const DashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);

  const fetchStats = async () => {
    try {
      const stats = await analyticsApi.getStats();
      setData(stats);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleManualAssessment = async () => {
    setAssessing(true);
    try {
      await analyticsApi.triggerScore();
      await fetchStats();
      alert("Manual Assessment Completed! The AI has processed the latest data.");
    } catch (err) {
      console.error("Assessment failed", err);
      alert("Assessment failed: " + err);
    } finally {
      setAssessing(false);
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (!data) return <div className="p-8 text-red-400">Error loading data. Is the backend running?</div>;

  const radarData = {
    labels: ['Environmental', 'Social', 'Governance', 'Supply Chain', 'Carbon Footprint', 'Diversity'],
    datasets: [
      {
        label: 'Readiness Score',
        data: data.radar_data,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Intelligence Overview</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">System status: All models operational</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/60">
            {data.organization.name}
          </div>
          <button 
            onClick={handleManualAssessment}
            disabled={assessing}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-bold hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50">
            {assessing ? "Assessing..." : "Manual Assessment"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Large Scoring Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="flex-1">
                <span className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2 block">Enterprise Assessment</span>
                <h2 className="text-4xl font-bold mb-4">ESG Readiness Index</h2>
                <div className="flex items-end gap-3 mb-6">
                  <div className="text-6xl font-bold tracking-tighter">
                    {data.organization.overall_score.toFixed(1)}
                  </div>
                  {data.forecast_score && (
                    <div className="pb-1">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Forecast</div>
                      <div className="text-xl font-bold text-blue-300">↗ {data.forecast_score.toFixed(1)}</div>
                    </div>
                  )}
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
                  Your overall readiness score has improved significantly since the last quarter data ingestion.
                </p>
                {data.industry_benchmark && (
                  <div className="mb-8 p-3 rounded-xl bg-white/5 border border-white/10 max-w-xs flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${data.organization.overall_score >= data.industry_benchmark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Industry Benchmark</div>
                      <div className="text-sm font-bold">
                        {data.organization.overall_score >= data.industry_benchmark ? '+' : ''}{(data.organization.overall_score - data.industry_benchmark).toFixed(1)} pts vs avg ({data.industry_benchmark})
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Status</div>
                    <div className="text-sm font-bold text-emerald-400 uppercase">{data.organization.status}</div>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Risk Level</div>
                    <div className="text-sm font-bold text-amber-400 uppercase">{data.organization.risk_level}</div>
                  </div>
                </div>
              </div>
              
              <div className="w-64 h-64 md:w-80 md:h-80">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass rounded-3xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <FileCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-white/20 italic">Reporting Status</span>
                </div>
                <h3 className="text-sm font-medium text-white/50 mb-1">Current Framework</h3>
                <div className="text-xl font-bold mb-4">GRI Standards 2024</div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-[75%] h-full bg-blue-500 rounded-full" />
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">75% Complete</span>
                  <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">Resume Build</button>
                </div>
             </div>

             <div className="glass rounded-3xl p-6 border border-white/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-white/20 italic">AI Generated</span>
                </div>
                <h3 className="text-sm font-medium text-white/50 mb-4">Recommended Action Plans</h3>
                
                {data.action_plans && data.action_plans.length > 0 ? (
                  <div className="space-y-3">
                    {data.action_plans.map((plan: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 group">
                        <div className="text-xs font-bold mb-1 text-white/80 group-hover:text-blue-400 transition-colors">{plan.title}</div>
                        <div className="text-[10px] text-white/40 line-clamp-2 leading-relaxed">{plan.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-white/40 italic">Run a manual assessment to generate action plans.</div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column - AI Insights & Activity */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-blue-600/5 to-transparent">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold">AI Intelligence Panel</h3>
            </div>
            
            <div className="space-y-4">
              {data.insights.map((item: any, i: number) => {
                const Icon = item.type === 'warning' ? AlertCircle : (item.type === 'insight' ? TrendingUp : FileCheck);
                const color = item.type === 'warning' ? 'text-amber-400' : (item.type === 'insight' ? 'text-emerald-400' : 'text-blue-400');
                return (
                  <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <Icon className={`w-4 h-4 mt-1 ${color}`} />
                      <div>
                        <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                        <p className="text-[11px] text-white/40 leading-relaxed mb-3">{item.description}</p>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-400/0 group-hover:text-blue-400 transition-all">
                          Action required <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              View All Intelligence
            </button>
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-white/40" />
                <h3 className="font-bold text-white/70">Recent Activity</h3>
              </div>
            </div>
            <div className="space-y-6">
              {data.activities.map((activity: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{activity.user_name}</div>
                    <div className="text-[11px] text-white/40">{activity.action}</div>
                  </div>
                  <div className="text-[10px] font-medium text-white/20 whitespace-nowrap">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
