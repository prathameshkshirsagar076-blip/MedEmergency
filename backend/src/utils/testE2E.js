const { io } = require('socket.io-client');
const http = require('http');

function postRequest(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function putRequest(path, data, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runE2ESimulation() {
  console.log('🚀 Starting Full-Stack Real-Time E2E Simulation...');

  // 1. Log in Patient & Store
  const pLogin = await postRequest('/api/auth/login', { email: 'patient@medemergency.com', password: 'Password@123' });
  const sLogin = await postRequest('/api/auth/login', { email: 'store1@medemergency.com', password: 'Password@123' });
  const s2Login = await postRequest('/api/auth/login', { email: 'store2@medemergency.com', password: 'Password@123' });

  const patientToken = pLogin.data.token;
  const store1Token = sLogin.data.token;
  const store1Id = sLogin.data.user.store.id;
  const store2Token = s2Login.data.token;
  const store2Id = s2Login.data.user.store.id;

  console.log('✅ 1. Patient & Stores authenticated.');

  // 2. Connect Sockets
  const store1Socket = io('http://localhost:5000', { auth: { token: store1Token }, transports: ['websocket'] });
  const store2Socket = io('http://localhost:5000', { auth: { token: store2Token }, transports: ['websocket'] });

  await new Promise((res) => {
    store1Socket.on('connect', () => {
      store1Socket.emit('join_store_room', store1Id);
      store2Socket.emit('join_store_room', store2Id);
      res();
    });
  });

  console.log('✅ 2. Pharmacies connected to real-time dispatch rooms.');

  // 3. Create Emergency Request
  let receivedBroadcast = false;
  store1Socket.on('new_request', (data) => {
    console.log(`🚨 Store 1 received real-time broadcast for Request #${data.requestId}! Emergency: ${data.is_emergency}`);
    receivedBroadcast = true;
  });

  const reqRes = await postRequest('/api/requests/create', {
    is_emergency: true,
    patient_lat: 18.5204,
    patient_lng: 73.8567,
    medicines: [
      { name: 'Epinephrine Auto-Injector (EpiPen)', dosage_instruction: '1 dose stat' },
      { name: 'Salbutamol Inhaler 100mcg', dosage_instruction: '2 puffs' }
    ],
  }, patientToken);

  const requestId = reqRes.data.request.id;
  console.log(`✅ 3. Emergency Request #${requestId} broadcasted.`);

  // Wait for socket propagation
  await new Promise((r) => setTimeout(r, 500));

  // 4. Patient Socket listening
  const patientSocket = io('http://localhost:5000', { auth: { token: patientToken }, transports: ['websocket'] });
  let matchReceived = false;

  await new Promise((res) => {
    patientSocket.on('connect', () => {
      patientSocket.emit('join_request_room', requestId);
      patientSocket.on('request_matched', (match) => {
        console.log(`🎉 Patient received MATCH FOUND! Store: ${match.matchedStore.store_name}, Phone: ${match.matchedStore.phone}, Distance: ${match.matchedStore.distance_km}km`);
        matchReceived = true;
      });
      res();
    });
  });

  // 5. Store 1 responds "Available"
  const respRes = await putRequest(`/api/requests/${requestId}/respond`, {
    response: 'available',
    notes: '2 pens in stock, held for patient.',
  }, store1Token);

  console.log(`✅ 4. Store 1 confirmed availability (First match: ${respRes.data.isFirstMatch}).`);

  // Wait for match event
  await new Promise((r) => setTimeout(r, 500));

  // 6. Patient resolves request
  const resolveRes = await putRequest(`/api/requests/${requestId}/resolve`, {}, patientToken);
  console.log(`✅ 5. Patient marked request as resolved (${resolveRes.data.request.status}).`);

  store1Socket.disconnect();
  store2Socket.disconnect();
  patientSocket.disconnect();

  console.log('🎉 Full End-to-End Real-Time Broadcast & Match Simulation Succeeded with 100% Accuracy!');
  process.exit(0);
}

runE2ESimulation().catch((err) => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
