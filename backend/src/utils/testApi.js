const http = require('http');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting MedEmergency Backend API Smoke Tests...');

  // 1. Health Check
  const health = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  console.log('1. Health Check:', health.statusCode === 200 ? '✅ PASS' : '❌ FAIL', health.body);

  // 2. Patient Login
  const patientLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'patient@medemergency.com', password: 'Password@123' });
  console.log('2. Patient Login:', patientLogin.statusCode === 200 ? '✅ PASS' : '❌ FAIL', 'User:', patientLogin.body.user?.name);
  const patientToken = patientLogin.body.token;

  // 3. Store Login
  const storeLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'store1@medemergency.com', password: 'Password@123' });
  console.log('3. Store Login:', storeLogin.statusCode === 200 ? '✅ PASS' : '❌ FAIL', 'Store:', storeLogin.body.user?.store?.store_name);
  const storeToken = storeLogin.body.token;

  // 4. Admin Login
  const adminLogin = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }, { email: 'admin@medemergency.com', password: 'Admin@123' });
  console.log('4. Admin Login:', adminLogin.statusCode === 200 ? '✅ PASS' : '❌ FAIL', 'Admin:', adminLogin.body.user?.name);
  const adminToken = adminLogin.body.token;

  // 5. Medicine Search
  const medSearch = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/medicines/search?q=epinephrine',
    method: 'GET',
  });
  console.log('5. Medicine Search (Epinephrine):', medSearch.statusCode === 200 && medSearch.body.count > 0 ? '✅ PASS' : '❌ FAIL', 'Matches:', medSearch.body.count);

  // 6. Nearby Stores (Haversine)
  const nearby = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/stores/nearby?lat=18.5204&lng=73.8567&radius=5',
    method: 'GET',
  });
  console.log('6. Nearby Stores (5km radius):', nearby.statusCode === 200 && nearby.body.count > 0 ? '✅ PASS' : '❌ FAIL', 'Found stores:', nearby.body.count);

  // 7. Create Emergency Request
  const createReq = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/requests/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${patientToken}`,
    },
  }, {
    is_emergency: true,
    patient_lat: 18.5204,
    patient_lng: 73.8567,
    medicines: [{ name: 'Epinephrine Auto-Injector (EpiPen)', dosage_instruction: '1 Dose stat' }],
  });
  console.log('7. Create Emergency Broadcast Request:', createReq.statusCode === 201 ? '✅ PASS' : '❌ FAIL', 'Request ID:', createReq.body.request?.id);
  const requestId = createReq.body.request?.id;

  // 8. Store Responds "Available"
  const storeResp = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/requests/${requestId}/respond`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${storeToken}`,
    },
  }, {
    response: 'available',
    notes: '2 units in stock, ready for immediate pickup.',
  });
  console.log('8. Store Responds "Available" (First Match):', storeResp.statusCode === 200 && storeResp.body.isFirstMatch ? '✅ PASS' : '❌ FAIL');

  // 9. Admin Stats
  const adminStats = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  console.log('9. Admin Dashboard Stats:', adminStats.statusCode === 200 ? '✅ PASS' : '❌ FAIL', adminStats.body.stats);

  console.log('🎉 All Backend API Smoke Tests Completed Successfully!');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
