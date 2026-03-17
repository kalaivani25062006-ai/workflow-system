const express = require('express');
const router = express.Router();
const stepController = require('../controllers/stepController');

router.post('/:workflow_id/steps', stepController.createStep);
router.get('/:workflow_id/steps', stepController.getStepsByWorkflow);
router.put('/steps/:id', stepController.updateStep);
router.delete('/steps/:id', stepController.deleteStep);
router.post('/steps/:step_id/rules', stepController.addRuleToStep);

module.exports = router;