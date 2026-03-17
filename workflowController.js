const Workflow = require('../models/Workflow');

exports.createWorkflow = async (req, res) => {
    try {
        const workflow = new Workflow(req.body);
        const saved = await workflow.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find().sort({ createdAt: -1 });
        res.json(workflows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getWorkflowById = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
        res.json(workflow);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateWorkflow = async (req, res) => {
    try {
        // Requirement: Create new version on update
        const existing = await Workflow.findById(req.params.id);
        if (!existing) return res.status(404).json({ message: 'Workflow not found' });

        const newVersion = existing.version + 1;
        const updated = await Workflow.findByIdAndUpdate(
            req.params.id,
            { ...req.body, version: newVersion },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteWorkflow = async (req, res) => {
    try {
        await Workflow.findByIdAndDelete(req.params.id);
        res.json({ message: 'Workflow deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
