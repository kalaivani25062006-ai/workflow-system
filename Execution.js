const mongoose = require('mongoose');

const ExecutionSchema = new mongoose.Schema({
    workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    version: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'], default: 'pending' },
    data: { type: Object, required: true },
    current_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
    retries: { type: Number, default: 0 },
    logs: [{
        step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
        step_name: String,
        evaluated_rules: [{
            condition: String,
            matched: Boolean,
            priority: Number
        }],
        selected_next_step: { type: mongoose.Schema.Types.ObjectId, ref: 'Step' },
        status: String,
        error_message: String,
        execution_time_ms: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Execution', ExecutionSchema);