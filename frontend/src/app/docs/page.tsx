"use client";
import React from "react";
import { HelpCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-4">
            <HelpCircle className="w-8 h-8 text-blue-500" />
            Documentation
          </h1>
          <p className="text-white/40 mt-4 text-lg">Learn how to use SustainIntel.AI to automate your ESG reporting workflows.</p>
        </div>
        <div className="glass p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold mb-4">Getting Started</h2>
          <p className="text-white/60 leading-relaxed">
            Welcome to the developer and user documentation. We are currently finalizing our guide on how to integrate external APIs and setup role-based access control. Check back shortly for the full API reference and tutorials.
          </p>
        </div>
      </div>
    </div>
  );
}
