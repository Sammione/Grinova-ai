"use client";
import React, { useState } from "react";
import { FileEdit, Sparkles, CheckCircle2, ChevronRight, RefreshCw, Layers } from "lucide-react";
import { aiApi } from "@/lib/api";

type Section = {
  id: string;
  title: string;
  content: string;
};

const DEFAULT_SECTIONS: Section[] = [
  { id: "s1", title: "Executive Summary", content: "" },
  { id: "s2", title: "Environmental Impact", content: "" },
  { id: "s3", title: "Social Responsibility", content: "" },
  { id: "s4", title: "Governance & Ethics", content: "" }
];

export default function BuilderPage() {
  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string>(DEFAULT_SECTIONS[0].id);
  
  const [framework, setFramework] = useState("GRI");
  const [promptData, setPromptData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [rewriteInstruction, setRewriteInstruction] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);

  const activeSection = sections.find(s => s.id === activeSectionId);

  const handleGenerate = async () => {
    if (!activeSection) return;
    setIsGenerating(true);
    try {
      const result = await aiApi.generateSection(activeSection.title, framework, promptData);
      
      // Update section content
      setSections(prev => prev.map(s => 
        s.id === activeSectionId 
          ? { ...s, content: typeof result.response === 'string' ? result.response : JSON.stringify(result.response, null, 2) } 
          : s
      ));
    } catch (err) {
      console.error("Generation failed", err);
      alert("Failed to generate section. Ensure OpenAI API is configured.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRewrite = async () => {
    if (!activeSection || !activeSection.content || !rewriteInstruction) return;
    setIsRewriting(true);
    try {
      const result = await aiApi.rewrite(activeSection.content, rewriteInstruction);
      
      setSections(prev => prev.map(s => 
        s.id === activeSectionId 
          ? { ...s, content: typeof result.response === 'string' ? result.response : JSON.stringify(result.response, null, 2) } 
          : s
      ));
      setRewriteInstruction("");
    } catch (err) {
      console.error("Rewrite failed", err);
      alert("Failed to rewrite content.");
    } finally {
      setIsRewriting(false);
    }
  };

  const updateContent = (val: string) => {
    setSections(prev => prev.map(s => s.id === activeSectionId ? { ...s, content: val } : s));
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Builder</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Assemble board-ready ESG reports using AI.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <FileEdit className="w-4 h-4" />
          Export Final Report
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Left Column: Outline & Controls */}
        <div className="w-80 flex flex-col gap-6 shrink-0 h-full overflow-y-auto pr-2 pb-8 custom-scrollbar">
          
          <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Document Outline
            </h3>
            <div className="space-y-2">
              {sections.map(s => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSectionId(s.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                    activeSectionId === s.id 
                      ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold' 
                      : 'bg-white/5 border border-transparent hover:bg-white/10 text-white/60 font-medium'
                  }`}
                >
                  <span className="text-sm truncate">{s.title}</span>
                  {s.content.length > 0 && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="glass p-5 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Generation
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1 block">Target Framework</label>
                <select 
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="GRI">GRI Standards</option>
                  <option value="SASB">SASB Standards</option>
                  <option value="UN SDGs">UN SDGs</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1 block">Data & Instructions (Optional)</label>
                <textarea 
                  value={promptData}
                  onChange={(e) => setPromptData(e.target.value)}
                  placeholder="e.g. Include our new 50MW solar plant metrics..."
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !activeSection}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? "Drafting..." : "Draft Section"}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Editor */}
        <div className="flex-1 flex flex-col min-w-0 glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h2 className="font-bold flex items-center gap-2">
              {activeSection?.title}
              <span className="text-[10px] uppercase font-bold tracking-widest text-white/30 border border-white/10 px-2 py-0.5 rounded-full">Editor</span>
            </h2>
          </div>
          
          <textarea
            value={activeSection?.content || ""}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Click 'Draft Section' to generate AI content, or start typing here..."
            className="flex-1 w-full bg-transparent p-6 text-white/80 leading-relaxed resize-none focus:outline-none custom-scrollbar"
          />

          <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3">
            <input 
              type="text" 
              value={rewriteInstruction}
              onChange={(e) => setRewriteInstruction(e.target.value)}
              placeholder="Tell AI how to rewrite this (e.g. 'Make it more formal')"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-purple-500/50"
            />
            <button 
              onClick={handleRewrite}
              disabled={isRewriting || !activeSection?.content || !rewriteInstruction}
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-sm font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isRewriting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              AI Rewrite
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
