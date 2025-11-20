
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from '../constants';

// Initialize Firebase
// This initializes the Real Firebase app. 
// If the keys in constants.ts are still "REPLACE_WITH...", this might log warnings, 
// but won't crash the app until you try to click login.

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

export { auth };
