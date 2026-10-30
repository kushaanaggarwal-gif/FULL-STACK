const BASE_URL = 'http://localhost:8080/api';
let currentToken = null;
let isTokenMasked = true;

// Section Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Helper for API calls
async function apiCall(endpoint, method = 'GET', body = null, useToken = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (useToken && currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        let data;
        try {
            data = await response.json();
        } catch {
            data = await response.text();
        }
        return { status: response.status, data, error: null };
    } catch (error) {
        return { status: null, data: null, error: error.message };
    }
}

// 1. Overview
async function checkBackendStatus() {
    const statusEl = document.getElementById('backend-status');
    statusEl.textContent = 'Checking...';
    statusEl.className = 'status-badge';
    
    const res = await apiCall('/health', 'GET', null, false);
    // Usually health checks return 200. We'll accept anything that implies the server is running (even 401/404)
    if (res.status) {
        statusEl.textContent = `Connected (Status: ${res.status})`;
        statusEl.className = 'status-badge status-ok';
    } else {
        statusEl.textContent = 'Disconnected';
        statusEl.className = 'status-badge status-error';
    }
}

// 2. JWT Auth
async function login(username, password) {
    const user = username || document.getElementById('username').value;
    const pass = password || document.getElementById('password').value;
    const responseBox = document.getElementById('login-response');
    
    responseBox.textContent = 'Logging in...';
    
    const res = await apiCall('/auth/login', 'POST', { username: user, password: pass }, false);
    
    if (res.error) {
        responseBox.textContent = `Error: ${res.error}\nMake sure the backend is running.`;
        return res;
    }

    responseBox.textContent = `Status: ${res.status}\nResponse: ${JSON.stringify(res.data, null, 2)}`;
    
    // Attempt to extract token assuming standard structure { token: "..." } or similar
    if (res.status === 200 && res.data) {
        currentToken = res.data.token || res.data.jwt || (typeof res.data === 'string' ? res.data : null);
        updateTokenDisplay();
    } else {
        currentToken = null;
        updateTokenDisplay();
    }
    return res;
}

function updateTokenDisplay() {
    const display = document.getElementById('jwt-display');
    if (!currentToken) {
        display.textContent = 'No token';
    } else {
        display.textContent = isTokenMasked ? '••••••••••••••••••••••••' : currentToken;
    }
}

function toggleToken() {
    isTokenMasked = !isTokenMasked;
    updateTokenDisplay();
}

async function testApi(useToken) {
    const responseBox = document.getElementById('api-response');
    responseBox.textContent = 'Testing...';
    // Use an endpoint that requires authentication
    const res = await apiCall('/test', 'GET', null, useToken);
    
    if (res.error) {
        responseBox.textContent = `Error: ${res.error}`;
    } else {
        responseBox.textContent = `Status: ${res.status}\nResponse: ${JSON.stringify(res.data, null, 2)}`;
    }
    return res;
}

// 3. RBAC
async function testRbac(role) {
    const responseBox = document.getElementById('rbac-response');
    responseBox.textContent = 'Testing...';
    
    const endpoint = role === 'admin' ? '/admin' : '/user';
    const res = await apiCall(endpoint, 'GET', null, true);
    
    if (res.error) {
        responseBox.textContent = `Error: ${res.error}`;
    } else {
        responseBox.textContent = `Status: ${res.status}\nResponse: ${JSON.stringify(res.data, null, 2)}`;
    }
    return res;
}

// 4. Encryption
async function encryptText() {
    const text = document.getElementById('plain-text').value;
    const responseBox = document.getElementById('crypto-response');
    responseBox.textContent = 'Encrypting...';
    
    const res = await apiCall('/crypto/encrypt', 'POST', { data: text }, true);
    if (res.status === 200 && res.data) {
        // Assume backend returns { encryptedData: "..." } or similar
        const encrypted = res.data.encryptedData || res.data.encrypted || res.data;
        document.getElementById('encrypted-text').value = encrypted;
        responseBox.textContent = `Success: Encrypted on backend.\nResponse: ${JSON.stringify(res.data)}`;
    } else {
        responseBox.textContent = `Status: ${res.status}\nError: ${res.error || JSON.stringify(res.data)}`;
    }
    return res;
}

async function decryptText() {
    const encrypted = document.getElementById('encrypted-text').value;
    const responseBox = document.getElementById('crypto-response');
    responseBox.textContent = 'Decrypting...';
    
    const res = await apiCall('/crypto/decrypt', 'POST', { data: encrypted }, true);
    if (res.status === 200 && res.data) {
        const decrypted = res.data.decryptedData || res.data.decrypted || res.data;
        responseBox.textContent = `Decrypted text: ${decrypted}\nResponse: ${JSON.stringify(res.data)}`;
    } else {
        responseBox.textContent = `Status: ${res.status}\nError: ${res.error || JSON.stringify(res.data)}`;
    }
    return res;
}

async function refreshToken() {
    const responseBox = document.getElementById('token-response');
    responseBox.textContent = 'Refreshing...';
    
    // Pass current token to be refreshed
    const res = await apiCall('/auth/refresh', 'POST', { token: currentToken }, false);
    
    if (res.status === 200 && res.data) {
        const newToken = res.data.token || res.data.jwt;
        if (newToken) {
            currentToken = newToken;
            updateTokenDisplay();
        }
        responseBox.textContent = `Token refreshed successfully. Status: ${res.status}\nResponse: ${JSON.stringify(res.data)}`;
    } else {
        responseBox.textContent = `Status: ${res.status}\nResponse: ${JSON.stringify(res.data)}`;
    }
    return res;
}

// 5. Test Reports
const testsToRun = [
    { id: 1, desc: 'Login with valid credentials', expected: 200, run: async () => await login('user', 'password') },
    { id: 2, desc: 'Login with invalid credentials', expected: 401, run: async () => await login('user', 'wrongpass') },
    { id: 3, desc: 'Access protected API without token', expected: 401, run: async () => await testApi(false) },
    { id: 4, desc: 'Access protected API with valid token', expected: 200, run: async () => { 
        const logRes = await login('user', 'password'); 
        if(logRes.status !== 200) return logRes;
        return await testApi(true); 
    }},
    { id: 5, desc: 'USER access to ADMIN endpoint', expected: 403, run: async () => { 
        const logRes = await login('user', 'password'); 
        if(logRes.status !== 200) return logRes;
        return await testRbac('admin'); 
    }},
    { id: 6, desc: 'ADMIN access to ADMIN endpoint', expected: 200, run: async () => { 
        const logRes = await login('admin', 'admin123'); 
        if(logRes.status !== 200) return logRes;
        return await testRbac('admin'); 
    }},
    { id: 7, desc: 'AES encryption/decryption', expected: 200, run: async () => { 
        const encRes = await apiCall('/crypto/encrypt', 'POST', { data: 'test' }, true);
        if(encRes.status !== 200) return encRes;
        const encrypted = encRes.data.encryptedData || encRes.data.encrypted || encRes.data;
        return await apiCall('/crypto/decrypt', 'POST', { data: encrypted }, true);
    }},
    { id: 8, desc: 'Token refresh handling', expected: 200, run: async () => await refreshToken() }
];

async function runAllTests() {
    const tbody = document.getElementById('test-table-body');
    const summary = document.getElementById('test-summary');
    tbody.innerHTML = '';
    summary.textContent = 'Running tests...';
    
    let passed = 0;
    let failed = 0;

    for (const test of testsToRun) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${test.id}</td>
            <td>${test.desc}</td>
            <td>${test.expected}</td>
            <td>Running...</td>
            <td>...</td>
        `;
        tbody.appendChild(tr);
        
        try {
            const res = await test.run();
            // Compare status loosely or assume fail if network error
            const actualStatus = res.status || 'Error';
            const isPass = actualStatus === test.expected || (test.expected === 200 && (actualStatus === 200 || actualStatus === 201));
            
            tr.innerHTML = `
                <td>${test.id}</td>
                <td>${test.desc}</td>
                <td>${test.expected}</td>
                <td>${actualStatus}</td>
                <td class="${isPass ? 'pass' : 'fail'}">${isPass ? 'PASS' : 'FAIL'}</td>
            `;
            
            if (isPass) passed++; else failed++;
            
        } catch (e) {
            tr.innerHTML = `
                <td>${test.id}</td>
                <td>${test.desc}</td>
                <td>${test.expected}</td>
                <td>Error</td>
                <td class="fail">FAIL</td>
            `;
            failed++;
        }
    }
    
    summary.textContent = `Total: ${passed + failed}, Passed: ${passed}, Failed: ${failed}`;
}

// Initial check
window.onload = checkBackendStatus;
