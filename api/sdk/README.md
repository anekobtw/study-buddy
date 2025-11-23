# Study Buddy TypeScript SDK

TypeScript client SDK for the Study Buddy API, wrapped with Firebase Authentication (email/password) for token management.

This SDK is framework-agnostic and works in browsers or Node (requires a fetch polyfill in old environments).

## Installation

The SDK expects `firebase` to be available as a peer dependency.

```
npm install study-buddy-sdk firebase
# or
yarn add study-buddy-sdk firebase
```

If using the source from this repository (not published), build first:

```
cd sdk
npm install
npm run build
```

## Quick start

```
import { AuthManager, ApiClient } from 'study-buddy-sdk';

// 1) Initialize Firebase Auth manager
const auth = new AuthManager({
  apiKey: '<FIREBASE_WEB_API_KEY>',
  authDomain: '<your>.firebaseapp.com',
  projectId: '<projectId>',
  appId: '<appId>'
});

// 2) Create API client with token provider
const api = new ApiClient({
  baseUrl: 'http://localhost:8000',
  tokenProvider: auth.getTokenProvider(),
});

// 3) Sign in and call endpoints
await auth.signInWithEmail('user@usf.edu', 'your-password');

const health = await api.health();
console.log(health);

await api.updateProfile({
  FullName: 'Jane Doe',
  UsfEmail: 'jane@usf.edu',
  PreferredStudyTime: 'morning',
  Classes: { Calculus: 2, Chemistry: 0 },
  major: 'Computer Science',
  year: 'junior',
  description: 'Looking for a study buddy!'
});

const next = await api.nextBatch();
console.log(next.batch);

const swipe = await api.submitSwipe({ targetUid: '<otherUid>', direction: 'right' });
console.log(swipe.match);

const matches = await api.getMatches();
console.log(matches.matches);
```

## API surface

- AuthManager
  - constructor(config)
  - signInWithEmail(email, password)
  - signOut()
  - getIdToken(forceRefresh?)
  - getTokenProvider()

- ApiClient
  - health(): GET /health
  - updateProfile(payload): POST /api/update-profile
  - nextBatch(): GET /api/next_batch
  - submitSwipe(payload): POST /api/submit_swipe
  - getMatches(): GET /api/matches

## Notes

- The SDK automatically attaches the Firebase ID token as `Authorization: Bearer <token>` when available.
- Ensure your backend is running and Firebase Admin is properly configured there.
- For Node.js environments without global fetch, pass a `fetchImpl` in ApiClient options (e.g., from `node-fetch`).
