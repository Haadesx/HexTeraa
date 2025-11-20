
import React, { useState } from 'react';
import { Play, Pause, Trophy, Activity, Hexagon, X, Layers, Shield } from 'lucide-react';
import { PlayerStats, LeaderboardEntry, GameMode } from '../types';

interface DashboardProps {
  isRunning: boolean;
  gameMode: GameMode;
  onToggleRun: () => void;
  stats: PlayerStats;
  leaderboard: LeaderboardEntry[];
  lastMessage: string | null;
  showSummary: boolean;
  onCloseSummary: () => void;
  username: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isRunning,
  gameMode,
  onToggleRun,
  stats,
  leaderboard,
  lastMessage,
  showSummary,
  onCloseSummary,
  username
}) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // --- Summary Modal ---
  if (showSummary) {
    return (
      <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/95 p-6 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold brand-font text-white uppercase tracking-wider">
              Debrief
            </h2>
            <div className="p-2 bg-emerald-500/20 rounded-full">
              <Hexagon className="text-emerald-500" size={32} />
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Total Area Controlled</p>
              <div className="flex items-baseline gap-2">
                 <p className="text-4xl font-bold text-white">{stats.areaCapturedKm2.toFixed(3)}</p>
                 <span className="text-sm font-medium text-slate-500">km²</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Cells Seized</p>
                <p className="text-2xl font-bold text-emerald-400">+{stats.totalHexes}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700">
                <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">Global Rank</p>
                <p className="text-2xl font-bold text-yellow-400">#{stats.rank}</p>
              </div>
            </div>

            {lastMessage && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-200 italic">"{lastMessage}"</p>
              </div>
            )}
          </div>

          <button
            onClick={onCloseSummary}
            className="w-full py-4 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-xl transition-all uppercase tracking-wider shadow-lg"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-[1000] flex flex-col justify-between">
        {/* --- HUD Top --- */}
        <div className="pointer-events-auto p-4 pt-6 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent">
          <div className="flex justify-between items-start">
            {/* Player Identity */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <h1 className="text-lg font-bold brand-font text-white tracking-wide">
                  {username} <span className="text-slate-500 text-xs font-sans ml-2">OP-ID: 8821</span>
                </h1>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white leading-none">{stats.areaCapturedKm2.toFixed(3)}</span>
                <span className="text-xs text-slate-400 font-medium">KM²</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLeaderboard(true)}
                className="p-3 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl text-yellow-400 shadow-lg hover:bg-slate-700 transition-colors"
              >
                <Trophy size={20} />
              </button>
            </div>
          </div>

          {/* AI Message Toast */}
          {lastMessage && isRunning && !showSummary && (
            <div className="mt-4 animate-in fade-in slide-in-from-top duration-500">
               <div className="inline-flex items-center gap-3 bg-slate-800/90 border border-blue-500/30 rounded-full pr-6 pl-2 py-2 shadow-xl backdrop-blur-md">
                  <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                     <Activity size={16} className="text-blue-400" />
                  </div>
                  <p className="text-xs font-medium text-blue-100">{lastMessage}</p>
               </div>
            </div>
          )}
        </div>

        {/* --- HUD Bottom --- */}
        <div className="pointer-events-auto p-6 pb-10 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
          <div className="flex items-end justify-between gap-4">
             {/* Map Controls (Mock) */}
             <div className="flex flex-col gap-3 mb-2">
                <button className="p-3 bg-slate-800/90 rounded-full text-slate-400 hover:text-white transition-colors shadow-lg">
                  <Layers size={20} />
                </button>
                <button className="p-3 bg-slate-800/90 rounded-full text-slate-400 hover:text-white transition-colors shadow-lg">
                  <Shield size={20} />
                </button>
             </div>

             {/* Main Action Button */}
             <div className="absolute left-1/2 -translate-x-1/2 bottom-8">
               <button 
                 onClick={onToggleRun}
                 className={`
                   group relative flex items-center justify-center w-24 h-24 rounded-3xl
                   transition-all duration-300 shadow-2xl
                   ${isRunning 
                     ? 'bg-slate-800 border-2 border-red-500/50 text-red-500' 
                     : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'}
                 `}
               >
                 {isRunning ? (
                   <div className="flex flex-col items-center">
                     <Pause size={32} className="fill-current mb-1" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Stop</span>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center">
                     <Play size={32} className="fill-current ml-1 mb-1" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Start</span>
                   </div>
                 )}
                 
                 {/* Animation Ping */}
                 {isRunning && (
                    <span className="absolute inset-0 rounded-3xl border-2 border-red-500 opacity-0 group-hover:opacity-100 animate-ping" />
                 )}
               </button>
             </div>

             {/* Stats Pill */}
             <div className="bg-slate-800/90 backdrop-blur rounded-2xl p-3 border border-slate-700 shadow-lg mb-2">
                <div className="flex items-center gap-2">
                  <Hexagon size={14} className="text-emerald-500" />
                  <span className="text-xs font-bold text-white">{stats.totalHexes}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Cells</span>
                </div>
             </div>
          </div>
          
          <p className="text-center text-slate-500 text-[10px] mt-6 font-mono uppercase tracking-[0.2em] opacity-60">
            {gameMode === 'SIMULATION' ? "/// TRAINING SIMULATION ACTIVE ///" : "/// SATELLITE LINK ESTABLISHED ///"}
          </p>
        </div>
      </div>

      {/* --- Leaderboard Modal --- */}
      {showLeaderboard && (
        <div className="absolute inset-0 z-[2500] bg-slate-900/95 backdrop-blur-md p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white brand-font uppercase">Global Rankings</h2>
            <button 
              onClick={() => setShowLeaderboard(false)}
              className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3">
             {leaderboard.map((entry, idx) => (
               <div 
                  key={entry.id}
                  className={`flex items-center justify-between p-4 rounded-xl border ${entry.id === 'player' || entry.name === username ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-800 border-slate-700'}`}
               >
                  <div className="flex items-center gap-4">
                    <span className={`text-lg font-bold w-6 ${idx < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                      #{idx + 1}
                    </span>
                    <div>
                      <p className={`font-bold ${entry.isRival ? 'text-red-400' : 'text-white'}`}>
                        {entry.name}
                      </p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">
                        {entry.isRival ? 'Hostile Faction' : 'Ally'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-white font-mono font-bold">{entry.area.toFixed(2)}</p>
                     <p className="text-[10px] text-slate-500">KM²</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}
    </>
  );
};
