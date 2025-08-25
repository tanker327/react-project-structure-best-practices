#!/usr/bin/env node

/**
 * Test script for mock products API endpoints
 * Run with: node test-endpoints.js
 */

const http = require('http');

const HOST = 'localhost';
const PORT = 3001;

const makeRequest = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = {
                        status: res.statusCode,
                        data: JSON.parse(body)
                    };
                    resolve(response);
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};

const tests = [
    {
        name: 'GET / - Server info',
        method: 'GET',
        path: '/',
        expectedStatus: 200
    },
    {
        name: 'GET /health - Health check',
        method: 'GET',
        path: '/health',
        expectedStatus: 200
    },
    {
        name: 'GET /products - Get all products',
        method: 'GET',
        path: '/products',
        expectedStatus: 200
    },
    {
        name: 'GET /products with filters',
        method: 'GET',
        path: '/products?category=Electronics&minPrice=50',
        expectedStatus: 200
    },
    {
        name: 'GET /products/:id - Get specific product',
        method: 'GET',
        path: '/products/prod-001',
        expectedStatus: 200
    },
    {
        name: 'GET /products/:id - Non-existent product',
        method: 'GET',
        path: '/products/prod-999',
        expectedStatus: 404
    },
    {
        name: 'POST /products - Create product',
        method: 'POST',
        path: '/products',
        data: {
            name: 'Test Product',
            description: 'Test description',
            price: 99.99,
            category: 'Test Category',
            inventory: 10
        },
        expectedStatus: 201
    },
    {
        name: 'POST /products - Invalid (missing required fields)',
        method: 'POST',
        path: '/products',
        data: {
            description: 'Missing required fields'
        },
        expectedStatus: 400
    },
    {
        name: 'PUT /products/:id - Update product',
        method: 'PUT',
        path: '/products/prod-002',
        data: {
            name: 'Updated Product Name',
            price: 399.99
        },
        expectedStatus: 200
    },
    {
        name: 'PATCH /products/:id - Partial update',
        method: 'PATCH',
        path: '/products/prod-003',
        data: {
            inventory: 150
        },
        expectedStatus: 200
    },
    {
        name: 'DELETE /products/:id - Delete product',
        method: 'DELETE',
        path: '/products/prod-004',
        expectedStatus: 200
    },
    {
        name: 'POST /products/bulk - Bulk update',
        method: 'POST',
        path: '/products/bulk',
        data: {
            action: 'update',
            ids: ['prod-005', 'prod-006'],
            updates: {
                isActive: false
            }
        },
        expectedStatus: 200
    },
    {
        name: 'GET /products/reset - Reset data',
        method: 'GET',
        path: '/products/reset',
        expectedStatus: 200
    }
];

async function runTests() {
    console.log('🧪 Testing Mock Products API Endpoints\n');
    console.log(`Server: http://${HOST}:${PORT}\n`);
    console.log('=' .repeat(60));
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const response = await makeRequest(test.method, test.path, test.data);
            const success = response.status === test.expectedStatus;
            
            if (success) {
                console.log(`✅ ${test.name}`);
                console.log(`   ${test.method} ${test.path}`);
                console.log(`   Status: ${response.status} (expected: ${test.expectedStatus})`);
                if (test.method === 'POST' && response.data.id) {
                    console.log(`   Created ID: ${response.data.id}`);
                }
                passed++;
            } else {
                console.log(`❌ ${test.name}`);
                console.log(`   ${test.method} ${test.path}`);
                console.log(`   Status: ${response.status} (expected: ${test.expectedStatus})`);
                console.log(`   Response:`, response.data);
                failed++;
            }
            
            console.log('-'.repeat(60));
            
        } catch (error) {
            console.log(`❌ ${test.name}`);
            console.log(`   Error: ${error.message}`);
            console.log(`   Make sure the server is running on port ${PORT}`);
            failed++;
            console.log('-'.repeat(60));
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed!');
    } else {
        console.log('\n⚠️  Some tests failed. Please review the output above.');
    }
}

// Check if server is running before tests
const checkServer = () => {
    return new Promise((resolve) => {
        const req = http.get(`http://${HOST}:${PORT}/health`, (res) => {
            resolve(true);
        });
        
        req.on('error', () => {
            resolve(false);
        });
        
        req.end();
    });
};

async function main() {
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        console.error(`❌ Server is not running on http://${HOST}:${PORT}`);
        console.error('\nPlease start the server first:');
        console.error('  cd react-project-structure-best-practices/server');
        console.error('  npm start\n');
        process.exit(1);
    }
    
    await runTests();
}

main().catch(console.error);