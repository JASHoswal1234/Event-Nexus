# Authentication Troubleshooting Guide

## Issue: "Not authorized, no token provided"

### Problem
Backend returns:
```json
{
  "success": false,
  "error": "Not authorized, no token provided",
  "message": "Not authorized, no token provided"
}
```

### Root Cause
The backend requires authentication (JWT token) for the `/events` endpoint, but:
1. User is not logged in, OR
2. Token is not being sent in the request, OR
3. Token has expired

---

## Solution 1: Make Events Endpoint Public (Backend Fix - Recommended)

If participants should be able to browse events without logging in, update the backend:

### File: `backend/routes/events.js`

**Change from:**
```javascript
router.get("/", protect, getAllEvents);
```

**Change to:**
```javascript
router.get("/", getAllEvents);  // Remove 'protect' middleware
```

This allows unauthenticated users to browse events.

---

## Solution 2: Require Login to View Events (Frontend Fix - Current Implementation)

If all users must be logged in to view events, the frontend now handles this gracefully:

### What the Frontend Does:

1. **Detects Auth Error**: Catches 401 errors from the backend
2. **Shows User-Friendly Message**: Displays "Please log in to view events"
3. **Prevents Crashes**: Returns empty array instead of crashing
4. **Guides User**: Empty state message suggests logging in

### User Flow:
1. User visits `/participant/events` without logging in
2. Backend returns 401 error
3. Frontend shows: "Please log in to view events"
4. User clicks login and authenticates
5. User can now view events

---

## Verification Steps

### 1. Check Token Storage
Open browser DevTools → Application → Local Storage:
- Key: `eventnexus_token`
- Value: Should be a JWT token string

**If missing**: User needs to log in

### 2. Check Token in Request
Open browser DevTools → Network → Select `/events` request → Headers:
- Look for: `Authorization: Bearer <token>`

**If missing**: apiClient interceptor issue (should be fixed now)

### 3. Check Backend Response
Open browser DevTools → Network → Select `/events` request → Response:

**If 401 error**: Token is missing or invalid
**If 200 success**: Token is valid, events returned

---

## Testing Scenarios

### Scenario 1: Unauthenticated User
**Steps:**
1. Clear localStorage: `localStorage.clear()`
2. Visit `/participant/events`

**Expected Behavior:**
- Shows toast: "Please log in to view events"
- Shows empty state with helpful message
- No crash, no blank page

### Scenario 2: Authenticated User
**Steps:**
1. Log in as participant
2. Visit `/participant/events`

**Expected Behavior:**
- Events load successfully
- Events grid displays
- No errors

### Scenario 3: Expired Token
**Steps:**
1. Have an old/expired token in localStorage
2. Visit `/participant/events`

**Expected Behavior:**
- Shows toast: "Session expired. Please log in again."
- Redirects to login page (if not on landing page)
- Token cleared from localStorage

---

## Backend Endpoint Authentication Matrix

Based on the implementation document, here's which endpoints should require auth:

| Endpoint | Method | Auth Required? | Role |
|----------|--------|----------------|------|
| `/auth/login` | POST | ❌ No | Public |
| `/auth/register` | POST | ❌ No | Public |
| `/auth/me` | GET | ✅ Yes | Any authenticated |
| `/events` | GET | ⚠️ **Depends** | See note below |
| `/events/:id` | GET | ⚠️ **Depends** | See note below |
| `/events` | POST | ✅ Yes | Admin only |
| `/events/:id` | PUT | ✅ Yes | Admin only |
| `/events/:id` | DELETE | ✅ Yes | Admin only |
| `/registrations` | POST | ✅ Yes | Participant |
| `/registrations/:eventId` | GET | ✅ Yes | Admin |
| `/registrations/:id/checkin` | PATCH | ✅ Yes | Admin |
| `/teams` | POST | ✅ Yes | Participant |
| `/teams/join` | POST | ✅ Yes | Participant |
| `/teams/:eventId` | GET | ✅ Yes | Admin or Participant |
| `/me/events` | GET | ✅ Yes | Participant |
| `/announcements` | POST | ✅ Yes | Admin |
| `/announcements/:eventId` | GET | ✅ Yes | Any authenticated |

**Note on `/events` GET endpoints:**
- **Option A (Recommended)**: Make public so anyone can browse events
- **Option B (Current)**: Require authentication - users must log in to browse

---

## Quick Fixes

### Fix 1: Clear All Auth Data
```javascript
// In browser console
localStorage.removeItem('eventnexus_token');
location.reload();
```

### Fix 2: Check Token Validity
```javascript
// In browser console
const token = localStorage.getItem('eventnexus_token');
console.log('Token:', token);
console.log('Token exists:', !!token);
```

### Fix 3: Manual Token Test
```javascript
// In browser console
fetch('http://localhost:5000/api/events', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('eventnexus_token')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

---

## Common Issues & Solutions

### Issue: Token exists but still getting 401
**Cause**: Token is expired or invalid
**Solution**: Log out and log in again

### Issue: Token not being sent in requests
**Cause**: apiClient interceptor not working
**Solution**: Verify `apiClient.js` has the request interceptor (already fixed)

### Issue: Infinite redirect loop
**Cause**: 401 handler redirecting on every request
**Solution**: Check `isRedirecting` flag in apiClient (already fixed)

### Issue: Blank page after 401 error
**Cause**: Frontend trying to map over error object
**Solution**: Array safety checks in place (already fixed)

---

## Recommended Backend Configuration

For the best user experience, configure backend routes as follows:

```javascript
// backend/routes/events.js

// Public - anyone can browse events
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Protected - admin only
router.post("/", protect, authorize('admin'), createEvent);
router.put("/:id", protect, authorize('admin'), updateEvent);
router.delete("/:id", protect, authorize('admin'), deleteEvent);

// Protected - participant only
router.post("/registrations", protect, authorize('participant'), registerForEvent);

// Protected - admin only
router.get("/registrations/:eventId", protect, authorize('admin'), getEventRegistrations);
```

This allows:
- ✅ Anyone to browse events (good for marketing)
- ✅ Only admins to manage events
- ✅ Only participants to register
- ✅ Only admins to view registrations

---

## Summary

The frontend is now resilient to authentication errors:
- ✅ Handles "no token" errors gracefully
- ✅ Shows user-friendly error messages
- ✅ Prevents crashes and blank pages
- ✅ Guides users to log in when needed

**Next Step**: Decide whether `/events` should be public or require authentication, then configure the backend accordingly.
