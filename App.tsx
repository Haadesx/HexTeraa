
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameMap from './components/GameMap';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { TutorialManager } from './components/TutorialManager';
import { LatLng, HexCell, GameState, CellStatus, LeaderboardEntry, GameMode, UserProfile } from './types';
import { pointToHex, createHexCell, getCellId } from './utils/hexGrid';
import { HEX_SIZE_DEGREES, MOCK_START_LOCATION, PLAYER_ID, RIVAL_NAMES, SIMULATION_RADIUS, SIMULATION_SPEED } from './constants';
import { generateMissionBrief, generateDebrief, generateDefenseAlert } from './services/geminiService';

const App: React.FC = () => {
  // --- State ---
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const [gameState, setGameState] = useState<GameState>({
    mode: 'GPS',
    isRunning: false,
    currentPosition: null,
    path: [],
    cells: new Map(),
    stats: {
      areaCapturedKm2: 0,
      totalHexes: 0,
      rank: 42,
      weeklyChange: 0,
    },
    lastMessage: null,
    showSummary: false
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { id: 'r1', name: 'ShadowRunner', area: 12.5, isRival: true },
    { id: 'r2', name: 'UrbanFox', area: 8.2, isRival: true },
    { id: PLAYER_ID, name: 'Player', area: 0, isRival: false },
    { id: 'r3', name: 'VelocityX', area: 5.1, isRival: true },
  ]);

  // Refs
  const watchId = useRef<number | null>(null);
  const simulationFrame = useRef<number | null>(null);
  const simAngle = useRef<number>(0);

  // --- Initialization ---
  const loadSurroundingCells = useCallback((center: LatLng) => {
    setGameState(prev => {
      const newCells = new Map<string, HexCell>(prev.cells);
      const { q, r } = pointToHex(center, HEX_SIZE_DEGREES);
      
      const radius = 6;
      for (let dq = -radius; dq <= radius; dq++) {
        for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
          const cellQ = q + dq;
          const cellR = r + dr;
          const id = getCellId(cellQ, cellR);
          
          if (!newCells.has(id)) {
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

  // --- Login Handler ---
  const handleLogin = (name: string, mode: GameMode) => {
    setUserProfile({ name, isNewPlayer: true });
    
    // Update Leaderboard with name
    setLeaderboard(prev => prev.map(entry => 
      entry.id === PLAYER_ID ? { ...entry, name: name } : entry
    ));

    // Initialize State based on mode
    const startPos = MOCK_START_LOCATION;
    setGameState(prev => ({
      ...prev,
      mode,
      currentPosition: startPos,
      isRunning: mode === 'SIMULATION', // Auto-start sim
      lastMessage: mode === 'SIMULATION' ? "Training Protocol Initiated." : "System Online."
    }));
    
    loadSurroundingCells(startPos);

    if (mode === 'GPS') {
       startGPS();
    }
  };

  // --- GPS Logic ---
  const startGPS = () => {
    if (!navigator.geolocation) {
       console.warn("GPS not supported");
       return;
    }
    
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        handlePositionUpdate(newPos);
      },
      (err) => console.warn("GPS Error", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  // --- Simulation Logic ---
  useEffect(() => {
    if (gameState.mode !== 'SIMULATION' || !gameState.isRunning) {
       if (simulationFrame.current) cancelAnimationFrame(simulationFrame.current);
       return;
    }

    const animate = () => {
      simAngle.current += 0.02; // Speed of rotation
      const center = MOCK_START_LOCATION;
      
      // Calculate new position in a circle
      const newLat = center.lat + Math.sin(simAngle.current) * 0.002;
      const newLng = center.lng + Math.cos(simAngle.current) * 0.0025;
      
      handlePositionUpdate({ lat: newLat, lng: newLng });
      
      simulationFrame.current = requestAnimationFrame(animate);
    };

    simulationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (simulationFrame.current) cancelAnimationFrame(simulationFrame.current);
    };
  }, [gameState.mode, gameState.isRunning]);

  // --- Core Position Handler ---
  const handlePositionUpdate = (newPos: LatLng) => {
    setGameState(prev => {
      const isFirstFix = !prev.currentPosition;
      
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

  // --- Territory Capture Logic ---
  useEffect(() => {
    if (!gameState.isRunning || !gameState.currentPosition) return;

    const { q, r } = pointToHex(gameState.currentPosition, HEX_SIZE_DEGREES);
    const cellId = getCellId(q, r);

    setGameState(prev => {
      const newCells = new Map(prev.cells);
      let cell = newCells.get(cellId);
      let message = prev.lastMessage;
      let justCaptured = false;
      let stats = { ...prev.stats };

      if (!cell) {
        cell = createHexCell(q, r, CellStatus.NEUTRAL);
      }

      if (cell.status !== CellStatus.OWNED) {
        if (cell.status === CellStatus.RIVAL) {
          message = `Zone seized from ${cell.ownerId}!`;
        }
        
        // Tutorial Progression
        if (prev.mode === 'SIMULATION' && tutorialStep === 0) setTutorialStep(1);
        if (prev.mode === 'SIMULATION' && stats.totalHexes > 3 && tutorialStep === 1) setTutorialStep(2);
        if (prev.mode === 'SIMULATION' && stats.totalHexes > 8 && tutorialStep === 2) setTutorialStep(3);

        cell = { ...cell, status: CellStatus.OWNED, ownerId: PLAYER_ID };
        newCells.set(cellId, cell);
        justCaptured = true;
      }

      if (!justCaptured && prev.currentPosition === gameState.currentPosition) return prev;

      if (justCaptured) {
        let ownedCount = 0;
        newCells.forEach(c => { if (c.status === CellStatus.OWNED) ownedCount++; });
        stats.totalHexes = ownedCount;
        stats.areaCapturedKm2 = ownedCount * 0.015;
      }

      return { ...prev, cells: newCells, lastMessage: message, stats };
    });
  }, [gameState.currentPosition, gameState.isRunning, tutorialStep]);

  // --- Leaderboard Sync ---
  useEffect(() => {
    setLeaderboard(prevLb => {
      const currentArea = gameState.stats.areaCapturedKm2;
      const newLb = prevLb.map(entry => 
        entry.id === PLAYER_ID ? { ...entry, area: currentArea } : entry
      ).sort((a, b) => b.area - a.area);
      return newLb;
    });
    
    const rank = leaderboard.findIndex(l => l.id === PLAYER_ID) + 1;
    if (rank !== gameState.stats.rank) {
      setGameState(s => ({ ...s, stats: { ...s.stats, rank } }));
    }
  }, [gameState.stats.areaCapturedKm2]);

  // --- Handlers ---
  const handleToggleRun = async () => {
    if (gameState.isRunning) {
      // Stop
      const enemies = ['ShadowRunner']; 
      const debrief = await generateDebrief(gameState.stats, gameState.stats.totalHexes, enemies);
      setGameState(prev => ({ ...prev, isRunning: false, showSummary: true, lastMessage: debrief }));
    } else {
      // Start
      const brief = await generateMissionBrief(userProfile?.name || "Runner");
      setGameState(prev => ({ ...prev, isRunning: true, path: [], lastMessage: brief, showSummary: false }));
      
      // If sim mode, reset sim
      if (gameState.mode === 'SIMULATION') {
        simAngle.current = 0;
        setTutorialStep(0);
      }
    }
  };

  // --- Render ---
  if (!userProfile) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (!gameState.currentPosition) {
     // Fallback loader if mock location hasn't set yet
     return <div className="bg-slate-900 h-screen w-screen" />;
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
        gameMode={gameState.mode}
        onToggleRun={handleToggleRun}
        stats={gameState.stats}
        leaderboard={leaderboard}
        lastMessage={gameState.lastMessage}
        showSummary={gameState.showSummary}
        onCloseSummary={() => setGameState(s => ({...s, showSummary: false}))}
        username={userProfile.name}
      />

      {gameState.mode === 'SIMULATION' && gameState.isRunning && (
        <TutorialManager 
          step={tutorialStep} 
          onExit={() => {
             setGameState(prev => ({ ...prev, isRunning: false }));
             // Optionally switch to GPS mode here or just stop
          }} 
        />
      )}
    </div>
  );
};

export default App;
