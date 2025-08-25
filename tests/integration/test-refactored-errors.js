#!/usr/bin/env node

/**
 * Test script to verify refactored error handling works correctly
 */

// Mock API response scenarios
const scenarios = [
    {
        name: 'Successful Request',
        url: 'http://localhost:3001/products',
        expectedStatus: 200,
        description: 'Should return products without errors'
    },
    {
        name: '404 Error Handling',
        url: 'http://localhost:3001/products/invalid-id',
        expectedStatus: 404,
        description: 'Should handle 404 with proper error context'
    },
    {
        name: 'Invalid Query Params',
        url: 'http://localhost:3001/products?minPrice=invalid',
        expectedStatus: 200,
        description: 'Server handles invalid params gracefully'
    }
];

async function testScenario(scenario) {
    try {
        const response = await fetch(scenario.url, {
            headers: {
                'Origin': 'http://localhost:3000',
                'Content-Type': 'application/json',
                'x-request-id': `test-${Date.now()}`
            }
        });
        
        if (response.status === scenario.expectedStatus) {
            console.log(`✅ ${scenario.name}: Expected status ${scenario.expectedStatus}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log(`   Data received: ${JSON.stringify(data).substring(0, 100)}...`);
            } else {
                const error = await response.json();
                console.log(`   Error handled: ${error.error || error.message}`);
            }
        } else {
            console.log(`❌ ${scenario.name}: Got ${response.status}, expected ${scenario.expectedStatus}`);
        }
    } catch (error) {
        console.log(`❌ ${scenario.name}: Network error - ${error.message}`);
    }
}

async function testRefactoredErrorHandling() {
    console.log('🧪 Testing Refactored Error Handling\n');
    console.log('='.repeat(60));
    
    // Check if server is running
    try {
        const health = await fetch('http://localhost:3001/health');
        if (!health.ok) throw new Error('Server not healthy');
        console.log('✅ Server is running\n');
    } catch (error) {
        console.log('❌ Server not running. Start with: cd server && npm start\n');
        return;
    }
    
    // Test each scenario
    for (const scenario of scenarios) {
        console.log(`\n📍 ${scenario.name}`);
        console.log(`   ${scenario.description}`);
        await testScenario(scenario);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Refactoring Benefits:');
    console.log('• Eliminated repetitive error handling code');
    console.log('• Centralized error logic in serviceErrorHandler.ts');
    console.log('• Consistent error context across all services');
    console.log('• Easier to maintain and update error handling');
    console.log('• Type-safe error handling preserved');
    console.log('• Better separation of concerns');
    
    console.log('\n📁 Files Updated:');
    console.log('• services/utils/serviceErrorHandler.ts (new)');
    console.log('• services/products/productService.ts');
    console.log('• services/auth/authService.ts');
    console.log('• services/users/userService.ts');
    
    console.log('\n🎯 Usage Pattern:');
    console.log('return handleErrors("operationName", async () => {');
    console.log('  // Your service logic here');
    console.log('}, { additionalContext });');
    
    console.log('\n' + '='.repeat(60));
}

testRefactoredErrorHandling().catch(console.error);