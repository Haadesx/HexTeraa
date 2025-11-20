import React from 'react';
import { Play, Pause, Map as MapIcon, Trophy, Activity, ShieldAlert, Hexagon } from 'lucide-react';
import { PlayerStats, LeaderboardEntry } from '../types';

interface DashboardProps {
  isRunning: boolean;
  onToggleRun: () => void;
  stats: PlayerStats;
  leaderboard: LeaderboardEntry[];
  lastMessage: string | null;
  showSummary: boolean;
  onCloseSummary: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  isRunning,
  onToggleRun,
  stats,
  leaderboard,
  lastMessage,
  showSummary,
  onCloseSummary
}) => {
  // Summary Modal
  if (showSummary) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/95 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold brand-font text-emerald-400 uppercase tracking-wider">
              Mission Debrief
            </h2>
            <Hexagon className="text-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Area Captured</p>
              <p className="text-2xl font-bold text-white">{stats.areaCapturedKm2.toFixed(3)} <span className="text-sm font-normal text-slate-500">km²</span></p>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Cells</p>
                <p className="text-xl font-bold text-emerald-400">+{stats.totalHexes}</p>
              </div>
              <div className="flex-1 bg-slate-900 p-4 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Rank</p>
                <p className="text-xl font-bold text-yellow-400">#{stats.rank}</p>
              </div>
            </div>

            {lastMessage && (
              <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase">AI Commander</span>
                </div>
                <p className="text-sm text-emerald-100 italic">"{lastMessage}"</p>
              </div>
            )}
          </div>

          <button
            onClick={onCloseSummary}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all uppercase tracking-wider shadow-lg shadow-emerald-900/50"
          >
            Return to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-[1000] flex flex-col justify-between">
      {/* Top Bar */}
      <div className="pointer-events-auto p-4 bg-gradient-to-b from-slate-900/90 to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold brand-font text-white drop-shadow-lg">
              HEX<span className="text-blue-500">TERRA</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <div className="px-2 py-0.5 bg-blue-900/50 border border-blue-500/30 rounded text-xs text-blue-200 font-mono">
                 {stats.areaCapturedKm2.toFixed(2)} KM² OWNED
               </div>
            </div>
          </div>
          
          {/* Mini Leaderboard */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg p-3 w-48 shadow-lg">
             <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-1">
                <Trophy size={14} className="text-yellow-500" />
                <span className="text-xs font-bold text-slate-300 uppercase">Local Top 3</span>
             </div>
             <div className="space-y-1">
               {leaderboard.slice(0, 3).map((entry, idx) => (
                 <div key={entry.id} className="flex justify-between text-xs">
                    <span className={`${entry.isRival ? 'text-red-400' : 'text-white'} truncate max-w-[100px]`}>
                      {idx + 1}. {entry.name}
                    </span>
                    <span className="text-slate-400">{entry.area}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* AI Message Feed */}
        {lastMessage && isRunning && (
          <div className="mt-4 animate-in fade-in slide-in-from-top duration-500">
             <div className="inline-block bg-slate-900/90 border-l-4 border-blue-500 rounded-r-lg p-3 max-w-[80%] shadow-lg backdrop-blur-md">
                <p className="text-sm text-blue-100 font-medium">{lastMessage}</p>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="pointer-events-auto p-6 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent pb-10">
        <div className="flex items-center justify-center gap-6">
           {/* Defend Alert (Conditional Mock) */}
           {stats.totalHexes > 5 && Math.random() > 0.8 && (
              <div className="absolute bottom-28 bg-red-500/90 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-bounce shadow-lg shadow-red-900/50">
                <ShieldAlert size={18} />
                <span className="text-sm font-bold uppercase">Zone Under Attack!</span>
              </div>
           )}

           <button 
             onClick={onToggleRun}
             className={`
               group relative flex items-center justify-center w-20 h-20 rounded-full border-4 
               transition-all duration-300 shadow-xl
               ${isRunning 
                 ? 'bg-red-500 border-red-400 hover:bg-red-600 shadow-red-900/40' 
                 : 'bg-blue-600 border-blue-400 hover:bg-blue-500 shadow-blue-900/40'}
             `}
           >
             {isRunning ? (
               <Pause size={32} className="text-white fill-current" />
             ) : (
               <Play size={32} className="text-white fill-current ml-1" />
             )}
             
             {/* Rings animation when running */}
             {isRunning && (
                <span className="absolute w-full h-full rounded-full border-4 border-red-500/30 animate-ping"></span>
             )}
           </button>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-4 font-mono uppercase tracking-widest">
          {isRunning ? "Tracking GPS • Capturing Territory" : "System Standby • Ready to Run"}
        </p>
      </div>
    </div>
  );
};
