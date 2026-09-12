const { User, PasswordReset } = require('../models');

const BASE_URL = 'http://localhost:5000/api';

async function postJson(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runAuthTests() {
  console.log('🧪 Starting Comprehensive Patient Email/Password & Google Auth Test Suite...\n');

  const testEmail = `patient_test_${Date.now()}@example.com`;
  const testPassword = 'SecurePassword123';
  const newPassword = 'NewSecretPassword999';

  try {
    // 1. Test Password Validation (Too short)
    console.log('Test 1: Password validation (too short)');
    const shortRes = await postJson(`${BASE_URL}/auth/patient/signup`, {
      name: 'Test Patient',
      email: testEmail,
      password: 'short',
    });
    if (shortRes.status === 400 && shortRes.data.message.includes('8 characters')) {
      console.log('  ✅ Correctly rejected short password:', shortRes.data.message);
    } else {
      throw new Error(`Expected 400 with 8 characters message, got ${shortRes.status}`);
    }

    // 2. Test Password Validation (No number)
    console.log('\nTest 2: Password validation (no number)');
    const noNumRes = await postJson(`${BASE_URL}/auth/patient/signup`, {
      name: 'Test Patient',
      email: testEmail,
      password: 'PasswordWithoutNumbers',
    });
    if (noNumRes.status === 400 && noNumRes.data.message.includes('number')) {
      console.log('  ✅ Correctly rejected password without numbers:', noNumRes.data.message);
    } else {
      throw new Error(`Expected 400 with number requirement message, got ${noNumRes.status}`);
    }

    // 3. Test Patient Signup Success
    console.log('\nTest 3: Patient Signup (Email + Password)');
    const signupRes = await postJson(`${BASE_URL}/auth/patient/signup`, {
      name: 'John Patient',
      email: testEmail,
      password: testPassword,
    });
    if (!signupRes.ok) throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
    console.log('  ✅ Signup Response Status:', signupRes.status);
    console.log('  ✅ Token returned:', Boolean(signupRes.data.token));
    console.log('  ✅ User Role:', signupRes.data.user.role);
    console.log('  ✅ Auth Provider:', signupRes.data.user.auth_provider);

    // 4. Test Duplicate Signup Prevention
    console.log('\nTest 4: Duplicate Email Prevention');
    const dupRes = await postJson(`${BASE_URL}/auth/patient/signup`, {
      name: 'Duplicate Patient',
      email: testEmail,
      password: testPassword,
    });
    if (dupRes.status === 400) {
      console.log('  ✅ Correctly rejected duplicate email:', dupRes.data.message);
    } else {
      throw new Error(`Expected 400 on duplicate, got ${dupRes.status}`);
    }

    // 5. Test Patient Login Success
    console.log('\nTest 5: Patient Login with Email + Password');
    const loginRes = await postJson(`${BASE_URL}/auth/patient/login`, {
      email: testEmail,
      password: testPassword,
    });
    if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    console.log('  ✅ Login Response Status:', loginRes.status);
    console.log('  ✅ Token returned:', Boolean(loginRes.data.token));
    console.log('  ✅ User Profile Name:', loginRes.data.user.name);

    // 6. Test Google User Password Attempt
    console.log('\nTest 6: Google User Attempting Password Login');
    const googleUserEmail = `google_patient_${Date.now()}@gmail.com`;
    await User.create({
      name: 'Google Patient',
      email: googleUserEmail,
      password_hash: null,
      role: 'patient',
      auth_provider: 'google',
      google_id: `g_${Date.now()}`,
    });

    const googlePwdRes = await postJson(`${BASE_URL}/auth/patient/login`, {
      email: googleUserEmail,
      password: 'AnyPassword123',
    });
    if (googlePwdRes.status === 400 && googlePwdRes.data.message.includes('Google Sign-In')) {
      console.log('  ✅ Correctly instructed to use Google Sign-In:', googlePwdRes.data.message);
    } else {
      throw new Error(`Expected 400 with Google instruction, got ${googlePwdRes.status}: ${JSON.stringify(googlePwdRes.data)}`);
    }

    // 7. Test Forgot Password Flow
    console.log('\nTest 7: Forgot Password Request');
    const forgotRes = await postJson(`${BASE_URL}/auth/forgot-password`, {
      email: testEmail,
    });
    console.log('  ✅ Forgot Password Response:', forgotRes.data.message);

    // Retrieve generated token from DB to test reset
    const resetRecord = await PasswordReset.findOne({
      where: { user_id: signupRes.data.user.id },
      order: [['created_at', 'DESC']],
    });
    console.log('  ✅ Reset Token Generated in DB:', Boolean(resetRecord?.token));

    // 8. Test Reset Password Flow
    console.log('\nTest 8: Reset Password Execution');
    const resetRes = await postJson(`${BASE_URL}/auth/reset-password`, {
      token: resetRecord.token,
      newPassword: newPassword,
    });
    console.log('  ✅ Reset Password Response:', resetRes.data.message);

    // 9. Test Login with New Password
    console.log('\nTest 9: Login with New Reset Password');
    const newLoginRes = await postJson(`${BASE_URL}/auth/patient/login`, {
      email: testEmail,
      password: newPassword,
    });
    if (!newLoginRes.ok) throw new Error(`Login with new password failed: ${JSON.stringify(newLoginRes.data)}`);
    console.log('  ✅ Successfully logged in with new password! User ID:', newLoginRes.data.user.id);

    // 10. Confirm Old Password Fails
    console.log('\nTest 10: Confirm Old Password No Longer Works');
    const oldPwdRes = await postJson(`${BASE_URL}/auth/patient/login`, {
      email: testEmail,
      password: testPassword,
    });
    if (oldPwdRes.status === 401) {
      console.log('  ✅ Old password correctly denied access (401)');
    } else {
      throw new Error(`Expected 401 for old password, got ${oldPwdRes.status}`);
    }

    console.log('\n🎉 ALL 10 AUTH TESTS PASSED WITH 100% ACCURACY!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

runAuthTests();
