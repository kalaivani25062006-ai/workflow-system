import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkflowEditor from './pages/WorkflowEditor';
import ExecutionPanel from './pages/ExecutionPanel';
import AuditLog from './pages/AuditLog';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/workflows" element={<Dashboard />} />
          <Route path="/workflows/new" element={<WorkflowEditor />} />
          <Route path="/workflows/:id" element={<WorkflowEditor />} />
          <Route path="/workflows/:id/execute" element={<ExecutionPanel />} />
          <Route path="/executions" element={<AuditLog />} />
          <Route path="/audit" element={<AuditLog />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;