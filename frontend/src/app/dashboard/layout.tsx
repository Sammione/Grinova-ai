import React from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(29,78,216,0.03)_0%,transparent_50%)]">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
