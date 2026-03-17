import React from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

export const workflowService = {
  getAll: () => api.get('/workflows'),
  getById: (id) => api.get(`/workflows/${id}`),
  create: (data) => api.post('/workflows', data),
  update: (id, data) => api.put(`/workflows/${id}`, data),
  delete: (id) => api.delete(`/workflows/${id}`),
  
  getSteps: (workflow_id) => api.get(`/steps/${workflow_id}/steps`),
  createStep: (workflow_id, data) => api.post(`/steps/${workflow_id}/steps`, data),
  updateStep: (id, data) => api.put(`/steps/steps/${id}`, data),
  deleteStep: (id) => api.delete(`/steps/steps/${id}`),
  addRule: (step_id, data) => api.post(`/steps/steps/${step_id}/rules`, data),
  
  execute: (id, data) => api.post(`/executions/${id}/execute`, data),
  getAllExecutions: () => api.get('/executions'),
  getExecution: (id) => api.get(`/executions/${id}`),
  retryExecution: (id) => api.post(`/executions/${id}/retry`),
  cancelExecution: (id) => api.post(`/executions/${id}/cancel`),
};

export default api;
