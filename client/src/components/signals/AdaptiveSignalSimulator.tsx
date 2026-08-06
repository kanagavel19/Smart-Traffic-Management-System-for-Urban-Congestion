import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { GlassCard } from '../common/GlassCard';
import { Sliders, ShieldAlert, Zap, AlertCircle, RefreshCw } from 'lucide-react';

export const AdaptiveSignalSimulator: React.FC = () => {
  const { signals, overrideSignal } = useTrafficData();
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);

  const getLightClass = (lightState: 'Red' | 'Yellow' | 'Green', targetState: 'Red' | 'Yellow' | 'Green') => {
    if (lightState !== targetState) return 'bg-slate-900 opacity-20';
    if (targetState === 'Red') return 'bg-rose-500 shadow-[0_0_12px_#EF4444]';
    if (targetState === 'Yellow') return 'bg-amber-500 shadow-[0_0_12px_#F59E0B]';
    return 'bg-emerald-500 shadow-[0_0_12px_#10B981]';
  };

  const handleModeOverride = (id: string, mode: 'Fixed' | 'Adaptive' | 'Manual' | 'Emergency', direction?: string) => {
    overrideSignal(id, mode, direction);
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">AI Adaptive Traffic Control</h2>
        <p className="text-xs text-slate-500 mt-1">Automatic real-time green phase optimizations based on lane density sensor aggregates.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Signal Status grid */}
        <div className="xl:col-span-2 space-y-4">
          {signals.map(sig => {
            const activePhase = sig.phases.find(p => p.direction === sig.currentDirection);
            
            return (
              <GlassCard 
                key={sig._id}
                className={`border-l-4 cursor-pointer transition-all ${
                  selectedSignalId === sig._id ? 'border-l-blue-500 bg-slate-900/60' : 
                  sig.mode === 'Emergency' ? 'border-l-rose-500 bg-rose-500/5' : 'border-l-emerald-500'
                }`}
                onClick={() => setSelectedSignalId(sig._id)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white leading-tight">{sig.intersectionName}</h3>
                    <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-semibold">
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-slate-400">
                        Mode: <b className="text-emerald-400 font-bold">{sig.mode}</b>
                      </span>
                      <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-900 text-slate-400">
                        Green Duration: <b className="text-blue-400 font-bold">{sig.greenDuration}s</b>
                      </span>
                    </div>
                  </div>

                  {/* Visual Signal Lights */}
                  <div className="flex items-center space-x-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 shrink-0">
                    <div className="text-center shrink-0 pr-3 border-r border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active Phase</span>
                      <span className="text-xs font-black text-slate-200 mt-1 block truncate max-w-[100px]">{sig.currentDirection}</span>
                    </div>
                    
                    <div className="w-8 h-20 bg-slate-900 border border-slate-800 rounded-full flex flex-col items-center justify-between py-2 shrink-0">
                      <div className={`w-4.5 h-4.5 rounded-full transition-all duration-300 ${getLightClass(activePhase?.state || 'Red', 'Red')}`} />
                      <div className={`w-4.5 h-4.5 rounded-full transition-all duration-300 ${getLightClass(activePhase?.state || 'Red', 'Yellow')}`} />
                      <div className={`w-4.5 h-4.5 rounded-full transition-all duration-300 ${getLightClass(activePhase?.state || 'Red', 'Green')}`} />
                    </div>

                    <div className="text-center shrink-0 pl-1.5 min-w-[32px]">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Timer</span>
                      <span className="text-xl font-black text-white mt-1 block animate-pulse">{sig.timeRemaining}s</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Right Officer override drawer console */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Sliders className="h-4.5 w-4.5 mr-2 text-blue-400" />
              Manual Override Console
            </h3>
            
            {selectedSignalId ? (() => {
              const selectedSig = signals.find(s => s._id === selectedSignalId);
              if (!selectedSig) return null;
              return (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                    <span className="text-[9px] text-slate-500 font-bold block uppercase">Selected Hub</span>
                    <span className="text-xs font-bold text-white">{selectedSig.intersectionName}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Timing Mode overrides</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleModeOverride(selectedSig._id, 'Adaptive')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                          selectedSig.mode === 'Adaptive' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <Zap className="h-3.5 w-3.5 mr-1" />
                        AI Adaptive
                      </button>
                      <button
                        onClick={() => handleModeOverride(selectedSig._id, 'Fixed')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                          selectedSig.mode === 'Fixed' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                          : 'bg-slate-950 text-slate-400 border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Fixed Cycle
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase font-sans">Force Green phase direction</span>
                    <p className="text-[9px] text-slate-500">Choosing a direction immediately triggers pedestrian caution alerts and holds cross corridors to solid RED.</p>
                    
                    <div className="space-y-1.5">
                      {selectedSig.phases.map(ph => (
                        <button
                          key={ph.direction}
                          onClick={() => handleModeOverride(selectedSig._id, 'Manual', ph.direction)}
                          className={`w-full py-2.5 px-3 bg-slate-950 text-left border rounded-lg text-xs font-black transition-all hover:bg-slate-900 cursor-pointer flex items-center justify-between ${
                            selectedSig.currentDirection === ph.direction 
                            ? 'border-indigo-500 text-indigo-400' 
                            : 'border-slate-900 text-slate-400'
                          }`}
                        >
                          <span>{ph.direction}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            ph.state === 'Green' ? 'bg-emerald-500/10 text-emerald-400' :
                            ph.state === 'Yellow' ? 'bg-amber-500/50 text-slate-950' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {ph.state}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedSig.mode === 'Emergency' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold rounded-lg flex items-start">
                      <ShieldAlert className="h-4.5 w-4.5 mr-2 shrink-0" />
                      <div>
                        <span>Emergency lock overrides active. Green corridor corridor locked. Manual inputs restricted.</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })() : (
              <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center">
                <AlertCircle className="h-8 w-8 mb-2 text-slate-600" />
                <span>Select an active intersection signal from the progress grid to override phase timings.</span>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
