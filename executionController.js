const Workflow = require('../models/Workflow');
const Step = require('../models/Steps');
const Execution = require('../models/Execution');
const { evaluateCondition } = require('../utils/ruleEngine');

exports.executeWorkflow = async (req, res) => {
    try {
        const { id: workflow_id } = req.params;
        const workflow = await Workflow.findById(workflow_id);
        if (!workflow) return res.status(404).json({ message: 'Workflow not found' });

        const startStep = await Step.findById(workflow.start_step_id);
        if (!startStep) return res.status(400).json({ message: 'Workflow has no start step' });

        const execution = new Execution({
            workflow_id,
            version: workflow.version,
            status: 'in_progress',
            data: req.body,
            current_step_id: startStep._id,
            logs: []
        });

        await runExecution(execution, startStep, req.body);
        res.status(201).json(execution);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

async function runExecution(execution, currentStep, inputData) {
    const startTime = Date.now();
    const logEntry = {
        step_id: currentStep._id,
        step_name: currentStep.name,
        evaluated_rules: [],
        status: 'in_progress'
    };

    try {
        let nextStepId = null;
        const sortedRules = currentStep.rules.sort((a, b) => a.priority - b.priority);

        for (const rule of sortedRules) {
            const matched = evaluateCondition(rule.condition, inputData);
            logEntry.evaluated_rules.push({
                condition: rule.condition,
                matched,
                priority: rule.priority
            });

            if (matched) {
                nextStepId = rule.next_step_id;
                break;
            }
        }

        logEntry.selected_next_step = nextStepId;
        logEntry.status = 'completed';
        logEntry.execution_time_ms = Date.now() - startTime;
        execution.logs.push(logEntry);

        if (nextStepId) {
            const nextStep = await Step.findById(nextStepId);
            if (nextStep) {
                execution.current_step_id = nextStep._id;
                // Recursive call for simplicity, but in production consider a loop or worker
                await runExecution(execution, nextStep, inputData);
            } else {
                execution.status = 'completed';
                execution.current_step_id = null;
            }
        } else {
            execution.status = 'completed';
            execution.current_step_id = null;
        }
    } catch (err) {
        logEntry.status = 'failed';
        logEntry.error_message = err.message;
        logEntry.execution_time_ms = Date.now() - startTime;
        execution.logs.push(logEntry);
        execution.status = 'failed';
    }

    await execution.save();
}

exports.getExecutionById = async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id)
            .populate('workflow_id')
            .populate('current_step_id');
        if (!execution) return res.status(404).json({ message: 'Execution not found' });
        res.json(execution);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.retryExecution = async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);
        if (!execution) return res.status(404).json({ message: 'Execution not found' });

        execution.status = 'in_progress';
        execution.retries += 1;
        
        const currentStep = await Step.findById(execution.current_step_id || (await Workflow.findById(execution.workflow_id)).start_step_id);
        await runExecution(execution, currentStep, execution.data);
        
        res.json(execution);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.cancelExecution = async (req, res) => {
    try {
        const execution = await Execution.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        res.json(execution);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllExecutions = async (req, res) => {
    try {
        const executions = await Execution.find().populate('workflow_id').sort({ createdAt: -1 });
        res.json(executions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
