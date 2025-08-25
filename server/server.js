const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

// Load initial products data
let productsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'products.json'), 'utf8'));
let products = [...productsData.products];

// Helper function to generate unique ID
const generateId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `prod-${timestamp}-${random}`;
};

// Helper function to get current ISO timestamp
const getCurrentTimestamp = () => new Date().toISOString();

const setupMiddleware = (app) => {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(express.static(`${__dirname}/output`));
};

// Products endpoints handlers
const productsHandlers = {
    // GET /products - Get all products with optional filtering
    getProducts: (req, res) => {
        console.info('GET /products - Fetching products list');
        
        let result = [...products];
        
        // Apply filters if provided
        const { category, isActive, minPrice, maxPrice, search } = req.query;
        
        if (category) {
            result = result.filter(p => p.category.toLowerCase() === category.toLowerCase());
            console.debug(`Filtering by category: ${category}`);
        }
        
        if (isActive !== undefined) {
            const active = isActive === 'true';
            result = result.filter(p => p.isActive === active);
            console.debug(`Filtering by isActive: ${active}`);
        }
        
        if (minPrice) {
            const min = parseFloat(minPrice);
            result = result.filter(p => p.price >= min);
            console.debug(`Filtering by minPrice: ${min}`);
        }
        
        if (maxPrice) {
            const max = parseFloat(maxPrice);
            result = result.filter(p => p.price <= max);
            console.debug(`Filtering by maxPrice: ${max}`);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchLower) || 
                p.description?.toLowerCase().includes(searchLower)
            );
            console.debug(`Searching for: ${search}`);
        }
        
        console.info(`Returning ${result.length} products`);
        res.json({
            items: result,
            total: result.length,
            timestamp: getCurrentTimestamp()
        });
    },
    
    // GET /products/:id - Get single product by ID
    getProductById: (req, res) => {
        const { id } = req.params;
        console.info(`GET /products/${id} - Fetching product`);
        
        const product = products.find(p => p.id === id);
        
        if (!product) {
            console.warn(`Product not found: ${id}`);
            return res.status(404).json({ 
                error: 'Product not found',
                id: id,
                timestamp: getCurrentTimestamp()
            });
        }
        
        console.info(`Found product: ${product.name}`);
        res.json(product);
    },
    
    // POST /products - Create new product
    createProduct: (req, res) => {
        console.info('POST /products - Creating new product');
        
        const { 
            name, 
            description, 
            price, 
            category, 
            inventory = 0, 
            isActive = true 
        } = req.body;
        
        // Validate required fields
        if (!name || !price || !category) {
            console.warn('Missing required fields for product creation');
            return res.status(400).json({ 
                error: 'Missing required fields: name, price, and category are required',
                timestamp: getCurrentTimestamp()
            });
        }
        
        const newProduct = {
            id: generateId(),
            name,
            description: description || '',
            price: parseFloat(price),
            category,
            inventory: parseInt(inventory),
            isActive,
            createdAt: getCurrentTimestamp(),
            updatedAt: getCurrentTimestamp()
        };
        
        products.push(newProduct);
        console.info(`Created product: ${newProduct.id} - ${newProduct.name}`);
        
        res.status(201).json(newProduct);
    },
    
    // PUT /products/:id - Update existing product
    updateProduct: (req, res) => {
        const { id } = req.params;
        console.info(`PUT /products/${id} - Updating product`);
        
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            console.warn(`Product not found for update: ${id}`);
            return res.status(404).json({ 
                error: 'Product not found',
                id: id,
                timestamp: getCurrentTimestamp()
            });
        }
        
        const existingProduct = products[productIndex];
        const updatedProduct = {
            ...existingProduct,
            ...req.body,
            id: existingProduct.id, // Prevent ID change
            createdAt: existingProduct.createdAt, // Preserve creation date
            updatedAt: getCurrentTimestamp()
        };
        
        // Ensure proper types
        if (updatedProduct.price !== undefined) {
            updatedProduct.price = parseFloat(updatedProduct.price);
        }
        if (updatedProduct.inventory !== undefined) {
            updatedProduct.inventory = parseInt(updatedProduct.inventory);
        }
        
        products[productIndex] = updatedProduct;
        console.info(`Updated product: ${id} - ${updatedProduct.name}`);
        
        res.json(updatedProduct);
    },
    
    // PATCH /products/:id - Partial update
    patchProduct: (req, res) => {
        const { id } = req.params;
        console.info(`PATCH /products/${id} - Partial update`);
        
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            console.warn(`Product not found for patch: ${id}`);
            return res.status(404).json({ 
                error: 'Product not found',
                id: id,
                timestamp: getCurrentTimestamp()
            });
        }
        
        const existingProduct = products[productIndex];
        const patchData = { ...req.body };
        
        // Remove fields that shouldn't be changed
        delete patchData.id;
        delete patchData.createdAt;
        
        // Apply patch
        const patchedProduct = {
            ...existingProduct,
            ...patchData,
            updatedAt: getCurrentTimestamp()
        };
        
        // Ensure proper types
        if (patchedProduct.price !== undefined) {
            patchedProduct.price = parseFloat(patchedProduct.price);
        }
        if (patchedProduct.inventory !== undefined) {
            patchedProduct.inventory = parseInt(patchedProduct.inventory);
        }
        
        products[productIndex] = patchedProduct;
        console.info(`Patched product: ${id} - ${patchedProduct.name}`);
        
        res.json(patchedProduct);
    },
    
    // DELETE /products/:id - Delete product
    deleteProduct: (req, res) => {
        const { id } = req.params;
        console.info(`DELETE /products/${id} - Deleting product`);
        
        const productIndex = products.findIndex(p => p.id === id);
        
        if (productIndex === -1) {
            console.warn(`Product not found for deletion: ${id}`);
            return res.status(404).json({ 
                error: 'Product not found',
                id: id,
                timestamp: getCurrentTimestamp()
            });
        }
        
        const deletedProduct = products[productIndex];
        products.splice(productIndex, 1);
        console.info(`Deleted product: ${id} - ${deletedProduct.name}`);
        
        res.json({ 
            message: 'Product deleted successfully',
            deleted: deletedProduct,
            timestamp: getCurrentTimestamp()
        });
    },
    
    // POST /products/bulk - Bulk operations
    bulkOperations: (req, res) => {
        console.info('POST /products/bulk - Performing bulk operations');
        
        const { action, ids, updates } = req.body;
        
        if (!action || !ids || !Array.isArray(ids)) {
            console.warn('Invalid bulk operation request');
            return res.status(400).json({ 
                error: 'Invalid request: action and ids array are required',
                timestamp: getCurrentTimestamp()
            });
        }
        
        const results = {
            success: [],
            failed: [],
            timestamp: getCurrentTimestamp()
        };
        
        switch (action) {
            case 'delete':
                ids.forEach(id => {
                    const index = products.findIndex(p => p.id === id);
                    if (index !== -1) {
                        products.splice(index, 1);
                        results.success.push(id);
                        console.debug(`Bulk deleted: ${id}`);
                    } else {
                        results.failed.push(id);
                        console.debug(`Bulk delete failed - not found: ${id}`);
                    }
                });
                break;
                
            case 'update':
                if (!updates) {
                    return res.status(400).json({ 
                        error: 'Updates object required for bulk update',
                        timestamp: getCurrentTimestamp()
                    });
                }
                
                ids.forEach(id => {
                    const index = products.findIndex(p => p.id === id);
                    if (index !== -1) {
                        products[index] = {
                            ...products[index],
                            ...updates,
                            id: products[index].id,
                            createdAt: products[index].createdAt,
                            updatedAt: getCurrentTimestamp()
                        };
                        results.success.push(id);
                        console.debug(`Bulk updated: ${id}`);
                    } else {
                        results.failed.push(id);
                        console.debug(`Bulk update failed - not found: ${id}`);
                    }
                });
                break;
                
            default:
                return res.status(400).json({ 
                    error: `Unknown action: ${action}`,
                    timestamp: getCurrentTimestamp()
                });
        }
        
        console.info(`Bulk operation completed: ${results.success.length} succeeded, ${results.failed.length} failed`);
        res.json(results);
    },
    
    // GET /products/reset - Reset to initial data
    resetProducts: (req, res) => {
        console.info('GET /products/reset - Resetting products to initial state');
        
        products = [...productsData.products];
        
        res.json({ 
            message: 'Products reset to initial state',
            count: products.length,
            timestamp: getCurrentTimestamp()
        });
    }
};

const setupRoutes = (app) => {
    // Products endpoints
    app.get('/products', productsHandlers.getProducts);
    app.get('/products/reset', productsHandlers.resetProducts);
    app.get('/products/:id', productsHandlers.getProductById);
    app.post('/products', productsHandlers.createProduct);
    app.post('/products/bulk', productsHandlers.bulkOperations);
    app.put('/products/:id', productsHandlers.updateProduct);
    app.patch('/products/:id', productsHandlers.patchProduct);
    app.delete('/products/:id', productsHandlers.deleteProduct);
    
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'healthy',
            productsCount: products.length,
            timestamp: getCurrentTimestamp()
        });
    });
    
    // Root endpoint
    app.get('/', (req, res) => {
        res.json({
            message: 'Mock Products API Server',
            endpoints: {
                'GET /products': 'Get all products (supports query params: category, isActive, minPrice, maxPrice, search)',
                'GET /products/:id': 'Get product by ID',
                'POST /products': 'Create new product',
                'PUT /products/:id': 'Update entire product',
                'PATCH /products/:id': 'Partial update product',
                'DELETE /products/:id': 'Delete product',
                'POST /products/bulk': 'Bulk operations (delete or update multiple)',
                'GET /products/reset': 'Reset to initial data',
                'GET /health': 'Health check'
            },
            timestamp: getCurrentTimestamp()
        });
    });
};

const createRouter = () => {
    const app = express();
    setupMiddleware(app);
    setupRoutes(app);
    return app;
};

// If running directly (not imported)
if (require.main === module) {
    const PORT = process.env.PORT || 3001;
    const app = createRouter();
    
    app.listen(PORT, () => {
        console.log(`Mock Products Server running on http://localhost:${PORT}`);
        console.log(`Products loaded: ${products.length} items`);
        console.log('Press Ctrl+C to stop the server');
    });
}

module.exports = createRouter;