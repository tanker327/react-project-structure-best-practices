#!/usr/bin/env node

/**
 * Integration test script to verify React app can communicate with mock server
 */

// Test if both servers are running
async function checkServers() {
    const servers = [
        { name: 'React App', url: 'http://localhost:3000', expected: 'html' },
        { name: 'Mock API Server', url: 'http://localhost:3001/health', expected: 'json' }
    ];
    
    console.log('🔍 Checking servers...\n');
    
    for (const server of servers) {
        try {
            const response = await fetch(server.url);
            const contentType = response.headers.get('content-type');
            const isExpected = contentType && contentType.includes(server.expected);
            
            if (response.ok && isExpected) {
                console.log(`✅ ${server.name}: Running at ${server.url}`);
            } else {
                console.log(`❌ ${server.name}: Not responding correctly at ${server.url}`);
            }
        } catch (error) {
            console.log(`❌ ${server.name}: Not running at ${server.url}`);
            console.log(`   Error: ${error.message}`);
        }
    }
}

// Test API endpoints from the React app perspective
async function testAPIEndpoints() {
    console.log('\n📡 Testing API Endpoints...\n');
    
    const tests = [
        {
            name: 'Get Products',
            url: 'http://localhost:3001/products',
            headers: { 'Origin': 'http://localhost:3000' }
        },
        {
            name: 'Get Single Product',
            url: 'http://localhost:3001/products/prod-001',
            headers: { 'Origin': 'http://localhost:3000' }
        },
        {
            name: 'Search Products',
            url: 'http://localhost:3001/products?search=wireless',
            headers: { 'Origin': 'http://localhost:3000' }
        },
        {
            name: 'Filter by Category',
            url: 'http://localhost:3001/products?category=Electronics',
            headers: { 'Origin': 'http://localhost:3000' }
        }
    ];
    
    for (const test of tests) {
        try {
            const response = await fetch(test.url, { headers: test.headers });
            const data = await response.json();
            
            if (response.ok) {
                const itemCount = data.items ? data.items.length : (data.id ? 1 : 0);
                console.log(`✅ ${test.name}: Success (${itemCount} items)`);
            } else {
                console.log(`❌ ${test.name}: Failed with status ${response.status}`);
            }
        } catch (error) {
            console.log(`❌ ${test.name}: Error - ${error.message}`);
        }
    }
}

// Check CORS configuration
async function testCORS() {
    console.log('\n🔒 Testing CORS Configuration...\n');
    
    try {
        const response = await fetch('http://localhost:3001/products', {
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET'
            }
        });
        
        const corsHeader = response.headers.get('access-control-allow-origin');
        
        if (corsHeader === 'http://localhost:3000') {
            console.log('✅ CORS is properly configured');
            console.log(`   Allowed origin: ${corsHeader}`);
        } else {
            console.log('❌ CORS is not configured correctly');
            console.log(`   Current value: ${corsHeader}`);
        }
    } catch (error) {
        console.log('❌ Failed to test CORS:', error.message);
    }
}

// Main execution
async function main() {
    console.log('==================================================');
    console.log('🧪 React + Mock Server Integration Test');
    console.log('==================================================\n');
    
    await checkServers();
    await testAPIEndpoints();
    await testCORS();
    
    console.log('\n==================================================');
    console.log('✨ Integration test complete!');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Navigate to the Products page');
    console.log('3. Verify products are loading from the mock server');
    console.log('4. Test filtering and search functionality');
    console.log('==================================================\n');
}

main().catch(console.error);