const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');

router.post('/:id/execute', executionController.executeWorkflow);
router.get('/:id', executionController.getExecutionById);
router.post('/:id/retry', executionController.retryExecution);
router.post('/:id/cancel', executionController.cancelExecution);
router.get('/', executionController.getAllExecutions);

module.exports = router;