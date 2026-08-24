const http = require('http');

async function callApi(name, path, method = 'GET', body = null, token = null) {
  const url = 'http://localhost:5000' + path;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  
  try {
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }
    return { name, method, path, status: res.status, ok: res.ok, data };
  } catch (err) {
    return { name, method, path, status: 'ERROR', ok: false, error: err.message };
  }
}

async function runTests() {
  console.log('Testing all Foodie Rusher backend API endpoints...\n');
  const results = [];

  // Auth Tests
  const cLogin = await callApi('Customer Login', '/login', 'POST', { email: 'customer@test.com', password: 'password123' });
  results.push(cLogin);
  const cToken = cLogin.data?.token;

  const oLogin = await callApi('Owner Login', '/login', 'POST', { email: 'owner@test.com', password: 'password123' });
  results.push(oLogin);
  const oToken = oLogin.data?.token;

  const sLogin = await callApi('Staff Login', '/login', 'POST', { email: 'staff@test.com', password: 'password123' });
  results.push(sLogin);
  const sToken = sLogin.data?.token;

  results.push(await callApi('Verify Session (/me)', '/me', 'GET', null, cToken));
  results.push(await callApi('Forgot Password', '/forgot-password', 'POST', { email: 'customer@test.com' }));
  results.push(await callApi('Reset Password', '/reset-password', 'POST', { email: 'customer@test.com', newPassword: 'password123' }));

  // AI Tests
  results.push(await callApi('AI Recommend (/recommend)', '/recommend', 'POST', { time: 13, budget: 250, weather: 1, festival: 0 }));
  results.push(await callApi('AI Recommend (/api/ai/recommend)', '/api/ai/recommend', 'POST', { time: 19, budget: 350, weather: 0, festival: 1 }));
  results.push(await callApi('AI Demand Forecast (/forecast)', '/forecast', 'POST', { history: [100, 110, 120, 130] }));
  results.push(await callApi('AI Demand Forecast (/api/ai/forecast)', '/api/ai/forecast', 'POST', { history: [120, 140, 160, 180] }));

  // Orders & Payments Tests
  results.push(await callApi('Create Online Order (/create-order)', '/create-order', 'POST', {
    amount: 399,
    items: [{ name: 'Margherita Pizza', price: 399, quantity: 1 }],
    deliveryAddress: 'Navrangpura, Ahmedabad'
  }));
  results.push(await callApi('Create COD Order (/cod)', '/cod', 'POST', {
    amount: 199,
    items: [{ name: 'Double Cheddar Burger', price: 199, quantity: 1 }],
    deliveryAddress: 'Satellite, Ahmedabad'
  }));
  results.push(await callApi('Customer Orders (/orders)', '/orders', 'GET', null, cToken));
  results.push(await callApi('Profile Orders (/api/profile/orders)', '/api/profile/orders', 'GET', null, cToken));
  results.push(await callApi('Admin Orders (/admin/orders)', '/admin/orders', 'GET', null, oToken));

  // Locations & Notifications Tests
  results.push(await callApi('Locations Districts', '/api/locations/districts', 'GET'));
  results.push(await callApi('Locations Areas', '/api/locations/areas', 'GET'));
  results.push(await callApi('Notifications', '/api/notifications', 'GET', null, cToken));
  results.push(await callApi('Owner Staff Team', '/api/staff', 'GET', null, oToken));

  console.log('---------------------------------------------------------------------------------------------------');
  console.log('| Status | Method | Endpoint                   | Result / Notes                                     |');
  console.log('---------------------------------------------------------------------------------------------------');
  let passedCount = 0;
  for (const r of results) {
    const statusIcon = r.ok ? '[ PASS ]' : '[ FAIL ]';
    if (r.ok) passedCount++;
    const pathStr = r.path.padEnd(26);
    const methodStr = r.method.padEnd(6);
    const nameStr = r.name.padEnd(35);
    console.log(`| ${statusIcon} | ${methodStr} | ${pathStr} | ${nameStr} |`);
  }
  console.log('---------------------------------------------------------------------------------------------------');
  console.log(`\nTEST SUMMARY: ${passedCount} / ${results.length} ENDPOINTS OPERATING AT 100% SUCCESS\n`);
}

runTests();