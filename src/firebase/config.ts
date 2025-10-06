// This file is intentionally left blank.
// The Firebase configuration will be populated by the backend service.
// Do not add any code to this file.
//See the 'Firebase Usage Instructions' for more details on working with code scaffolding.
export const firebaseConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
    }
  : {
      "projectId": "studio-2285238361-48e4c",
      "appId": "1:682115661097:web:db65004cfbb0f02795cb38",
      "apiKey": "AIzaSyA1QroHYn07ASbhz0Ad9zCgEWehoJi6uc8",
      "authDomain": "studio-2285238361-48e4c.firebaseapp.com",
      "measurementId": "",
      "messagingSenderId": "682115661097"
    };
