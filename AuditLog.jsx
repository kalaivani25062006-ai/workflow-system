import React, { useEffect, useState } from 'react';
import { workflowService } from '../services/api';
import { History, Search, Filter, ExternalLink } from 'lucide-react';

const AuditLog = () => {
    const [executions, setExecutions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExecutions = async () => {
            try {
                const res = await workflowService.getAllExecutions();
                setExecutions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchExecutions();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'failed': return 'bg-rose-100 text-rose-700';
            case 'cancelled': return 'bg-slate-100 text-slate-700';
            default: return 'bg-primary-100 text-primary-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <History className="w-7 h-7 text-primary-600" /> Audit History
                </h2>
                <div className="flex gap-2">
                   <div className="relative">
                       <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                       <input type="text" placeholder="Search ID..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm" />
                   </div>
                   <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                       <Filter className="w-5 h-5 text-slate-600" />
                   </button>
                </div>
            </div>

            <div className="card !p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-600">ID</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Workflow</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Execution Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-600 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {executions.map((exec) => (
                            <tr key={exec._id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs text-slate-500 uppercase">...{exec._id.slice(-8)}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900">{exec.workflow_id?.name || 'Deleted Workflow'}</div>
                                    <div className="text-[10px] text-slate-400 uppercase">Version {exec.version}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                    {new Date(exec.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${getStatusStyle(exec.status)}`}>
                                        {exec.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary-600 hover:text-primary-800 transition-colors">
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {executions.length === 0 && !loading && (
                            <tr>
                                <td colSpan="5" className="px-6 py-20 text-center text-slate-400">
                                    No execution history available yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLog;
