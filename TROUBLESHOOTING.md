# Family Circle Troubleshooting

## Cannot Create Family Circle

### Step 1: Check Firebase Rules
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Realtime Database** → **Rules**
4. Make sure you have these rules:

```json
{
  "rules": {
    "familyCircles": {
      "$ownerId": {
        ".read": "auth != null && (auth.uid == $ownerId || root.child('userCircles').child(auth.uid).child('circleId').val() == $ownerId)",
        ".write": "auth != null && auth.uid == $ownerId",
        "members": {
          "$memberId": {
            ".read": "auth != null && (auth.uid == $ownerId || root.child('userCircles').child(auth.uid).child('circleId').val() == $ownerId)",
            ".write": "auth != null && (auth.uid == $ownerId || auth.uid == $memberId)"
          }
        }
      }
    },
    "inviteCodes": {
      ".read": "auth != null",
      "$code": {
        ".write": "auth != null"
      }
    },
    "userCircles": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

5. Click **Publish**

### Step 2: Check Authentication
1. Open browser console (F12)
2. Look for error messages
3. Common errors:
   - `PERMISSION_DENIED` → Rules not updated
   - `auth is null` → Not signed in
   - `Network error` → Internet connection

### Step 3: Verify User is Signed In
1. Check if you see your profile photo in the app
2. Try signing out and signing in again
3. Check console for: `auth.currentUser`

### Step 4: Check Browser Console
Open the console and look for these logs:
```
Creating circle with: { userId: "...", name: "...", owner: "..." }
Circle data: { ... }
Circle created successfully
```

If you see an error, it will show:
```
Error creating family circle: [error message]
```

### Step 5: Test Firebase Connection
Run this in browser console:
```javascript
// Check if Firebase is initialized
console.log('Firebase:', firebase);

// Check if user is authenticated
console.log('Current user:', firebase.auth().currentUser);

// Try to write test data
firebase.database().ref('test').set({ test: true })
  .then(() => console.log('Write successful'))
  .catch(err => console.error('Write failed:', err));
```

### Step 6: Common Issues

**Issue: "PERMISSION_DENIED"**
- Solution: Update Firebase rules (see Step 1)
- Make sure rules are published
- Wait 30 seconds for rules to propagate

**Issue: "auth is null"**
- Solution: Sign in with Google
- Check if authentication is enabled in Firebase Console
- Verify Google sign-in is configured

**Issue: "Network error"**
- Solution: Check internet connection
- Verify Firebase project is active
- Check if database URL is correct in `firebase.js`

**Issue: Nothing happens when clicking Create**
- Solution: Check browser console for errors
- Verify form input is not empty
- Check if button is disabled

### Step 7: Verify Firebase Configuration
Check `src/config/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...", // Must be correct!
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Make sure `databaseURL` matches your Firebase project.

### Step 8: Test with Simple Rules (Temporary)
For testing only, try these permissive rules:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

⚠️ **WARNING**: These rules allow any authenticated user to read/write everything. Only use for testing, then revert to secure rules!

If this works, the issue is with the specific rules. Gradually add back the secure rules.

## Still Not Working?

1. Check Firebase Console → Realtime Database → Data
   - Do you see any data being written?
   - Is the database in the correct region?

2. Check Firebase Console → Authentication
   - Is the user listed?
   - Is Google sign-in enabled?

3. Check browser console for ALL errors
   - Copy the full error message
   - Search for the error online

4. Try in incognito mode
   - Rules out browser extension issues
   - Fresh authentication state

5. Check Firebase project status
   - Is billing enabled (if required)?
   - Is the project active?
   - Any quota limits reached?

## Debug Mode

The app now has debug logging. Check console for:
- `Creating circle with: ...`
- `Circle data: ...`
- `Circle created successfully`
- Or error messages

## Need More Help?

1. Copy the error from browser console
2. Check Firebase Console → Realtime Database → Rules → Simulator
3. Test the write operation with your user ID
4. Open an issue on GitHub with:
   - Error message
   - Browser console logs
   - Firebase rules screenshot
