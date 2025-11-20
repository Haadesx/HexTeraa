
import React from 'react';
import { Info, CheckCircle, Navigation } from 'lucide-react';

interface TutorialManagerProps {
  step: number;
  onExit: () => void;
}

export const TutorialManager: React.FC<TutorialManagerProps> = ({ step, onExit }) => {
  const tips = [
    {
      title: "Welcome, Runner",
      text: "This simulation will teach you how to capture territory. Your blue path represents your movement.",
      icon: <Navigation size={24} className="text-blue-400" />
    },
    {
      title: "Hex Capturing",
      text: "As you move into a hexagonal cell, it turns GREEN. This means you now own this territory.",
      icon: <CheckCircle size={24} className="text-emerald-400" />
    },
    {
      title: "Expanding Borders",
      text: "Keep moving to connect cells. The larger your connected area, the higher your rank.",
      icon: <Navigation size={24} className="text-blue-400" />
    },
    {
      title: "Simulation Complete",
      text: "You're ready for the real world. Go outside, start the app, and claim your city!",
      icon: <CheckCircle size={24} className="text-purple-400" />,
      isLast: true
    }
  ];

  const currentTip = tips[Math.min(step, tips.length - 1)];

  return (
    <div className="absolute bottom-32 left-4 right-4 z-[1500] animate-in slide-in-from-bottom duration-500">
      <div className="bg-slate-800/95 backdrop-blur border-l-4 border-blue-500 rounded-r-xl p-5 shadow-2xl max-w-lg mx-auto">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-900 rounded-full border border-slate-700">
            {currentTip.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1 brand-font uppercase">
              {currentTip.title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentTip.text}
            </p>
            
            <div className="mt-4 flex items-center gap-2">
               <div className="flex gap-1">
                 {tips.map((_, idx) => (
                   <div 
                    key={idx} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx <= step ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700'}`}
                   />
                 ))}
               </div>
               <span className="text-xs text-slate-500 ml-auto font-mono">TRAINING MODE</span>
            </div>
          </div>
        </div>
        
        {currentTip.isLast && (
          <button 
            onClick={onExit}
            className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg uppercase tracking-wider transition-colors"
          >
            End Simulation
          </button>
        )}
      </div>
    </div>
  );
};
