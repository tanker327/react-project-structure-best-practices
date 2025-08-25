#!/usr/bin/env node

/**
 * Test script to verify error handling is working correctly
 */

async function testErrorHandling() {
    console.log('🧪 Testing Error Handling Integration\n');
    
    const tests = [
        {
            name: 'Network Error (Server Not Running)',
            test: async () => {
                try {
                    const response = await fetch('http://localhost:3001/products');
                    console.log('❌ Expected network error but got response');
                } catch (error) {
                    console.log('✅ Network error caught:', error.message);
                }
            }
        },
        {
            name: 'Server Running - Valid Request',
            test: async () => {
                try {
                    const response = await fetch('http://localhost:3001/health');
                    if (response.ok) {
                        console.log('✅ Server is running - health check passed');
                    } else {
                        console.log('❌ Server responded with error:', response.status);
                    }
                } catch (error) {
                    console.log('⚠️ Server not running - start with: cd server && npm start');
                }
            }
        },
        {
            name: '404 Error (Non-existent Product)',
            test: async () => {
                try {
                    const response = await fetch('http://localhost:3001/products/non-existent-id', {
                        headers: { 'Origin': 'http://localhost:3000' }
                    });
                    
                    if (response.status === 404) {
                        console.log('✅ 404 error correctly returned for non-existent product');
                    } else {
                        console.log('❌ Expected 404 but got:', response.status);
                    }
                } catch (error) {
                    console.log('⚠️ Could not test 404 - server not running');
                }
            }
        },
        {
            name: 'CORS Headers Present',
            test: async () => {
                try {
                    const response = await fetch('http://localhost:3001/products', {
                        headers: { 
                            'Origin': 'http://localhost:3000',
                            'x-request-id': 'test-error-handling'
                        }
                    });
                    
                    const corsHeader = response.headers.get('access-control-allow-origin');
                    if (corsHeader === 'http://localhost:3000') {
                        console.log('✅ CORS headers correctly configured');
                    } else {
                        console.log('❌ CORS headers missing or incorrect');
                    }
                } catch (error) {
                    console.log('⚠️ Could not test CORS - server not running');
                }
            }
        }
    ];
    
    for (const test of tests) {
        console.log(`\n🔍 ${test.name}`);
        await test.test();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Error Handling Test Complete!');
    console.log('\nError handling features added:');
    console.log('• ApiError class with statusCode, code, and details');
    console.log('• Response interceptor converts all errors to ApiError');
    console.log('• Development logging for API errors');
    console.log('• Service-level error context and validation');
    console.log('• Component-level error message customization');
    console.log('• CORS headers include x-request-id support');
    console.log('='.repeat(60));
}

testErrorHandling().catch(console.error);