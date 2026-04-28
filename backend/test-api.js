const http = require('http');

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: body });
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function test() {
  console.log('=== Testing Login Endpoint ===\n');
  
  // Test 1: Wrong password
  console.log('Test 1: Wrong password');
  const r1 = await makeRequest('/api/v1/auth/login', 'POST', {
    email: 'anshulshakya5632@gmail.com',
    password: 'wrongpassword'
  });
  console.log('Status:', r1.status);
  console.log('Body:', r1.body);
  console.log('');
  
  // Test 2: Missing fields
  console.log('Test 2: Missing password');
  const r2 = await makeRequest('/api/v1/auth/login', 'POST', {
    email: 'anshulshakya5632@gmail.com'
  });
  console.log('Status:', r2.status);
  console.log('Body:', r2.body);
  console.log('');
  
  // Test 3: Invalid email format
  console.log('Test 3: Invalid email');
  const r3 = await makeRequest('/api/v1/auth/login', 'POST', {
    email: 'notanemail',
    password: 'somepass'
  });
  console.log('Status:', r3.status);
  console.log('Body:', r3.body);
  console.log('');
  
  // Test 4: Empty body
  console.log('Test 4: Empty body');
  const r4 = await makeRequest('/api/v1/auth/login', 'POST', {});
  console.log('Status:', r4.status);
  console.log('Body:', r4.body);
}

test().catch(e => console.error('Request failed:', e.message));
