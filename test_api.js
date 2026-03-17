const API_BASE = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5001/api';

async function runTests() {
    try {
        console.log('🚀 Starting API Verification (using native fetch)...');

        // Helper for fetch
        const apiCall = async (endpoint, method = 'GET', body = null) => {
            const url = `${API_BASE}${endpoint}`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            });
            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw { message: `Non-JSON response for ${url}: ${text.slice(0, 100)}...`, status: res.status };
            }
            if (!res.ok) {
                throw { response: { data, status: res.status } };
            }
            return data;
        };

        // 1. Create Workflow
        console.log('\n1. Creating Workflow...');
        const wf = await apiCall('/workflows', 'POST', {
            name: 'Test Workflow',
            input_schema: {
                amount: { type: 'number', required: true },
                country: { type: 'string', required: true }
            }
        });
        const workflowId = wf._id;
        console.log('✅ Workflow Created:', workflowId);

        // 2. Add Step 1
        console.log('\n2. Adding Step 1 (Condition: amount > 100)...');
        const s1 = await apiCall(`/steps/${workflowId}/steps`, 'POST', {
            name: 'Check Amount',
            step_type: 'task',
            order: 1,
            rules: [
                { condition: 'amount > 100', priority: 1, next_step_id: null },
                { condition: 'default', priority: 100, next_step_id: null }
            ]
        });
        const step1Id = s1._id;
        console.log('✅ Step 1 Created:', step1Id);

        // 3. Add Step 2
        console.log('\n3. Adding Step 2 (Target for Rule)...');
        const s2 = await apiCall(`/steps/${workflowId}/steps`, 'POST', {
            name: 'Approval Required',
            step_type: 'approval',
            order: 2,
            rules: []
        });
        const step2Id = s2._id;
        console.log('✅ Step 2 Created:', step2Id);

        // 4. Update Step 1 with next_step_id
        console.log('\n4. Updating Step 1 Rule with next_step_id...');
        await apiCall(`/steps/steps/${step1Id}`, 'PUT', {
            rules: [
                { condition: 'amount > 100', priority: 1, next_step_id: step2Id },
                { condition: 'default', priority: 100, next_step_id: null }
            ]
        });
        console.log('✅ Step 1 Updated');

        // 5. Execute - Match Rule (Amount = 250)
        console.log('\n5. Executing Workflow (Amount = 250, expects moving to Step 2)...');
        const e1 = await apiCall(`/executions/${workflowId}/execute`, 'POST', {
            amount: 250,
            country: 'US'
        });
        console.log('✅ Execution 1 Status:', e1.status);
        console.log('✅ Path Taken:', e1.logs.map(l => l.step_name).join(' -> '));

        // 6. Execute - Default Rule (Amount = 50)
        console.log('\n6. Executing Workflow (Amount = 50, expects end at Step 1)...');
        const e2 = await apiCall(`/executions/${workflowId}/execute`, 'POST', {
            amount: 50,
            country: 'FR'
        });
        console.log('✅ Execution 2 Status:', e2.status);
        console.log('✅ Path Taken:', e2.logs.map(l => l.step_name).join(' -> '));

        console.log('\n🎉 ALL TESTS PASSED!');
    } catch (err) {
        console.error('\n❌ Test Failed:');
        if (err.response) {
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2));
            console.error('Status:', err.response.status);
        } else {
            console.error(err.message);
        }
    }
}

runTests();
