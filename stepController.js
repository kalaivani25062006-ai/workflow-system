const Step = require('../models/Steps');
const Workflow = require('../models/Workflow');

exports.createStep = async (req, res) => {
    try {
        const { workflow_id } = req.params;
        const step = new Step({ ...req.body, workflow_id });
        const saved = await step.save();
        
        // Update workflow's start_step_id if it's the first step
        if (saved.order === 1) {
            await Workflow.findByIdAndUpdate(workflow_id, { start_step_id: saved._id });
        }
        
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStepsByWorkflow = async (req, res) => {
    try {
        const steps = await Step.find({ workflow_id: req.params.workflow_id }).sort({ order: 1 });
        res.json(steps);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStep = async (req, res) => {
    try {
        const updated = await Step.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStep = async (req, res) => {
    try {
        await Step.findByIdAndDelete(req.params.id);
        res.json({ message: 'Step deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addRuleToStep = async (req, res) => {
    try {
        const step = await Step.findById(req.params.step_id);
        if (!step) return res.status(404).json({ message: 'Step not found' });
        
        step.rules.push(req.body);
        await step.save();
        res.status(201).json(step);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
