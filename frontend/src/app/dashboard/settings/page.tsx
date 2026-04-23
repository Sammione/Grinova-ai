"use client";
import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-white/40 mt-1 text-sm font-medium">Manage your workspace preferences and integrations.</p>
      </div>
      <div className="glass p-8 rounded-3xl border border-white/5 flex flex-col items-center justify-center h-64 text-center">
        <Settings className="w-8 h-8 text-white/20 mb-4 animate-[spin_4s_linear_infinite]" />
        <p className="text-white/40">Configuration panel is coming soon.</p>
      </div>
    </div>
  );
}
