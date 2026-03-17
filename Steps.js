const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
    workflow_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
    name: { type: String, required: true },
    step_type: { type: String, enum: ['task', 'approval', 'notification'], required: true },
    order: { type: Number, required: true },
    metadata: { type: Object, default: {} },
    rules: [{
        condition: { type: String, required: true }, // e.g., "amount > 100"
        next_step_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Step', default: null }, // null means end of workflow or different branch
        priority: { type: Number, default: 100 } // lower number = higher priority
    }]
}, { timestamps: true });

module.exports = mongoose.model('Step', StepSchema);