# Authentication Verification Guide

## Quick Verification Steps

### 1. Verify Backend is Running
```bash
cd backend
npm run dev
```

Expected output:
```
EventNexus API server running on port 5000
Database connection established
```

### 2. Verify Frontend is Running
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## Test Admin Login

### Step 1: Open Browser
Navigate to: `http://localhost:5173/login`

### Step 2: Enter Admin Credentials
- Email: `admin@eventnexus.com`
- Password: `admin123`

### Step 3: Click "Sign in"

### Step 4: Verify Success
✅ Success toast appears: "Login successful!"
✅ URL changes to: `http://localhost:5173/admin/dashboard`
✅ Admin sidebar visible on left
✅ Dashboard content loads

### Step 5: Verify Token Storage
Open browser console (F12) and run:
```javascript
localStorage.getItem('eventnexus_token')
```
Expected: JWT token string

### Step 6: Verify User Object
In React DevTools, check AuthContext:
```javascript
user: {
  id: "...",
  email: "admin@eventnexus.com",
  role: "admin"
}
```

### Step 7: Test Protected Routes
Try navigating to:
- ✅ `/admin/events` - Should work
- ✅ `/admin/dashboard` - Should work
- ❌ `/participant/events` - Should redirect to `/admin/dashboard`

---

## Test Participant Login

### Step 1: Logout
Click logout button in navbar

### Step 2: Navigate to Login
Go to: `http://localhost:5173/login`

### Step 3: Enter Participant Credentials
- Email: `participant@eventnexus.com`
- Password: `participant123`

### Step 4: Click "Sign in"

### Step 5: Verify Success
✅ Success toast appears: "Login successful!"
✅ URL changes to: `http://localhost:5173/participant/events`
✅ Participant navbar visible at top
✅ Events list loads

### Step 6: Test Protected Routes
Try navigating to:
- ✅ `/participant/events` - Should work
- ✅ `/participant/my-events` - Should work
- ❌ `/admin/dashboard` - Should redirect to `/participant/events`

---

## Test Role-Based Redirection

### Test 1: Admin Accessing Participant Routes
1. Login as admin
2. Manually navigate to: `http://localhost:5173/participant/events`
3. Expected: Redirected to `/admin/dashboard`

### Test 2: Participant Accessing Admin Routes
1. Login as participant
2. Manually navigate to: `http://localhost:5173/admin/dashboard`
3. Expected: Redirected to `/participant/events`

### Test 3: Unauthenticated User
1. Logout
2. Manually navigate to: `http://localhost:5173/admin/dashboard`
3. Expected: Redirected to `/login`

---

## Test Token Persistence

### Test 1: Page Refresh
1. Login as admin
2. Navigate to `/admin/events`
3. Press F5 to refresh
4. Expected: Still logged in, still on `/admin/events`

### Test 2: Direct URL Access
1. Login as admin
2. Close tab
3. Open new tab
4. Navigate to: `http://localhost:5173/admin/dashboard`
5. Expected: Automatically logged in (if token not expired)

---

## Test Logout

### Test 1: Admin Logout
1. Login as admin
2. Click logout button
3. Expected:
   - Redirected to landing page (`/`)
   - Token removed from localStorage
   - Cannot access `/admin/dashboard` without login

### Test 2: Participant Logout
1. Login as participant
2. Click logout button
3. Expected:
   - Redirected to landing page (`/`)
   - Token removed from localStorage
   - Cannot access `/participant/events` without login

---

## Browser Console Verification

### Check Token
```javascript
// Should return JWT token string
localStorage.getItem('eventnexus_token')
```

### Decode Token (Manual)
```javascript
const token = localStorage.getItem('eventnexus_token');
if (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(window.atob(base64));
  console.log('Token payload:', payload);
  console.log('User ID:', payload.id);
  console.log('User role:', payload.role);
  console.log('Expires:', new Date(payload.exp * 1000));
}
```

### Check API Response
1. Open Network tab (F12)
2. Login
3. Find `/api/auth/login` request
4. Check Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "...",
    "email": "admin@eventnexus.com",
    "role": "admin"
  }
}
```

---

## Common Issues & Solutions

### Issue: "Login successful" but redirected to wrong page

**Check**:
1. Open browser console
2. Look for console.warn messages
3. Check if role is undefined

**Solution**:
- Verify backend is returning user.role in response
- Check Network tab for /api/auth/login response
- Ensure backend seed data has role field

### Issue: Redirected to login immediately after login

**Check**:
1. Token in localStorage
2. Network tab for errors
3. Console for errors

**Solution**:
- Check if backend is running
- Verify CORS settings
- Check if token is being stored

### Issue: Can access wrong role's routes

**Check**:
1. User object in AuthContext
2. ProtectedRoute implementation
3. Route configuration

**Solution**:
- Verify user.role is set correctly
- Check ProtectedRoute requiredRole prop
- Ensure routes have correct requiredRole

### Issue: Page refresh logs out user

**Check**:
1. Token in localStorage after refresh
2. getCurrentUser API call
3. Console errors

**Solution**:
- Verify token is persisted in localStorage
- Check if backend /api/auth/me endpoint works
- Verify AuthContext initialization logic

---

## Expected Network Requests

### On Login
```
POST /api/auth/login
Request: { email, password }
Response: { success, token, user: { id, email, role } }
```

### On App Load (with token)
```
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
Response: { success, user: { id, email, role } }
```

### On Protected Route Access
```
GET /api/events (or other endpoint)
Headers: { Authorization: "Bearer <token>" }
Response: { success, data }
```

---

## Success Criteria

✅ Admin login redirects to `/admin/dashboard`
✅ Participant login redirects to `/participant/events`
✅ Admin cannot access participant routes
✅ Participant cannot access admin routes
✅ Unauthenticated users redirected to login
✅ Token persists across page refresh
✅ Logout clears token and redirects
✅ Role-based access control working
✅ No console errors
✅ All protected routes secured

---

## Quick Test Script

Copy and paste this into browser console after login:

```javascript
// Authentication Verification Script
console.log('=== EventNexus Auth Verification ===');

// Check token
const token = localStorage.getItem('eventnexus_token');
console.log('1. Token exists:', !!token);

// Decode token
if (token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    console.log('2. Token payload:', payload);
    console.log('3. User role:', payload.role);
    console.log('4. Token expires:', new Date(payload.exp * 1000).toLocaleString());
    
    // Check if expired
    const isExpired = Date.now() >= payload.exp * 1000;
    console.log('5. Token expired:', isExpired);
  } catch (e) {
    console.error('Error decoding token:', e);
  }
}

// Check current URL
console.log('6. Current URL:', window.location.pathname);

// Expected dashboard based on role
if (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(window.atob(base64));
  const expectedDashboard = payload.role === 'admin' 
    ? '/admin/dashboard' 
    : '/participant/events';
  console.log('7. Expected dashboard:', expectedDashboard);
  console.log('8. On correct dashboard:', window.location.pathname.startsWith(expectedDashboard.split('/')[1]));
}

console.log('=== Verification Complete ===');
```

---

## Status

✅ Verification guide complete
✅ Test steps documented
✅ Common issues covered
✅ Quick test script provided
✅ Success criteria defined

Ready for testing!
