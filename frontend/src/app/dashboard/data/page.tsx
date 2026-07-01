"use client";
import React, { useState, useRef } from "react";
import { Database, UploadCloud, RefreshCw, CheckCircle2 } from "lucide-react";
import { aiApi } from "@/lib/api";

export default function DataIngestionPage() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus("Uploading and analyzing document...");
    try {
      await aiApi.uploadDocument(file, "GRI"); // Default to GRI for raw data
      setStatus(`Success! ${file.name} has been processed and indexed.`);
      setTimeout(() => setStatus(null), 5000);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || "Failed to upload document.";
      setStatus(`Error: ${msg}`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
      <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
        <Database className="w-12 h-12 text-emerald-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Data Ingestion</h1>
        <p className="text-white/40 max-w-md mx-auto">Upload raw sustainability reports, ESG spreadsheets, or PDF documents to build your Knowledge Base.</p>
      </div>
      
      {status && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${status.startsWith("Error") ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}>
          {status.startsWith("Success") && <CheckCircle2 className="w-4 h-4" />}
          {status}
        </div>
      )}

      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold opacity-50 cursor-not-allowed">
          Connect ERP (Coming Soon)
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          accept=".pdf,.txt,.docx,.csv,.xlsx"
        />
        <button 
          onClick={handleManualUpload}
          disabled={uploading}
          className="px-6 py-3 rounded-xl bg-emerald-600 text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {uploading ? "Processing..." : "Manual Upload"}
        </button>
      </div>
    </div>
  );
}
