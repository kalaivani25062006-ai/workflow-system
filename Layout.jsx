import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-72 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workflow Engine</h1>
            <p className="text-slate-500 mt-1">Manage and automate your business processes.</p>
          </div>
          <div className="flex gap-4">
            <button className="px-4 py-2 text-slate-600 font-medium hover:text-primary-600 transition-colors">Documentation</button>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default Layout;
