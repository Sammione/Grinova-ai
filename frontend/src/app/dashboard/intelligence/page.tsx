"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Library,
  Search,
  History,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Database,
  Link2,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Upload,
} from "lucide-react";
import { aiApi } from "@/lib/api";

// ── Inline toast types ──────────────────────────────────────────────────────
type ToastStatus = "success" | "error" | "loading";
interface Toast {
  id: number;
  status: ToastStatus;
  title: string;
  desc?: string;
}

let toastCounter = 0;

// ── Component ─────────────────────────────────────────────────────────────
const IntelligencePanel = () => {
  const [frameworks, setFrameworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState("GRI");

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: number; name: string; framework: string }[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Backend connection state
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const addToast = (status: ToastStatus, title: string, desc?: string): number => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, status, title, desc }]);
    if (status !== "loading") {
      setTimeout(() => removeToast(id), 5000);
    }
    return id;
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateToast = (id: number, update: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...update } : t))
    );
    if (update.status && update.status !== "loading") {
      setTimeout(() => removeToast(id), 5000);
    }
  };

  useEffect(() => {
    const fetchFrameworks = async () => {
      try {
        const data = await aiApi.getFrameworks();
        setFrameworks(data);
        setBackendOnline(true);
      } catch (error) {
        console.error("Failed to fetch frameworks:", error);
        setBackendOnline(false);
        // Fall back to static list so UI still renders
        setFrameworks([
          { id: "GRI", name: "Global Reporting Initiative" },
          { id: "SASB", name: "Sustainability Accounting Standards Board" },
          { id: "TCFD", name: "Task Force on Climate-related Financial Disclosures" },
          { id: "IFRS", name: "IFRS Sustainability Disclosure Standards" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    const fetchDocuments = async () => {
      try {
        const docs = await aiApi.getDocuments();
        setUploadedFiles(docs);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
    };
    fetchFrameworks();
    fetchDocuments();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResult(null);
    try {
      const data = await aiApi.chat(searchQuery, selectedFramework);
      setSearchResult(data.response);
    } catch (error: any) {
      const msg =
        error?.response?.data?.detail ||
        "Could not reach the backend. Make sure the server is running.";
      setSearchResult(`⚠️ Error: ${msg}`);
    } finally {
      setSearching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-uploaded if needed
    e.target.value = "";

    const toastId = addToast(
      "loading",
      `Uploading ${file.name}…`,
      "Extracting text and creating embeddings"
    );
    setUploading(true);

    try {
      await aiApi.uploadDocument(file, selectedFramework);
      updateToast(toastId, {
        status: "success",
        title: "Document indexed",
        desc: `${file.name} is now searchable under ${selectedFramework}`,
      });
      // Refresh documents
      const docs = await aiApi.getDocuments();
      setUploadedFiles(docs);
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ||
        "Upload failed. Check that the backend is running and the OpenAI API key is valid.";
      updateToast(toastId, {
        status: "error",
        title: "Upload failed",
        desc: detail,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await aiApi.deleteDocument(id);
      setUploadedFiles(prev => prev.filter(f => f.id !== id));
      addToast("success", "Document deleted");
    } catch (error) {
      addToast("error", "Failed to delete document");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Toast stack */}
      <div className="fixed top-6 right-6 z-50 space-y-3 min-w-[320px] max-w-[400px]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                toast.status === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : toast.status === "error"
                  ? "bg-red-500/10 border-red-500/30"
                  : "bg-blue-500/10 border-blue-500/30"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {toast.status === "success" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {toast.status === "error" && (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                {toast.status === "loading" && (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">{toast.title}</p>
                {toast.desc && (
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{toast.desc}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/20 hover:text-white/60 text-xs flex-shrink-0"
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Framework Intelligence</h1>
          <p className="text-white/40 mt-1 text-sm font-medium flex items-center gap-2">
            Knowledge base for cross-framework compliance.
            {backendOnline === false && (
              <span className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                ⚠ Backend offline
              </span>
            )}
            {backendOnline === true && (
              <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ● Backend connected
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Framework selector for upload */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/50">
            <span>Upload to:</span>
            <select
              value={selectedFramework}
              onChange={(e) => setSelectedFramework(e.target.value)}
              className="bg-transparent border-none outline-none text-white cursor-pointer"
            >
              {frameworks.map((f) => (
                <option key={f.id} value={f.id} className="bg-black">
                  {f.id}
                </option>
              ))}
            </select>
          </div>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.docx,.txt"
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className={`px-5 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              uploading
                ? "bg-blue-600/20 border-blue-500/30 text-blue-400 cursor-not-allowed"
                : "bg-white/5 border-white/10 hover:bg-white/10 cursor-pointer"
            }`}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Indexing…" : "Upload Document"}
          </label>
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20">
            Add External Logic
          </button>
        </div>
      </div>

      {/* Framework Cards */}
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
              className={`glass p-6 rounded-3xl border ${
                selectedFramework === f.id
                  ? "border-blue-500/50 bg-blue-500/10"
                  : "border-white/5"
              } group cursor-pointer hover:border-blue-500/30 transition-all`}
              onClick={() => setSelectedFramework(f.id)}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-2 rounded-xl bg-blue-600/10 border border-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-widest">
                  {selectedFramework === f.id ? "Selected" : "Active"}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">{f.id}</h3>
              <p className="text-xs text-white/40 mb-6">{f.name}</p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Connected
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Uploaded Documents list */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5"
        >
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Indexed Documents ({uploadedFiles.length})
          </h3>
          <div className="space-y-2">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5 group"
              >
                <div className="flex items-center gap-2 text-white/70">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-medium">{f.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white/30 font-bold uppercase tracking-widest">
                    {f.framework}
                  </span>
                  <button 
                    onClick={() => handleDeleteDocument(f.id)}
                    className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Search panel */}
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
                  {frameworks.map((f) => (
                    <option key={f.id} value={f.id} className="bg-black">
                      {f.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask anything about your uploaded documents or ESG frameworks…"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-24 text-sm text-white focus:border-blue-500/50 outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
              </button>
            </form>

            {/* Search result */}
            <AnimatePresence mode="wait">
              {searching && (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/5"
                >
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-400">Analyzing…</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      Retrieving relevant document chunks and generating response
                    </p>
                  </div>
                </motion.div>
              )}

              {searchResult && !searching && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-6 rounded-2xl border transition-all ${
                    searchResult.startsWith("⚠️")
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-blue-500/20 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        searchResult.startsWith("⚠️")
                          ? "bg-red-500"
                          : "bg-blue-500 animate-pulse"
                      }`}
                    />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                      {searchResult.startsWith("⚠️") ? "Error" : "AI Analysis Result"}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                    {searchResult}
                  </p>
                </motion.div>
              )}

              {!searchResult && !searching && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {[
                    "How to report Scope 3 emissions under IFRS S2?",
                    "GRI alignment for biodiversity and ecosystem impacts",
                    "SASB requirements for human capital disclosures",
                  ].map((q, i) => (
                    <div
                      key={i}
                      onClick={() => setSearchQuery(q)}
                      className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/40 font-mono text-xs flex-shrink-0">
                          #{i + 1}
                        </div>
                        <p className="text-sm text-white/50 group-hover:text-white/80 transition-colors">
                          {q}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/10 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right column */}
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
                "SASB requirements for human capital",
              ].map((q, i) => (
                <div
                  key={i}
                  onClick={() => setSearchQuery(q)}
                  className="text-xs font-medium text-white/40 p-3 rounded-xl bg-white/5 border border-white/5 hover:text-white/60 cursor-pointer flex justify-between items-center transition-all group"
                >
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
