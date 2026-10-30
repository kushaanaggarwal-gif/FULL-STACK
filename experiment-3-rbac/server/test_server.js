const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING RBAC API AUTOMATED VERIFICATION ---');
  let testsPassed = 0;
  let testsTotal = 0;

  const assert = (condition, message) => {
    testsTotal++;
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  };

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    assert(health.data.status === 'OK', 'Server Health Check is OK');

    // 2. Login as Admin
    const adminLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@app.com',
      password: 'password123'
    });
    assert(adminLogin.data.success === true && adminLogin.data.user.role === 'Admin', 'Admin Login Successful');
    const adminAccessToken = adminLogin.data.accessToken;
    const adminRefreshToken = adminLogin.data.refreshToken;

    // 3. Admin calls GET /content
    const adminContent = await axios.get(`${BASE_URL}/content`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` }
    });
    assert(adminContent.status === 200 && adminContent.data.data.length > 0, 'Admin can GET /api/content');

    // 4. Admin calls POST /content/edit
    const adminEdit = await axios.post(`${BASE_URL}/content/edit`, 
      { id: 2, title: 'Updated Title by Admin Test' },
      { headers: { Authorization: `Bearer ${adminAccessToken}` } }
    );
    assert(adminEdit.status === 200, 'Admin can POST /api/content/edit');

    // 5. Admin calls GET /admin/metrics
    const adminMetrics = await axios.get(`${BASE_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminAccessToken}` }
    });
    assert(adminMetrics.status === 200 && adminMetrics.data.metrics.systemHealth === 'Optimal', 'Admin can access /api/admin/metrics');

    // 6. Login as Viewer
    const viewerLogin = await axios.post(`${BASE_URL}/login`, {
      email: 'viewer@app.com',
      password: 'password123'
    });
    assert(viewerLogin.data.success === true && viewerLogin.data.user.role === 'Viewer', 'Viewer Login Successful');
    const viewerAccessToken = viewerLogin.data.accessToken;

    // 7. Viewer calls GET /content (Should succeed)
    const viewerContent = await axios.get(`${BASE_URL}/content`, {
      headers: { Authorization: `Bearer ${viewerAccessToken}` }
    });
    assert(viewerContent.status === 200, 'Viewer can GET /api/content (Read-only allowed)');

    // 8. Viewer calls POST /content/edit (Should fail with 403 Forbidden)
    try {
      await axios.post(`${BASE_URL}/content/edit`, 
        { id: 2, title: 'Unauthorized Edit Attempt' },
        { headers: { Authorization: `Bearer ${viewerAccessToken}` } }
      );
      assert(false, 'Viewer should NOT be able to POST /content/edit');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'RBAC correctly blocked Viewer from editing (403 Forbidden)');
    }

    // 9. Viewer calls DELETE /content/delete/:id (Should fail with 403 Forbidden)
    try {
      await axios.delete(`${BASE_URL}/content/delete/2`, {
        headers: { Authorization: `Bearer ${viewerAccessToken}` }
      });
      assert(false, 'Viewer should NOT be able to DELETE content');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'RBAC correctly blocked Viewer from deleting (403 Forbidden)');
    }

    // 10. Test Refresh Token endpoint
    const refreshRes = await axios.post(`${BASE_URL}/refresh-token`, {
      refreshToken: adminRefreshToken
    });
    assert(refreshRes.status === 200 && refreshRes.data.accessToken, 'Refresh Token successfully issued fresh Access Token');

    // 11. Test Expired/Corrupted token triggers 401
    try {
      await axios.get(`${BASE_URL}/content`, {
        headers: { Authorization: 'Bearer corrupt_token_string' }
      });
      assert(false, 'Corrupted token should fail');
    } catch (err) {
      assert(err.response && err.response.status === 401, 'Invalid/Expired Token correctly rejected with 401 Unauthorized for Axios interceptor');
    }

    console.log(`\n🎉 VERIFICATION COMPLETE: ${testsPassed}/${testsTotal} tests passed successfully.`);
  } catch (err) {
    console.error('Test Suite Error:', err.message);
    if (err.response) {
      console.error('Response details:', err.response.data);
    }
  }
}

runTests();
