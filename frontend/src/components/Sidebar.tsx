"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FileEdit, 
  BrainCircuit, 
  ShieldCheck, 
  Settings, 
  ChevronLeft, 
  LogOut,
  Database,
  BarChart,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const SidebarItem = ({ icon: Icon, label, href, collapsed, active }: any) => {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group",
        active 
          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
          : "text-white/50 hover:bg-white/5 hover:text-white"
      )}>
        <Icon className={cn("w-5 h-5 flex-shrink-0", active ? "text-blue-400" : "group-hover:text-white")} />
        {!collapsed && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden">
            {label}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: FileEdit, label: "Report Builder", href: "/dashboard/builder" },
    { icon: BrainCircuit, label: "Intelligence Panel", href: "/dashboard/intelligence" },
    { icon: Database, label: "Data Ingestion", href: "/dashboard/data" },
    { icon: BarChart, label: "ESG Scoring", href: "/dashboard/scoring" },
    { icon: ShieldCheck, label: "Admin Control", href: "/dashboard/admin" },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: collapsed ? "80px" : "260px" }}
      className="h-screen bg-black border-r border-white/5 flex flex-col pt-6 pb-4 relative transition-all"
    >
      <div className="px-6 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight">SustainIntel</span>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 space-y-1.5">
        {menuItems.map((item) => (
          <SidebarItem 
            key={item.href} 
            {...item} 
            collapsed={collapsed} 
            active={pathname === item.href}
          />
        ))}
      </div>

      <div className="px-3 space-y-1.5 pt-4 border-t border-white/5">
        <SidebarItem icon={Settings} label="Settings" href="/dashboard/settings" collapsed={collapsed} />
        <SidebarItem icon={HelpCircle} label="Documentation" href="/docs" collapsed={collapsed} />
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 cursor-pointer group transition-all">
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Log Out</span>}
        </div>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white/10 border border-white/5 flex items-center justify-center hover:bg-white text-black transition-all"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </motion.div>
  );
};

export default Sidebar;
