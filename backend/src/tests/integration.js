const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: JSON.parse(data)
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('Running integration tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Dashboard Stats
  try {
    const result = await makeRequest('/api/dashboard/stats');
    if (result.statusCode === 200 && result.data.totalProducts !== undefined) {
      console.log('✓ Dashboard Stats endpoint working');
      passed++;
    } else {
      console.log('✗ Dashboard Stats endpoint failed');
      failed++;
    }
  } catch (err) {
    console.log('✗ Dashboard Stats endpoint error:', err.message);
    failed++;
  }
  
  // Test 2: Low Stock Alerts
  try {
    const result = await makeRequest('/api/dashboard/low-stock-alerts');
    if (result.statusCode === 200 && Array.isArray(result.data)) {
      console.log('✓ Low Stock Alerts endpoint working');
      passed++;
    } else {
      console.log('✗ Low Stock Alerts endpoint failed');
      failed++;
    }
  } catch (err) {
    console.log('✗ Low Stock Alerts endpoint error:', err.message);
    failed++;
  }
  
  // Test 3: Products List
  try {
    const result = await makeRequest('/api/products');
    if (result.statusCode === 200 && Array.isArray(result.data.products)) {
      console.log('✓ Products endpoint working');
      passed++;
    } else {
      console.log('✗ Products endpoint failed');
      failed++;
    }
  } catch (err) {
    console.log('✗ Products endpoint error:', err.message);
    failed++;
  }
  
  // Test 4: Categories List
  try {
    const result = await makeRequest('/api/categories');
    if (result.statusCode === 200 && Array.isArray(result.data)) {
      console.log('✓ Categories endpoint working');
      passed++;
    } else {
      console.log('✗ Categories endpoint failed');
      failed++;
    }
  } catch (err) {
    console.log('✗ Categories endpoint error:', err.message);
    failed++;
  }
  
  // Test 5: Suppliers List
  try {
    const result = await makeRequest('/api/suppliers');
    if (result.statusCode === 200 && Array.isArray(result.data.suppliers)) {
      console.log('✓ Suppliers endpoint working');
      passed++;
    } else {
      console.log('✗ Suppliers endpoint failed');
      failed++;
    }
  } catch (err) {
    console.log('✗ Suppliers endpoint error:', err.message);
    failed++;
  }
  
  // Test 6: Orders List
  try {
    const result = await makeRequest('/api/orders');
    if (result.statusCode === 200 && Array.isArray(result.data.orders)) {
      console.log('✓ Orders endpoint working');
      passed++;
    } else {
      console.log('✗ Orders endpoint failed');
      failed++;
    }
  } catch (err) {
    console.log('✗ Orders endpoint error:', err.message);
    failed++;
  }
  
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});