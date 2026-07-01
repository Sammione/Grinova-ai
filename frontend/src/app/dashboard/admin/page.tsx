"use client";

import React from "react";
import { 
  Users, 
  ShieldAlert, 
  Key, 
  Activity, 
  Settings,
  ChevronRight,
  UserPlus,
  Lock
} from "lucide-react";

const AdminPanel = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin System Control</h1>
          <p className="text-white/40 mt-1 text-sm font-medium">Platform-wide governance and security management.</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
          <UserPlus className="w-4 h-4" />
          Invite Stakeholder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Users", value: "1,204", icon: Users, color: "blue" },
          { label: "Active Roles", value: "8", icon: Lock, color: "purple" },
          { label: "API Health", value: "99.9%", icon: Activity, color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-white/5">
             <div className="flex items-center gap-3 mb-4">
               <div className={`p-2 rounded-lg bg-${stat.color}-500/10 border border-${stat.color}-500/20`}>
                 <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
               </div>
               <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
             </div>
             <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Role-Based Access Control
            </h3>
            <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-blue-300">New Role</button>
          </div>
          <div className="divide-y divide-white/5">
             {[
               { role: "Super Admin", access: "Full System Access", users: 2 },
               { role: "ESG Analyst", access: "Report & AI Tools Only", users: 15 },
               { role: "Stakeholder", access: "Read-Only Dashboard", users: 43 },
               { role: "Data Manager", access: "Ingestion & Frameworks", users: 5 }
             ].map((role, i) => (
               <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors cursor-pointer group">
                  <div>
                    <div className="text-sm font-bold mb-1">{role.role}</div>
                    <div className="text-xs text-white/30">{role.access}</div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{role.users} Users</div>
                     <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              System Logging & Security
            </h3>
            <Settings className="w-4 h-4 text-white/10" />
          </div>
          <div className="p-6 space-y-6">
             <div className="space-y-4">
                {[
                  { event: "Login Attempt", user: "m.ross@corp.com", status: "Success", time: "2m ago" },
                  { event: "Data Export", user: "sarah.v@corp.com", status: "Pending Approval", time: "15m ago" },
                  { event: "API Secret Rotated", user: "System", status: "Automated", time: "1h ago" },
                  { event: "Role Modified", user: "Admin", status: "Audited", time: "4h ago" }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex gap-4 items-center">
                       <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                       <div>
                          <div className="font-bold text-white/70">{log.event}</div>
                          <div className="text-[10px] text-white/30">{log.user}</div>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="font-bold text-white/40">{log.status}</div>
                       <div className="text-[10px] text-white/20">{log.time}</div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Audit Compliance</div>
                <div className="flex items-center justify-between">
                   <div className="text-sm font-medium">SOC2 Type II Audit Log</div>
                   <button className="px-3 py-1 rounded-lg bg-blue-600/20 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">Generate PDF</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
