import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService } from '../services/api';
import { Save, ChevronLeft, Plus, Settings, Code, GitBranch, Trash2, Edit2, ChevronRight } from 'lucide-react';

const WorkflowEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';

    const [workflow, setWorkflow] = useState({
        name: '',
        is_active: true,
        input_schema: '{}'
    });
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('settings'); // settings | steps

    useEffect(() => {
        if (!isNew) {
            setLoading(true);
            const loadData = async () => {
                try {
                    const [wfRes, stepsRes] = await Promise.all([
                        workflowService.getById(id),
                        workflowService.getSteps(id)
                    ]);
                    setWorkflow({
                        ...wfRes.data,
                        input_schema: JSON.stringify(wfRes.data.input_schema, null, 2)
                    });
                    setSteps(stepsRes.data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }
    }, [id, isNew]);

    const handleSaveWorkflow = async () => {
        try {
            const data = {
                ...workflow,
                input_schema: JSON.parse(workflow.input_schema)
            };
            if (isNew) {
                const res = await workflowService.create(data);
                navigate(`/workflows/${res.data._id}`);
            } else {
                await workflowService.update(id, data);
            }
            alert('Workflow saved!');
        } catch (err) {
            alert('Error saving workflow: ' + err.message);
        }
    };

    const handleAddStep = async () => {
        const newStep = {
            name: 'New Step',
            step_type: 'task',
            order: steps.length + 1,
            rules: []
        };
        try {
            const res = await workflowService.createStep(id, newStep);
            setSteps([...steps, res.data]);
        } catch (err) {
            alert('Error adding step: ' + err.message);
        }
    };

    if (loading) return <div className="text-center py-20">Loading workflow...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h2 className="text-2xl font-bold text-slate-900">{isNew ? 'Create New Workflow' : 'Edit Workflow'}</h2>
                <div className="ml-auto flex gap-3">
                    <button onClick={handleSaveWorkflow} className="btn-primary flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Settings className="w-4 h-4 inline mr-2" /> Settings
                </button>
                {!isNew && (
                    <button 
                        onClick={() => setActiveTab('steps')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'steps' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <GitBranch className="w-4 h-4 inline mr-2" /> Steps & Rules
                    </button>
                )}
            </div>

            {activeTab === 'settings' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">General Information</h3>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Workflow Name</label>
                                <input 
                                    type="text" 
                                    value={workflow.name}
                                    onChange={(e) => setWorkflow({...workflow, name: e.target.value})}
                                    className="input-field" 
                                    placeholder="e.g., Support Ticket Flow"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    checked={workflow.is_active}
                                    onChange={(e) => setWorkflow({...workflow, is_active: e.target.checked})}
                                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <label className="text-sm font-medium text-slate-700">Set as Active</label>
                            </div>
                        </div>

                        <div className="card space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900">Input Schema (JSON)</h3>
                                <Code className="w-5 h-5 text-slate-400" />
                            </div>
                            <p className="text-sm text-slate-500">Define the structure of data this workflow expects.</p>
                            <textarea 
                                value={workflow.input_schema}
                                onChange={(e) => setWorkflow({...workflow, input_schema: e.target.value})}
                                className="input-field font-mono text-sm h-64 bg-slate-900 text-slate-100 focus:ring-primary-600"
                                placeholder='{ "amount": { "type": "number" } }'
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card bg-primary-600 text-white">
                            <h3 className="font-bold text-lg mb-2">Version Tracking</h3>
                            <p className="text-primary-100 text-sm mb-4">Every save will automatically increment the version number to maintain history.</p>
                            <div className="text-4xl font-black">v{workflow.version || 1}</div>
                        </div>
                        <div className="card space-y-2 border-dashed">
                           <h4 className="font-bold text-slate-900">Quick Tips</h4>
                           <ul className="text-sm text-slate-500 space-y-2">
                               <li>• Use standard JSON for the schema.</li>
                               <li>• Priority: 0 is the highest.</li>
                               <li>• Default rules match anything.</li>
                           </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-900">Design Flow</h3>
                        <button onClick={handleAddStep} className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add Step
                        </button>
                    </div>

                    <div className="space-y-4">
                        {steps.map((step, idx) => (
                            <div key={step._id} className="card border-l-4 border-l-primary-500 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-xs font-bold">{step.order}</span>
                                            <h4 className="font-bold text-slate-900 text-lg">{step.name}</h4>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wider">{step.step_type}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">Transition Rules</div>
                                    <div className="space-y-2">
                                        {step.rules.map((rule, rIdx) => (
                                            <div key={rIdx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                                <div className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded">P{rule.priority}</div>
                                                <code className="flex-1 text-sm text-slate-700">{rule.condition}</code>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <ChevronRight className="w-4 h-4" />
                                                    <span className="text-xs font-medium text-slate-600">
                                                        {steps.find(s => s._id === rule.next_step_id)?.name || 'End Flow'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {step.rules.length === 0 && <div className="text-sm text-slate-400 italic">No rules defined. Workflow will end here.</div>}
                                    </div>
                                    <button 
                                        onClick={() => {/* Open Add Rule Modal */}}
                                        className="text-primary-600 text-sm font-bold hover:underline py-2"
                                    >
                                        + Add Rule
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowEditor;
