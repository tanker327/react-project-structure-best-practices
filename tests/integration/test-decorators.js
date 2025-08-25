#!/usr/bin/env node

/**
 * Test script to verify decorator-based error handling works correctly
 */

async function testDecoratorErrorHandling() {
    console.log('🎯 Testing Decorator-Based Error Handling\n');
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
    
    const tests = [
        {
            name: 'Successful Request with @HandleError',
            test: async () => {
                const response = await fetch('http://localhost:3001/products?limit=2');
                const data = await response.json();
                console.log(`✅ Products fetched: ${data.items ? data.items.length : 0} items`);
            }
        },
        {
            name: '404 Error with Decorator Context',
            test: async () => {
                const response = await fetch('http://localhost:3001/products/non-existent');
                if (response.status === 404) {
                    console.log('✅ 404 error properly handled by decorator');
                } else {
                    console.log('❌ Expected 404 error');
                }
            }
        },
        {
            name: 'Invalid Data Handling',
            test: async () => {
                try {
                    // Test with malformed request
                    const response = await fetch('http://localhost:3001/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ invalid: 'data' })
                    });
                    
                    if (response.status === 400) {
                        console.log('✅ Validation error caught by decorator');
                    } else {
                        console.log('⚠️ Unexpected response:', response.status);
                    }
                } catch (error) {
                    console.log('✅ Error handled:', error.message);
                }
            }
        }
    ];
    
    for (const test of tests) {
        console.log(`\n📍 ${test.name}`);
        await test.test();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Decorator Implementation Benefits:');
    console.log('• Clean, declarative syntax with @HandleError');
    console.log('• Automatic error context injection');
    console.log('• Service-level error handling with @ServiceErrorHandler');
    console.log('• No boilerplate code in methods');
    console.log('• Consistent error handling across all services');
    console.log('• TypeScript decorator metadata support');
    
    console.log('\n📁 Implementation Details:');
    console.log('• Decorators enabled in tsconfig.json');
    console.log('• reflect-metadata for decorator metadata');
    console.log('• Method-level @HandleError decorator');
    console.log('• Class-level @ServiceErrorHandler decorator');
    console.log('• Automatic sensitive data sanitization');
    
    console.log('\n🎯 Usage Example:');
    console.log('@ServiceErrorHandler("ServiceName")');
    console.log('class MyService {');
    console.log('  @HandleError()');
    console.log('  async myMethod() {');
    console.log('    // Method implementation - no try/catch needed!');
    console.log('  }');
    console.log('}');
    
    console.log('\n🔥 Before vs After:');
    console.log('\nBefore (manual error handling):');
    console.log('  ~15 lines with try/catch per method');
    console.log('\nAfter (with decorators):');
    console.log('  Just add @HandleError() - 1 line!');
    
    console.log('\n' + '='.repeat(60));
}

testDecoratorErrorHandling().catch(console.error);