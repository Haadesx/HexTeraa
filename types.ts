
export interface LatLng {
  lat: number;
  lng: number;
}

export enum CellStatus {
  NEUTRAL = 'NEUTRAL',
  OWNED = 'OWNED',
  CONTESTED = 'CONTESTED',
  RIVAL = 'RIVAL'
}

export type GameMode = 'GPS' | 'SIMULATION';

export interface UserProfile {
  name: string;
  isNewPlayer: boolean;
}

export interface HexCell {
  id: string; // Coordinate key "q,r"
  q: number;
  r: number;
  center: LatLng;
  corners: LatLng[];
  status: CellStatus;
  ownerId?: string; // "player" or "rival_x"
  lastVisited?: number; // Timestamp
  visitCount: number;
}

export interface PlayerStats {
  areaCapturedKm2: number;
  totalHexes: number;
  rank: number;
  weeklyChange: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  area: number; // km2
  isRival: boolean;
}

export interface GameState {
  mode: GameMode;
  isRunning: boolean;
  currentPosition: LatLng | null;
  path: LatLng[];
  cells: Map<string, HexCell>;
  stats: PlayerStats;
  lastMessage: string | null;
  showSummary: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  type: 'info' | 'success' | 'warning';
}
