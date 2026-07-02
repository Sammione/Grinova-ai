"use client";
import React, { useState } from "react";
import { ChevronLeft, Book, Database, Brain, PenTool, BarChart3, ShieldCheck, Terminal, Code, Lock, Rocket, Zap, Search } from "lucide-react";
import Link from "next/link";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", label: "Introduction", icon: Book },
    { id: "architecture", label: "Architecture Overview", icon: Database },
    { id: "core-modules", label: "Core Modules", icon: Brain },
    { id: "api-reference", label: "API Reference", icon: Terminal },
    { id: "security", label: "Security & Compliance", icon: Lock },
    { id: "roadmap", label: "Future Roadmap", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-[#020817] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#020817]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ChevronLeft className="w-4 h-4 text-white" />
          </Link>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-white tracking-tight text-lg">SustainIntel Docs</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 w-64">
          <Search className="w-4 h-4 text-white/40" />
          <span className="text-xs font-medium text-white/40">Search documentation...</span>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 p-6 md:sticky md:top-[73px] md:h-[calc(100vh-73px)] overflow-y-auto border-r border-white/5 hidden md:block">
          <div className="space-y-1 mb-8">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Getting Started</div>
            {sections.slice(0, 3).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeSection === s.id ? "bg-blue-500/10 text-blue-400 font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-3 mb-2">Developers & Ops</div>
            {sections.slice(3).map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeSection === s.id ? "bg-blue-500/10 text-blue-400 font-bold" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <s.icon className="w-4 h-4" />
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-12 pb-24 max-w-4xl">
          {/* Introduction Section */}
          {activeSection === "introduction" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Welcome to SustainIntel AI</h1>
                <p className="text-lg text-slate-400 leading-relaxed">
                  SustainIntel AI is the ultimate enterprise ESG platform, engineered to turn chaotic corporate data into audit-ready compliance reports using advanced Retrieval-Augmented Generation (RAG).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
                  <Zap className="w-6 h-6 text-blue-400 mb-3" />
                  <h3 className="font-bold text-white mb-2">Automated Ingestion</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Upload PDFs, CSVs, and Excel files. Our AI automatically extracts, chunks, and semantically maps the text.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20">
                  <BarChart3 className="w-6 h-6 text-emerald-400 mb-3" />
                  <h3 className="font-bold text-white mb-2">Dynamic Scoring</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">Get instantly scored against global frameworks like GRI, SASB, and IFRS based on real evidence in your data.</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold text-white mt-8 mb-4">Why SustainIntel?</h3>
                <p className="text-slate-400 leading-relaxed">
                  Modern ESG compliance requires navigating a labyrinth of regulatory frameworks (CSRD, SEC Climate Rules, IFRS S1/S2). SustainIntel cuts through the noise by building a private knowledge graph of your corporate data, allowing you to converse with your data and automatically draft reports that are fully cited to your raw inputs, minimizing "Greenwashing" risks.
                </p>
              </div>
            </div>
          )}

          {/* Architecture Section */}
          {activeSection === "architecture" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Architecture Overview</h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                SustainIntel is built on a modern, highly scalable stack separating a high-performance Python AI backend from a lightning-fast React frontend.
              </p>

              <div className="space-y-6">
                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Code className="w-4 h-4" /></span>
                    Frontend: Next.js & Tailwind
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    The user interface is powered by Next.js (App Router) utilizing Server-Side Rendering (SSR) where necessary. We utilize Tailwind CSS for utility-first styling, prioritizing a sleek, dark-mode, glassmorphism aesthetic. Charts are rendered using Chart.js wrapped for React.
                  </p>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400"><Terminal className="w-4 h-4" /></span>
                    Backend: FastAPI
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    The core API runs on Python 3.9+ using FastAPI. This provides extremely fast asynchronous execution, automatic OpenAPI documentation, and native Pydantic validation. It manages file processing streams and delegates AI tasks to the respective LLM services.
                  </p>
                </div>

                <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Database className="w-4 h-4" /></span>
                    Data Layer: SQLite & ChromaDB
                  </h3>
                  <ul className="text-sm text-slate-400 leading-relaxed list-disc list-inside space-y-2">
                    <li><strong>SQLite/PostgreSQL:</strong> Handles relational data like User Profiles, Action Plans, Historical Scores, and Document Metadata via SQLAlchemy ORM.</li>
                    <li><strong>ChromaDB:</strong> Our designated Vector Store. Handles high-dimensional vector embeddings generated from chunked ESG documents to facilitate lightning-fast similarity search (RAG).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Core Modules Section */}
          {activeSection === "core-modules" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Core Modules</h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                The platform is divided into four primary modules, each designed to tackle a specific challenge in the ESG reporting lifecycle.
              </p>

              <div className="grid grid-cols-1 gap-6">
                <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/5 to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Database className="w-6 h-6" /></div>
                    <h2 className="text-xl font-bold text-white">Data Ingestion Engine</h2>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    Allows users to securely upload raw files. The system uses PyPDF2/Pandas to extract text, splits it using recursive character splitting, embeds it using `text-embedding-3-small`, and persists it to ChromaDB.
                  </p>
                </div>

                <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-purple-500/5 to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Brain className="w-6 h-6" /></div>
                    <h2 className="text-xl font-bold text-white">Intelligence (RAG) Panel</h2>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    A conversational interface where users can query their corporate knowledge base. E.g., "What were our Scope 2 emissions in Q3?". The AI performs a semantic search, retrieves context, and synthesizes a factual response.
                  </p>
                </div>

                <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/5 to-transparent">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400"><PenTool className="w-6 h-6" /></div>
                    <h2 className="text-xl font-bold text-white">AI Report Builder</h2>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Automates report creation. Select a framework (e.g., SASB) and a section. The backend generates a highly professional draft. Includes an AI-Command bar to instantly rewrite text (e.g., "Make it more formal").
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Reference Section */}
          {activeSection === "api-reference" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">API Reference</h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Interact with SustainIntel programmatically. All endpoints are prefixed with `/api/v1`.
              </p>

              <div className="space-y-8">
                {/* Endpoint 1 */}
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">GET</span>
                    <span className="font-mono text-sm text-white">/api/v1/analytics/stats</span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-400 mb-4">Retrieves the high-level organizational ESG scores, insights, and action plans.</p>
                    <div className="rounded-lg bg-[#0d1117] p-4 font-mono text-xs text-green-300 overflow-x-auto">
<pre>
{`{
  "organization": {
    "name": "Global Corp",
    "overall_score": 78.5,
    "status": "Performing Well"
  },
  "radar_data": [85, 72, 90, 65, 80, 88],
  "insights": [...]
}`}
</pre>
                    </div>
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
                  <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">POST</span>
                    <span className="font-mono text-sm text-white">/api/v1/ai/upload-document</span>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-slate-400 mb-4">Uploads a document via `multipart/form-data`, extracts text, and vectorizes it in ChromaDB.</p>
                    <div className="rounded-lg bg-[#0d1117] p-4 font-mono text-xs text-blue-300 overflow-x-auto">
<pre>
{`// Example Response
{
  "filename": "Q3_Emissions.pdf",
  "status": "success",
  "message": "Document processed and framework requirements generated successfully"
}`}
</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Security & Compliance</h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Data privacy and security are foundational to SustainIntel AI. We adhere to strict standards to ensure corporate ESG data remains confidential.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <Lock className="w-6 h-6 text-white mb-4" />
                  <h3 className="font-bold text-white mb-2">Zero-Retention Policies</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    API calls made to commercial LLMs (like OpenAI) are routed through enterprise endpoints enforcing zero data retention. Your corporate documents are never used to train global models.
                  </p>
                </div>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                  <ShieldCheck className="w-6 h-6 text-white mb-4" />
                  <h3 className="font-bold text-white mb-2">Role-Based Access</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Fine-grained RBAC ensures that Stakeholders can only view reports, while Data Managers can upload documents, and Admins can configure global system settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Roadmap Section */}
          {activeSection === "roadmap" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Future Roadmap</h1>
              
              <div className="relative border-l border-white/10 ml-3 space-y-8 pb-8">
                
                <div className="relative pl-8">
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[6.5px] top-1.5 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                  <h3 className="font-bold text-white text-lg">Phase 1: Real-time ERP Connectors</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    Moving beyond manual CSV/PDF uploads to provide seamless, real-time API integrations with popular ERP systems (SAP, Oracle, NetSuite) for automated data ingestion.
                  </p>
                </div>

                <div className="relative pl-8">
                  <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[6.5px] top-1.5" />
                  <h3 className="font-bold text-white text-lg">Phase 2: Multi-Agent Workflows</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    Deploying specialized autonomous agents to handle specific ESG pillars (e.g., an Environment Agent and a Governance Agent) that collaborate to draft complex, multi-faceted reports automatically.
                  </p>
                </div>

                <div className="relative pl-8">
                  <div className="absolute w-3 h-3 bg-white/20 rounded-full -left-[6.5px] top-1.5" />
                  <h3 className="font-bold text-white text-lg">Phase 3: Automated Auditing</h3>
                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    Implementing a verifiable audit trail module that allows external third-party auditors to easily verify the lineage of every claim made in an ESG report back to its exact source data point.
                  </p>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
