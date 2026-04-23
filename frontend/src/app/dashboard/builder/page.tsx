"use client";
import React from "react";
import { FileEdit } from "lucide-react";

export default function BuilderPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6">
      <div className="p-6 rounded-3xl bg-blue-500/10 border border-blue-500/20">
        <FileEdit className="w-12 h-12 text-blue-400" />
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-2">Report Builder</h1>
        <p className="text-white/40 max-w-md mx-auto">This module is currently in development. It will feature a drag-and-drop generative AI interface for assembling board-ready ESG reports.</p>
      </div>
      <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
        Notify me when active
      </button>
    </div>
  );
}
