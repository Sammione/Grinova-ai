"use client";

import React from "react";
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

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const radarData = {
  labels: ['Environmental', 'Social', 'Governance', 'Supply Chain', 'Carbon Footprint', 'Diversity'],
  datasets: [
    {
      label: 'Readiness Score',
      data: [85, 72, 90, 65, 80, 88],
      backgroundColor: 'rgba(37, 99, 235, 0.2)',
      borderColor: 'rgba(37, 99, 235, 1)',
      borderWidth: 2,
    },
  ],
};

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
            Last Sync: 12m ago
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-bold hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
            Manual Assessment
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
                <div className="text-6xl font-bold mb-6 tracking-tighter">
                  84<span className="text-white/20">.2</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-xs">
                  Your overall readiness score has improved by 4.2% since the last quarter data ingestion.
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Status</div>
                    <div className="text-sm font-bold text-emerald-400">OPTIMIZED</div>
                  </div>
                  <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-1">Risk Level</div>
                    <div className="text-sm font-bold text-amber-400">LOW</div>
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
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-white/20 italic">Collaboration</span>
                </div>
                <h3 className="text-sm font-medium text-white/50 mb-1">Active Stakeholders</h3>
                <div className="text-xl font-bold mb-4">12 Contributors</div>
                <div className="flex -space-x-3 overflow-hidden">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-black bg-white/10 border border-white/10" />
                  ))}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-black bg-white/5 text-[10px] font-bold border border-white/10">+7</div>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">3 active now</span>
                  <button className="text-[10px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors">View Teams</button>
                </div>
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
              {[
                { 
                  type: "warning", 
                  title: "Data Gap Detected", 
                  desc: "Scope 3 emissions data for Q2 is currently missing from your CSV upload.",
                  icon: AlertCircle,
                  color: "text-amber-400"
                },
                { 
                  type: "insight", 
                  title: "Performance Peak", 
                  desc: "Renewable energy usage in the Nordic region is at an all-time high of 94%.",
                  icon: TrendingUp,
                  color: "text-emerald-400"
                },
                { 
                  type: "framework", 
                  title: "SASB Alignment", 
                  desc: "Your current governance disclosures meet 100% of SASB requirements for Finance sector.",
                  icon: FileCheck,
                  color: "text-blue-400"
                }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-start gap-3">
                    <item.icon className={`w-4 h-4 mt-1 ${item.color}`} />
                    <div>
                      <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                      <p className="text-[11px] text-white/40 leading-relaxed mb-3">{item.desc}</p>
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-blue-400/0 group-hover:text-blue-400 transition-all">
                        Action required <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              {[
                { user: "Sarah K.", action: "Uploaded Q3 Financials", time: "2h ago" },
                { user: "System", action: "Generated Social Disclosure", time: "5h ago" },
                { user: "Marcus V.", action: "Updated GRI Metadata", time: "8h ago" },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">{activity.user}</div>
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
