"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Library, 
  Search, 
  History, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Database,
  Link2,
  Loader2
} from "lucide-react";
import { aiApi } from "@/lib/api";

const IntelligencePanel = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("GRI");

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const data = await aiApi.getFrameworks();
        setFrameworks(data);
      } catch (error) {
        console.error("Failed to fetch frameworks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFrameworks();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const data = await aiApi.chat(searchQuery, selectedFramework);
      setSearchResult(data.response);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResult("Error generating response. Please check your backend connection.");
    } finally {
      setSearching(false);
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await aiApi.uploadDocument(file, selectedFramework);
      alert("Document uploaded and indexed successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Framework Intelligence</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Knowledge base for cross-framework compliance.</p>
        </div>
        <div className="flex gap-3">
           <input 
             type="file" 
             id="file-upload" 
             className="hidden" 
             onChange={handleFileUpload}
             accept=".pdf,.docx,.txt"
           />
           <label 
             htmlFor="file-upload"
             className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer"
           >
             {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
             {uploading ? "Indexing..." : "Upload Document"}
           </label>
           <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
             Add External Logic
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {frameworks.map((f, i) => (
            <motion.div 
              key={f.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass p-6 rounded-3xl border ${selectedFramework === f.id ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5'} group cursor-pointer hover:border-blue-500/30 transition-all`}
              onClick={() => setSelectedFramework(f.id)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-widest">Active</div>
              </div>
              <h3 className="text-lg font-bold mb-1">{f.id}</h3>
              <p className="text-xs text-white/40 mb-6">{f.name}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Connected</div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="glass rounded-3xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Intelligent Semantic Search</h2>
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/50 border border-white/5">
                   <select 
                    value={selectedFramework}
                    onChange={(e) => setSelectedFramework(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-bold text-white/40 uppercase tracking-widest outline-none cursor-pointer"
                   >
                      {frameworks.map(f => (
                        <option key={f.id} value={f.id}>{f.id}</option>
                      ))}
                   </select>
                </div>
              </div>

              <form onSubmit={handleSearch} className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Analyze cross-alignment between GRI 305 and SASB Greenhouse Gas Emissions..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-sm text-white focus:border-blue-500/50 outline-none transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={searching}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
                </button>
              </form>

              {searchResult && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Analysis Result</span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{searchResult}</p>
                </motion.div>
              )}

              {!searchResult && !searching && (
                <div className="space-y-4">
                   {[1,2,3].map(i => (
                     <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between">
                           <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/40 font-mono text-xs">#{i}</div>
                              <div>
                                 <h4 className="text-sm font-bold mb-1">Semantic Example #{i}</h4>
                                 <p className="text-xs text-white/30 leading-relaxed">Select a framework and ask a question to see real-time intelligence analysis.</p>
                              </div>
                           </div>
                           <ExternalLink className="w-4 h-4 text-white/10 group-hover:text-blue-400 transition-colors" />
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>

        <div className="space-y-6">
           <div className="glass rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold">Recent Inquiries</h3>
              </div>
              <div className="space-y-4">
                 {[
                   "How to report Scope 3 under IFRS S2?",
                   "GRI alignment for biodiversity impacts",
                   "SASB requirements for human capital"
                 ].map((q, i) => (
                   <div key={i} onClick={() => setSearchQuery(q)} className="text-xs font-medium text-white/40 p-3 rounded-xl bg-white/5 border border-white/5 hover:text-white/60 cursor-pointer flex justify-between items-center transition-all group">
                     {q}
                     <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white" />
                   </div>
                 ))}
              </div>
           </div>

           <div className="glass rounded-3xl p-6 border border-white/5 bg-gradient-to-br from-indigo-600/5 to-transparent">
              <div className="flex items-center gap-2 mb-4">
                <Link2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold">External Sync</h3>
              </div>
              <p className="text-xs text-white/40 leading-relaxed mb-6">
                Connect your platform to live regulatory feeds to receive real-time framework updates.
              </p>
              <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                Setup Webhooks
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligencePanel;
