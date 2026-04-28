const http = require('http');

function request(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const req = http.request({
      hostname: 'localhost', port: 5000, path, method,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function run() {
  const results = [];
  
  // Test 1: Health check
  try {
    const r1 = await request('/health', 'GET');
    results.push(`1. Health: ${r1.status} - ${r1.body.substring(0, 100)}`);
  } catch (e) {
    results.push(`1. Health: ERROR - ${e.message}`);
  }
  
  // Test 2: Login with wrong password
  try {
    const r2 = await request('/api/v1/auth/login', 'POST', {
      email: 'anshulshakya5632@gmail.com',
      password: 'wrongpassword123!'
    });
    results.push(`2. Login wrong: ${r2.status} - ${r2.body.substring(0, 200)}`);
  } catch (e) {
    results.push(`2. Login wrong: ERROR - ${e.message}`);
  }
  
  // Test 3: Login with empty body
  try {
    const r3 = await request('/api/v1/auth/login', 'POST', {});
    results.push(`3. Login empty: ${r3.status} - ${r3.body.substring(0, 200)}`);
  } catch (e) {
    results.push(`3. Login empty: ERROR - ${e.message}`);
  }
  
  require('fs').writeFileSync('/tmp/diagnose-results.txt', results.join('\n\n'));
  console.log('Results saved to /tmp/diagnose-results.txt');
}

run();
