import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService } from '../services/api';
import { Play, ChevronLeft, Terminal, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const ExecutionPanel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workflow, setWorkflow] = useState(null);
    const [formData, setFormData] = useState({});
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const loadWorkflow = async () => {
            try {
                const res = await workflowService.getById(id);
                setWorkflow(res.data);
                // Initialize form data based on schema
                const initialData = {};
                Object.keys(res.data.input_schema).forEach(key => {
                    initialData[key] = '';
                });
                setFormData(initialData);
            } catch (err) {
                console.error(err);
            }
        };
        loadWorkflow();
    }, [id]);

    const handleExecute = async (e) => {
        e.preventDefault();
        setExecuting(true);
        try {
            const res = await workflowService.execute(id, formData);
            setResult(res.data);
        } catch (err) {
            alert('Execution failed: ' + err.message);
        } finally {
            setExecuting(false);
        }
    };

    if (!workflow) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">Execute Workflow</h2>
                </div>

                <div className="card space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{workflow.name}</h3>
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Version {workflow.version}</p>
                        </div>
                    </div>

                    <form onSubmit={handleExecute} className="space-y-4">
                        {Object.entries(workflow.input_schema).map(([key, schema]) => (
                            <div key={key}>
                                <label className="block text-sm font-semibold text-slate-700 mb-1 capitalize">
                                    {key} {schema.required && <span className="text-rose-500">*</span>}
                                </label>
                                <input 
                                    type={schema.type === 'number' ? 'number' : 'text'}
                                    required={schema.required}
                                    className="input-field"
                                    placeholder={`Enter ${key}...`}
                                    value={formData[key]}
                                    onChange={(e) => setFormData({...formData, [key]: schema.type === 'number' ? Number(e.target.value) : e.target.value})}
                                />
                            </div>
                        ))}
                        <button 
                            disabled={executing}
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                        >
                            {executing ? 'Processing...' : <><Play className="w-4 h-4" /> Start Execution</>}
                        </button>
                    </form>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-slate-400" /> Live Logs
                </h3>
                
                {!result ? (
                    <div className="card bg-slate-900 border-none h-[500px] flex flex-col items-center justify-center text-slate-500 text-center p-10">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="font-medium">Waiting for execution to start...</p>
                        <p className="text-xs mt-2 opacity-60">Results will appear here in real-time.</p>
                    </div>
                ) : (
                    <div className="card bg-slate-900 border-none h-[600px] overflow-y-auto text-slate-300 font-mono text-sm p-6 space-y-6 custom-scrollbar">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <span className="text-xs font-bold text-slate-500 uppercase">Execution Summary</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${result.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {result.status}
                            </span>
                        </div>

                        {result.logs.map((log, idx) => (
                            <div key={idx} className="space-y-3 pl-4 border-l border-slate-800">
                                <div className="flex items-center justify-between text-primary-400">
                                    <span className="font-bold">Step: {log.step_name}</span>
                                    <span className="text-[10px] opacity-60">{log.execution_time_ms}ms</span>
                                </div>
                                <div className="space-y-1 pl-2">
                                    {log.evaluated_rules.map((rule, rIdx) => (
                                        <div key={rIdx} className="flex gap-2">
                                            <span className={rule.matched ? 'text-emerald-400' : 'text-slate-600'}>
                                                {rule.matched ? '✓' : '✗'}
                                            </span>
                                            <span className="text-slate-400">Rule[{rule.priority}]:</span>
                                            <span>{rule.condition}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-slate-500 pl-2">
                                    → Next: <span className="text-white">{log.selected_next_step ? 'Redirecting...' : 'END'}</span>
                                </div>
                            </div>
                        ))}

                        {result.status === 'completed' && (
                            <div className="pt-6 text-center text-emerald-400">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                                <div className="font-bold">Workflow Finished Successfully</div>
                            </div>
                        )}
                        {result.status === 'failed' && (
                            <div className="pt-6 text-center text-rose-400">
                                <AlertCircle className="w-10 h-10 mx-auto mb-2" />
                                <div className="font-bold">Workflow Failed</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionPanel;
