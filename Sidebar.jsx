import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Workflow, PlayCircle, History, Settings, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        isActive 
          ? "bg-primary-50 text-primary-700 shadow-sm" 
          : "text-slate-600 hover:bg-slate-50 hover:text-primary-600"
      )
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
  </NavLink>
);

const Sidebar = () => {
  return (
    <div className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col p-6 fixed left-0 top-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
          <Workflow className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">Halleyx</span>
      </div>
      
      <nav className="flex-1 space-y-2">
        <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem to="/workflows" icon={Workflow} label="Editor" />
        <SidebarItem to="/executions" icon={PlayCircle} label="Executions" />
        <SidebarItem to="/audit" icon={History} label="Audit Logs" />
      </nav>
      
      <div className="mt-auto pt-6 border-t border-slate-50">
        <SidebarItem to="/settings" icon={Settings} label="Settings" />
      </div>
    </div>
  );
};

export default Sidebar;
