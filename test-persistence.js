/**
 * Test script to verify product persistence
 * This script will:
 * 1. Create a new product
 * 2. Verify it was created
 * 3. Check that the product exists in productos.json
 * 4. Update the product
 * 5. Verify the update persisted
 * 6. Delete the product
 * 7. Verify deletion persisted
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5001/api/productos';
const PRODUCTOS_FILE = path.join(__dirname, 'server', 'data', 'productos.json');

let testProductId = null;

// Helper function to read productos.json
const readProductsFile = () => {
    const data = fs.readFileSync(PRODUCTOS_FILE, 'utf-8');
    return JSON.parse(data);
};

// Helper function to make API requests
const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    return response.json();
};

// Test 1: Create a new product
async function testCreateProduct() {
    console.log('\n📝 Test 1: Creating a new product...');

    const newProduct = {
        nombre: 'Test Product - Persistence',
        descripcion: 'This is a test product for persistence verification',
        precio: 99.99,
        stock: 10,
        categoryId: 'C00004',
        imagen: '/assets/images/test-product.webp'
    };

    const result = await apiRequest(API_URL, {
        method: 'POST',
        body: JSON.stringify(newProduct),
    });

    if (result.status === 'success' && result.data) {
        testProductId = result.data.id;
        console.log(`✅ Product created with ID: ${testProductId}`);

        // Verify it's in the JSON file
        const products = readProductsFile();
        const foundInFile = products.find(p => p.id === testProductId);

        if (foundInFile) {
            console.log('✅ Product found in productos.json');
            return true;
        } else {
            console.log('❌ Product NOT found in productos.json');
            return false;
        }
    } else {
        console.log('❌ Failed to create product');
        return false;
    }
}

// Test 2: Update the product
async function testUpdateProduct() {
    console.log('\n📝 Test 2: Updating the product...');

    const updates = {
        nombre: 'Test Product - Updated',
        precio: 149.99,
        stock: 20,
    };

    const result = await apiRequest(`${API_URL}/${testProductId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
    });

    if (result.status === 'success') {
        console.log('✅ Product updated via API');

        // Verify the update persisted in the JSON file
        const products = readProductsFile();
        const updatedProduct = products.find(p => p.id === testProductId);

        if (updatedProduct &&
            updatedProduct.nombre === updates.nombre &&
            updatedProduct.precio === updates.precio &&
            updatedProduct.stock === updates.stock) {
            console.log('✅ Updates persisted in productos.json');
            return true;
        } else {
            console.log('❌ Updates NOT persisted in productos.json');
            return false;
        }
    } else {
        console.log('❌ Failed to update product');
        return false;
    }
}

// Test 3: Delete the product
async function testDeleteProduct() {
    console.log('\n📝 Test 3: Deleting the product...');

    const result = await apiRequest(`${API_URL}/${testProductId}`, {
        method: 'DELETE',
    });

    if (result.status === 'success') {
        console.log('✅ Product deleted via API');

        // Verify deletion persisted in the JSON file
        const products = readProductsFile();
        const stillExists = products.find(p => p.id === testProductId);

        if (!stillExists) {
            console.log('✅ Deletion persisted in productos.json');
            return true;
        } else {
            console.log('❌ Product still exists in productos.json');
            return false;
        }
    } else {
        console.log('❌ Failed to delete product');
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🧪 Starting Product Persistence Tests...');
    console.log('=====================================');

    try {
        const test1 = await testCreateProduct();
        if (!test1) {
            console.log('\n❌ Test 1 failed. Stopping tests.');
            process.exit(1);
        }

        const test2 = await testUpdateProduct();
        if (!test2) {
            console.log('\n❌ Test 2 failed. Stopping tests.');
            process.exit(1);
        }

        const test3 = await testDeleteProduct();
        if (!test3) {
            console.log('\n❌ Test 3 failed.');
            process.exit(1);
        }

        console.log('\n=====================================');
        console.log('✅ All persistence tests passed!');
        console.log('=====================================\n');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Test error:', error.message);
        process.exit(1);
    }
}

// Wait a moment for the server to be ready, then run tests
setTimeout(runTests, 1000);
