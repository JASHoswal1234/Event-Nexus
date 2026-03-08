# EventNexus Test Credentials

## Admin Account

**Email**: `admin@eventnexus.com`  
**Password**: `admin123`  
**Expected Redirect**: `/admin/dashboard`

### Admin Access
- ✅ Admin Dashboard
- ✅ Manage Events (Create, Edit, Delete)
- ✅ View Event Details
- ✅ View Attendees
- ✅ Check-in Participants
- ✅ View Teams
- ✅ Send Announcements
- ❌ Participant Events Page (redirected to admin dashboard)
- ❌ My Events Page (redirected to admin dashboard)

---

## Participant Account

**Email**: `participant@eventnexus.com`  
**Password**: `participant123`  
**Expected Redirect**: `/participant/events`

### Participant Access
- ✅ Browse Events
- ✅ Register for Events
- ✅ My Events Page
- ✅ Create Team
- ✅ Join Team
- ✅ View Team Details
- ❌ Admin Dashboard (redirected to participant events)
- ❌ Manage Events (redirected to participant events)

---

## Testing Login Flow

### Test Admin Login
1. Navigate to `/login`
2. Enter admin credentials
3. Click "Sign in"
4. Verify success toast appears
5. Verify redirect to `/admin/dashboard`
6. Verify admin sidebar visible
7. Verify can access admin routes

### Test Participant Login
1. Navigate to `/login`
2. Enter participant credentials
3. Click "Sign in"
4. Verify success toast appears
5. Verify redirect to `/participant/events`
6. Verify participant navbar visible
7. Verify can access participant routes

---

## Testing Role-Based Access

### Admin Trying Participant Routes
1. Log in as admin
2. Try to navigate to `/participant/events`
3. Verify redirected to `/admin/dashboard`
4. Try to navigate to `/participant/my-events`
5. Verify redirected to `/admin/dashboard`

### Participant Trying Admin Routes
1. Log in as participant
2. Try to navigate to `/admin/dashboard`
3. Verify redirected to `/participant/events`
4. Try to navigate to `/admin/events`
5. Verify redirected to `/participant/events`

---

## Testing Token Persistence

### Page Refresh
1. Log in as admin
2. Navigate to `/admin/events`
3. Refresh the page (F5)
4. Verify still logged in
5. Verify still on admin page
6. Verify token in localStorage

### Browser Restart
1. Log in as admin
2. Close browser
3. Reopen browser
4. Navigate to `/admin/dashboard`
5. Verify still logged in (if token not expired)

---

## Testing Logout

### Admin Logout
1. Log in as admin
2. Click logout button
3. Verify redirected to landing page
4. Verify token removed from localStorage
5. Try to access `/admin/dashboard`
6. Verify redirected to `/login`

### Participant Logout
1. Log in as participant
2. Click logout button
3. Verify redirected to landing page
4. Verify token removed from localStorage
5. Try to access `/participant/events`
6. Verify redirected to `/login`

---

## Backend Seeded Data

If using the backend seed data (`backend/utils/seedData.js`), the following accounts should be available:

### Admin
- Email: `admin@eventnexus.com`
- Password: `admin123`
- Role: `admin`

### Participants
- Email: `participant@eventnexus.com`
- Password: `participant123`
- Role: `participant`

---

## Creating New Test Accounts

### Register New Admin (via Backend)
```javascript
// In backend, manually create admin user
const User = require('./models/User');

const admin = await User.create({
  email: 'newadmin@eventnexus.com',
  password: 'password123',
  role: 'admin'
});
```

### Register New Participant (via Frontend)
1. Navigate to `/register`
2. Enter email and password
3. Click "Sign up"
4. New user created with role: `participant` (default)
5. Login with new credentials

---

## Troubleshooting

### Issue: Redirected to wrong dashboard
**Solution**: Check user.role in browser console:
```javascript
// In browser console
localStorage.getItem('eventnexus_token')
// Copy token and decode at jwt.io to see role
```

### Issue: Cannot access protected routes
**Solution**: Check if token exists:
```javascript
// In browser console
localStorage.getItem('eventnexus_token')
// If null, login again
```

### Issue: Token expired
**Solution**: Login again to get new token
- Default expiration: 30 days (configured in backend)

### Issue: Role not found in user object
**Solution**: Check backend response:
```javascript
// In browser Network tab
// Look at /api/auth/login response
// Verify user.role is present
```

---

## Quick Test Script

Run this in browser console after login:

```javascript
// Check authentication state
const token = localStorage.getItem('eventnexus_token');
console.log('Token exists:', !!token);

// Decode token (requires jwt-decode library or manual decode)
if (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = JSON.parse(window.atob(base64));
  console.log('Token payload:', payload);
  console.log('User role:', payload.role);
}

// Check current user in AuthContext
// (This requires React DevTools)
```

---

## Expected Behavior Summary

| User Role   | Login Redirect          | Can Access Admin Routes | Can Access Participant Routes |
|-------------|-------------------------|-------------------------|-------------------------------|
| Admin       | `/admin/dashboard`      | ✅ Yes                  | ❌ No (redirected)            |
| Participant | `/participant/events`   | ❌ No (redirected)      | ✅ Yes                        |
| Not Logged In | N/A                   | ❌ No (login required)  | ❌ No (login required)        |

---

## Status

✅ Test credentials documented
✅ Login flow test steps provided
✅ Role-based access test steps provided
✅ Token persistence test steps provided
✅ Logout test steps provided
✅ Troubleshooting guide included

Ready for testing!
