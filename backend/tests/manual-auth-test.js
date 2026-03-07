/**
 * Manual test to verify auth controller works
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authController = require('../controllers/authController');
const User = require('../models/User');

async function runTest() {
  // Setup
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  console.log('✓ Database connected');

  // Test 1: Register
  console.log('\n--- Test 1: Register ---');
  const registerReq = {
    body: { email: 'test@example.com', password: 'password123' }
  };
  const registerRes = {
    status: function(code) {
      console.log(`Status: ${code}`);
      return this;
    },
    json: function(data) {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  };
  const registerNext = (err) => {
    if (err) console.log('Error:', err.message, `(${err.statusCode})`);
  };

  await authController.register(registerReq, registerRes, registerNext);
  
  // Wait for async operations
  await new Promise(resolve => setTimeout(resolve, 200));

  // Verify user was created
  const user = await User.findOne({ email: 'test@example.com' });
  console.log('User created:', user ? 'YES' : 'NO');
  console.log('Role:', user?.role);

  // Test 2: Duplicate registration
  console.log('\n--- Test 2: Duplicate Registration ---');
  await authController.register(registerReq, registerRes, registerNext);
  await new Promise(resolve => setTimeout(resolve, 200));

  // Test 3: Login
  console.log('\n--- Test 3: Login ---');
  const loginReq = {
    body: { email: 'test@example.com', password: 'password123' }
  };
  const loginRes = {
    status: function(code) {
      console.log(`Status: ${code}`);
      return this;
    },
    json: function(data) {
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  };
  const loginNext = (err) => {
    if (err) console.log('Error:', err.message, `(${err.statusCode})`);
  };

  await authController.login(loginReq, loginRes, loginNext);
  await new Promise(resolve => setTimeout(resolve, 200));

  // Test 4: Invalid credentials
  console.log('\n--- Test 4: Invalid Credentials ---');
  const invalidReq = {
    body: { email: 'test@example.com', password: 'wrongpassword' }
  };
  await authController.login(invalidReq, loginRes, loginNext);
  await new Promise(resolve => setTimeout(resolve, 200));

  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('\n✓ Tests complete');
}

runTest().catch(console.error);
