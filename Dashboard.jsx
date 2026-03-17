import React, { useEffect, useState } from 'react';
import { workflowService } from '../services/api';
import { Plus, Play, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await workflowService.getAll();
                setWorkflows(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const StatsCard = ({ icon: Icon, label, value, color }) => (
        <div className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard icon={CheckCircle2} label="Active Workflows" value={workflows.filter(w => w.is_active).length} color="bg-emerald-500" />
                <StatsCard icon={Clock} label="Total Executions" value="128" color="bg-primary-500" />
                <StatsCard icon={AlertCircle} label="System Health" value="Healthy" color="bg-amber-500" />
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Registered Workflows</h2>
                <Link to="/workflows/new" className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Create Workflow
                </Link>
            </div>

            <div className="card overflow-hidden !p-0">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Version</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {workflows.map((wf) => (
                            <tr key={wf._id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{wf.name}</div>
                                    <div className="text-xs text-slate-400">ID: {wf._id}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-bold">v{wf.version}</span>
                                </td>
                                <td className="px-6 py-4">
                                    {wf.is_active ? (
                                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" /> Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link to={`/workflows/${wf._id}/execute`} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Execute">
                                            <Play className="w-5 h-5" />
                                        </Link>
                                        <Link to={`/workflows/${wf._id}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                                            <Edit2 className="w-5 h-5" />
                                        </Link>
                                        <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {workflows.length === 0 && !loading && (
                           <tr>
                               <td colSpan="4" className="px-6 py-20 text-center text-slate-400">
                                   No workflows found. Create your first one to get started!
                               </td>
                           </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
