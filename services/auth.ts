
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signOut
} from 'firebase/auth';
import { auth } from './firebase';

// Real Backend Authentication Service via Firebase

export interface AuthResponse {
  success: boolean;
  user?: {
    name: string;
    id: string;
    provider: string;
    photoUrl?: string;
  };
  error?: string;
}

export const loginWithProvider = async (providerName: 'google' | 'apple'): Promise<AuthResponse> => {
  // Basic check if config is still placeholder
  if (auth.app.options.apiKey === "REPLACE_WITH_REAL_API_KEY") {
    return {
      success: false,
      error: "Firebase Keys missing in constants.ts"
    };
  }

  try {
    let provider;
    if (providerName === 'google') {
      provider = new GoogleAuthProvider();
    } else if (providerName === 'apple') {
      provider = new OAuthProvider('apple.com');
      provider.addScope('name');
      provider.addScope('email');
    } else {
      throw new Error('Unsupported provider');
    }

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // This automatically links the account in the Firebase Backend
    return {
      success: true,
      user: {
        name: user.displayName || `Runner_${user.uid.slice(0, 4)}`,
        id: user.uid,
        provider: providerName,
        photoUrl: user.photoURL || undefined
      }
    };
  } catch (error: any) {
    console.error("Auth Error:", error);
    
    let errorMessage = "Authentication failed.";
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = "Login cancelled.";
    } else if (error.code === 'auth/configuration-not-found') {
      errorMessage = "Provider not configured in Firebase Console.";
    } else if (error.code === 'auth/api-key-not-valid') {
      errorMessage = "Invalid API Key in constants.ts.";
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = "Enable this provider in Firebase Console -> Authentication -> Sign-in method.";
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};
