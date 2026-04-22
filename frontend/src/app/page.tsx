"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, BarChart3, Binary, Globe, ChevronRight, Zap, Target, Lock } from "lucide-react";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SustainIntel<span className="text-blue-500">.AI</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#frameworks" className="hover:text-white transition-colors">Frameworks</a>
            <a href="#pricing" className="hover:text-white transition-colors">Intelligence</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-white/90 transition-all">
              Launch Platform
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-blue-600/10 via-transparent to-transparent -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8">
              <Zap className="w-3 h-3 fill-current" />
              Next-Gen Sustainability Intelligence
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
              Automate ESG <br /> 
              <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">Reporting with AI.</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-white/50 mb-12 leading-relaxed">
              Transform raw data into board-ready sustainability reports. 
              Enterprise-grade intelligence aligned with GRI, SASB, and UN SDGs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                Start Generating
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-white/5 font-bold hover:bg-white/10 transition-all">
                Request Demo
              </button>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative px-4"
          >
            <div className="relative rounded-2xl overflow-hidden glass shadow-2xl border border-white/10">
              <div className="absolute top-0 left-0 w-full h-12 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="flex-1 text-center font-mono text-[10px] text-white/30 uppercase tracking-[0.2em]">
                  INTELLIGENCE_WORKSPACE_V1.0
                </div>
              </div>
              <div className="pt-20 pb-12 px-8 flex flex-col md:flex-row gap-8">
                 <div className="flex-1 h-64 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
                 <div className="flex-1 h-64 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
                 <div className="flex-1 h-64 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              </div>
            </div>
            
            {/* Ambient glows */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 blur-[100px] -z-10" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 blur-[100px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="py-24 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Active Organizations", value: "500+" },
              { label: "Reports Generated", value: "12,400" },
              { label: "Framework Compliance", value: "100%" },
              { label: "AI Accuracy", value: "99.8%" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold mb-2 tracking-tight">{stat.value}</div>
                <div className="text-sm font-medium text-white/40 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Enterprise Intelligence Tools</h2>
            <p className="text-white/40 max-w-xl mx-auto">Powerful modules designed for complex sustainability reporting needs.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: < Globe className="w-10 h-10 text-blue-500" />,
                title: "Live Data Ingestion",
                desc: "Seamlessly ingest CSV, Excel, and PDFs into structured ESG data points."
              },
              {
                icon: < Binary className="w-10 h-10 text-indigo-500" />,
                title: "Framework Mapping",
                desc: "Auto-align data with GRI, SASB, and UN SDGs using semantic intelligence."
              },
              {
                icon: < Shield className="w-10 h-10 text-emerald-500" />,
                title: "Audit-Ready Logs",
                desc: "Full traceability for every data point and AI-generated section."
              },
              {
                icon: < Target className="w-10 h-10 text-orange-500" />,
                title: "Scoring Engine",
                desc: "Predictive ESG readiness scores based on thousands of industry benchmarks."
              },
              {
                icon: < BarChart3 className="w-10 h-10 text-pink-500" />,
                title: "Executive Summaries",
                desc: "Generative AI creates high-impact board summaries in seconds."
              },
              {
                icon: < Lock className="w-10 h-10 text-purple-500" />,
                title: "Enterprise Security",
                desc: "SOC2 compliant data handling with role-based access control."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl glass border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed text-sm mb-6">{feature.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-white/60 group-hover:text-blue-400 transition-colors cursor-pointer">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white/50" />
            </div>
            <span className="font-bold tracking-tight text-white/70">SustainIntel</span>
          </div>
          <div className="flex gap-8 text-sm text-white/30 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Trust Center</a>
          </div>
          <div className="text-sm text-white/20">
            © 2026 SustainIntel AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
