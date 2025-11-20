import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameMap from './components/GameMap';
import { Dashboard } from './components/Dashboard';
import { LatLng, HexCell, GameState, CellStatus, LeaderboardEntry } from './types';
import { pointToHex, createHexCell, getNeighbors, getCellId } from './utils/hexGrid';
import { HEX_SIZE_DEGREES, MOCK_START_LOCATION, PLAYER_ID, RIVAL_NAMES } from './constants';
import { generateMissionBrief, generateDebrief, generateDefenseAlert } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    currentPosition: null, // Will default to mock if GPS fails
    path: [],
    cells: new Map(),
    stats: {
      areaCapturedKm2: 0,
      totalHexes: 0,
      rank: 42,
      weeklyChange: 0,
    },
    lastMessage: null,
    isAnalyzing: false,
    showSummary: false
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: 'r1', name: 'ShadowRunner', area: 12.5, isRival: true },
    { id: 'r2', name: 'UrbanFox', area: 8.2, isRival: true },
    { id: PLAYER_ID, name: 'YOU', area: 0, isRival: false },
    { id: 'r3', name: 'VelocityX', area: 5.1, isRival: true },
  ]);

  // Refs for location watching
  const watchId = useRef<number | null>(null);

  // --- Helpers ---

  // Simulate loading surrounding rival cells
  const loadSurroundingCells = useCallback((center: LatLng) => {
    setGameState(prev => {
      const newCells = new Map<string, HexCell>(prev.cells);
      const { q, r } = pointToHex(center, HEX_SIZE_DEGREES);
      
      // Create a 5-radius hex grid around user
      // Hex loop logic
      const radius = 5;
      for (let dq = -radius; dq <= radius; dq++) {
        for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
          const cellQ = q + dq;
          const cellR = r + dr;
          const id = getCellId(cellQ, cellR);
          
          if (!newCells.has(id)) {
             // 30% chance a cell is owned by a rival initially
             const isRival = Math.random() < 0.3;
             const cell = createHexCell(cellQ, cellR, isRival ? CellStatus.RIVAL : CellStatus.NEUTRAL);
             if (isRival) {
               cell.ownerId = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
             }
             newCells.set(id, cell);
          }
        }
      }
      return { ...prev, cells: newCells };
    });
  }, []);

  // GPS Watcher
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      setGameState(prev => ({ ...prev, currentPosition: MOCK_START_LOCATION }));
      loadSurroundingCells(MOCK_START_LOCATION);
      return;
    }

    const success = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const newPos = { lat: latitude, lng: longitude };
      
      setGameState(prev => {
        const isFirstFix = !prev.currentPosition;
        // If it's the first fix, initialize the grid around user
        if (isFirstFix) {
          // We can't call loadSurroundingCells here directly due to state update cycle inside render, 
          // but we can trigger it via an effect or just handle it next tick.
          // For simplicity, we'll just let the next effect handle grid generation if position exists.
          return { ...prev, currentPosition: newPos };
        }
        
        let newPath = prev.path;
        if (prev.isRunning) {
          newPath = [...prev.path, newPos];
        }

        return {
          ...prev,
          currentPosition: newPos,
          path: newPath
        };
      });
    };

    const error = (err: GeolocationPositionError) => {
      console.warn("GPS Error", err);
      // Fallback
      setGameState(prev => {
        if (!prev.currentPosition) return { ...prev, currentPosition: MOCK_START_LOCATION };
        return prev;
      });
    };

    watchId.current = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    });

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  // Initialize Grid when position is found first time
  useEffect(() => {
    if (gameState.currentPosition && gameState.cells.size === 0) {
      loadSurroundingCells(gameState.currentPosition);
    }
  }, [gameState.currentPosition, gameState.cells.size, loadSurroundingCells]);


  // --- Game Loop (Logic for capturing) ---
  useEffect(() => {
    if (!gameState.isRunning || !gameState.currentPosition) return;

    const { q, r } = pointToHex(gameState.currentPosition, HEX_SIZE_DEGREES);
    const cellId = getCellId(q, r);

    setGameState(prev => {
      const newCells = new Map<string, HexCell>(prev.cells);
      let cell = newCells.get(cellId);
      let message = prev.lastMessage;
      let justCaptured = false;

      // Create cell if it doesn't exist (dynamic expansion)
      if (!cell) {
        cell = createHexCell(q, r, CellStatus.NEUTRAL);
      }

      // Capture Logic
      if (cell.status !== CellStatus.OWNED) {
        // If stealing from rival
        if (cell.status === CellStatus.RIVAL) {
          message = `Territory seized from ${cell.ownerId || 'Unknown'}!`;
          // Trigger AI flavor text occasionally
          if (Math.random() > 0.7) {
             generateDefenseAlert(cell.ownerId || 'Enemy').then(msg => {
                setGameState(s => ({ ...s, lastMessage: msg }));
             });
          }
        } else {
          // Neutral capture
          justCaptured = true;
        }

        cell = {
          ...cell,
          status: CellStatus.OWNED,
          ownerId: PLAYER_ID,
          lastVisited: Date.now(),
          visitCount: (cell.visitCount || 0) + 1
        };
        newCells.set(cellId, cell);
        justCaptured = true;
      }

      if (!justCaptured) return prev; // No change

      // Recalculate Stats
      let ownedCount = 0;
      newCells.forEach(c => {
        if (c.status === CellStatus.OWNED) ownedCount++;
      });
      
      // Approx area: 1 hex ~ 0.015 km2 (very rough for this scale/lat)
      const newArea = ownedCount * 0.015; 

      return {
        ...prev,
        cells: newCells,
        lastMessage: message,
        stats: {
          ...prev.stats,
          totalHexes: ownedCount,
          areaCapturedKm2: newArea,
          // Rank will be updated by separate effect
        }
      };
    });
  }, [gameState.currentPosition, gameState.isRunning]);

  // Sync Leaderboard and Rank when area changes
  useEffect(() => {
    setLeaderboard(prevLb => {
      const myEntry = prevLb.find(l => l.id === PLAYER_ID);
      const currentArea = gameState.stats.areaCapturedKm2;

      if (myEntry && Math.abs(myEntry.area - currentArea) < 0.001) {
        return prevLb;
      }

      const newLb = prevLb.map(entry => 
        entry.id === PLAYER_ID ? { ...entry, area: currentArea } : entry
      ).sort((a, b) => b.area - a.area);
      
      return newLb;
    });
  }, [gameState.stats.areaCapturedKm2]);

  // Update Rank in stats based on Leaderboard
  useEffect(() => {
    const myRank = leaderboard.findIndex(l => l.id === PLAYER_ID) + 1;
    if (myRank !== gameState.stats.rank) {
      setGameState(prev => ({
        ...prev,
        stats: { ...prev.stats, rank: myRank }
      }));
    }
  }, [leaderboard, gameState.stats.rank]);

  // --- Handlers ---

  const handleToggleRun = async () => {
    if (gameState.isRunning) {
      // STOP RUNNING
      const enemies = ['ShadowRunner', 'UrbanFox']; // Mock
      const debrief = await generateDebrief(gameState.stats, gameState.stats.totalHexes, enemies);
      
      setGameState(prev => ({
        ...prev,
        isRunning: false,
        showSummary: true,
        lastMessage: debrief
      }));
    } else {
      // START RUNNING
      const brief = await generateMissionBrief("Sector 7");
      setGameState(prev => ({
        ...prev,
        isRunning: true,
        path: [], // Reset path for new run
        lastMessage: brief,
        showSummary: false
      }));
    }
  };

  const handleCloseSummary = () => {
    setGameState(prev => ({ ...prev, showSummary: false }));
  };

  // Safe loading state
  if (!gameState.currentPosition) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center animate-pulse">
          <h1 className="text-3xl font-bold mb-4 brand-font">HEX<span className="text-blue-500">TERRA</span></h1>
          <p>Acquiring Satellite Link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <GameMap 
        center={gameState.currentPosition} 
        userLocation={gameState.currentPosition}
        cells={Array.from(gameState.cells.values())}
        currentPath={gameState.path}
      />
      
      <Dashboard 
        isRunning={gameState.isRunning}
        onToggleRun={handleToggleRun}
        stats={gameState.stats}
        leaderboard={leaderboard}
        lastMessage={gameState.lastMessage}
        showSummary={gameState.showSummary}
        onCloseSummary={handleCloseSummary}
      />
    </div>
  );
};

export default App;