import { LatLng } from "./types";

// Hexagon sizing approx ~100m radius
export const HEX_SIZE_DEGREES = 0.0015; 

export const MOCK_START_LOCATION: LatLng = {
  lat: 40.7128, // NYC Default if geolocation fails
  lng: -74.0060
};

export const PLAYER_ID = 'hero_player';

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