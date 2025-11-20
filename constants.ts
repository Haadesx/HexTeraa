
import { LatLng } from "./types";

// Hexagon sizing approx ~100m radius
export const HEX_SIZE_DEGREES = 0.0015; 

export const MOCK_START_LOCATION: LatLng = {
  lat: 40.7128, // NYC Default if geolocation fails
  lng: -74.0060
};

export const PLAYER_ID = 'player';

// For simulation mode
export const SIMULATION_RADIUS = 0.004; // degrees
export const SIMULATION_SPEED = 0.00008; // degrees per tick

export const COLORS = {
  OWNED: '#10b981', // Emerald 500
  OWNED_FILL: '#10b981',
  RIVAL: '#ef4444', // Red 500
  RIVAL_FILL: '#ef4444',
  CONTESTED: '#f59e0b', // Amber 500
  NEUTRAL: '#64748b', // Slate 500
  PATH: '#3b82f6', // Blue 500
};

export const RIVAL_NAMES = [
  "ShadowRunner", "UrbanFox", "VelocityX", "ConcreteKing", "NightOwl"
];

// --- FIREBASE CONFIGURATION ---
// Credentials for HexTerra project
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA5fp3izSHi5j9OSYII32QVxzYIAM65jU8",
  authDomain: "hexterra-ec6cd.firebaseapp.com",
  projectId: "hexterra-ec6cd",
  storageBucket: "hexterra-ec6cd.firebasestorage.app",
  messagingSenderId: "799462430448",
  appId: "1:799462430448:web:29a2e504106b8ef90dd435",
  measurementId: "G-JDZE3F317G"
};
