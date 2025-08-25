# Mock Products API Server

A simple Express server providing mock product endpoints for the React Project Structure demo application.

## Features

- Full CRUD operations for products
- In-memory data storage (resets on server restart)
- Query filtering and search capabilities
- Bulk operations support
- Follows the same product schema as defined in the React app docs

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
# or
node server.js
```

Server runs on port 3001 by default (can be changed with PORT environment variable).

## API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server info and available endpoints |
| GET | `/health` | Health check endpoint |
| GET | `/products` | Get all products (with optional filters) |
| GET | `/products/:id` | Get single product by ID |
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Full update of product |
| PATCH | `/products/:id` | Partial update of product |
| DELETE | `/products/:id` | Delete product |
| POST | `/products/bulk` | Bulk operations (update/delete multiple) |
| GET | `/products/reset` | Reset to initial data |

### Query Parameters for GET /products

- `category` - Filter by category (e.g., "Electronics")
- `isActive` - Filter by active status (true/false)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search in product names and descriptions

### Product Schema

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "inventory": "number",
  "isActive": "boolean",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

## Examples

### Get all electronics products over $50

```bash
curl "http://localhost:3001/products?category=Electronics&minPrice=50"
```

### Create a new product

```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "price": 29.99,
    "category": "Electronics",
    "inventory": 100
  }'
```

### Update product inventory

```bash
curl -X PATCH http://localhost:3001/products/prod-001 \
  -H "Content-Type: application/json" \
  -d '{"inventory": 75}'
```

### Bulk deactivate products

```bash
curl -X POST http://localhost:3001/products/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "ids": ["prod-001", "prod-002"],
    "updates": {"isActive": false}
  }'
```

## Testing

Run the included test script to verify all endpoints:

```bash
node test-endpoints.js
```

## Notes

- Data is stored in memory and will be lost when the server restarts
- Use `/products/reset` endpoint to restore initial data
- Server includes logging for debugging purposes
- Designed to work with the React Project Structure demo application