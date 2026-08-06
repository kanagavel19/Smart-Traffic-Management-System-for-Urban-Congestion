import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { GlassCard } from '../common/GlassCard';
import { Tv, AlertTriangle, Eye } from 'lucide-react';

export const VideoFeedGrid: React.FC = () => {
  const { cameras, reportIncident } = useTrafficData();
  const [selectedCamId, setSelectedCamId] = useState<string | null>(null);
  const [isSimulatingAIViolation, setIsSimulatingAIViolation] = useState(false);

  const selectedCam = cameras.find(c => c._id === selectedCamId);

  // Trigger simulated AI violation report
  const triggerAIViolation = async (type: string) => {
    if (!selectedCam) return;
    setIsSimulatingAIViolation(true);
    
    try {
      const titles = {
        'Accident': 'AI Detected Multi-Vehicle Collision',
        'Stalled Vehicle': 'AI Detected Stopped vehicle on main highway',
        'Construction': 'AI Detected Road obstruction blocking bus lane'
      };

      await reportIncident({
        title: titles[type as keyof typeof titles] || 'AI Flagged Traffic Obstruction',
        type,
        severity: 'Critical',
        lat: selectedCam.lat,
        lng: selectedCam.lng,
        description: 'Automatic optical event created by computer vision analytics engine. Bounding box confirmation locked.'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        setIsSimulatingAIViolation(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">AI CCTV Vision Grid & Violations</h2>
        <p className="text-xs text-slate-500 mt-1">Live optical analysis feeds. Track speed anomalies, road obstructions and traffic safety violations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Video feed lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cameras.map(cam => (
              <GlassCard 
                key={cam._id} 
                className={`p-0 overflow-hidden border cursor-pointer transition-all ${
                  selectedCamId === cam._id ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-800'
                }`}
                onClick={() => setSelectedCamId(cam._id)}
              >
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img src={cam.imageUrl} alt={cam.name} className="h-full w-full object-cover opacity-80" />
                  
                  {/* Bounding box mock layer inside feed card */}
                  {selectedCamId === cam._id && cam.status === 'Online' && (
                    <div className="absolute inset-0 pointer-events-none p-4">
                      {/* Bounding Box 1 */}
                      <div className="absolute top-8 left-16 border border-emerald-500 bg-emerald-500/10 px-1 py-0.5 rounded text-[8px] text-emerald-400 font-bold uppercase tracking-wider">
                        Car ID 198 [Speed: {cam.averageSpeed} km/h]
                      </div>
                      {/* Bounding Box 2 */}
                      <div className="absolute bottom-10 right-10 border border-blue-500 bg-blue-500/10 px-1 py-0.5 rounded text-[8px] text-blue-400 font-bold uppercase tracking-wider">
                        Bus ID 42 [Speed: {Math.max(5, cam.averageSpeed - 12)} km/h]
                      </div>
                    </div>
                  )}

                  {/* Corner status badges */}
                  <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center space-x-1.5 backdrop-blur-sm">
                    <span className={`h-1.5 w-1.5 rounded-full ${cam.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span>{cam.status}</span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-white/5 py-0.5 px-2 rounded text-[10px] font-bold text-slate-300">
                    Density Index: <b>{cam.densityScore}</b>
                  </div>
                </div>

                <div className="p-4 space-y-2 bg-[#101828]">
                  <h3 className="text-xs font-bold text-white truncate">{cam.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Target Speed: <b>{cam.averageSpeed} km/h</b></span>
                    <span className="flex items-center text-blue-400 font-bold">
                      <Eye className="h-3.5 w-3.5 mr-1" /> View analytics
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Right Bounding Box analytical dashboard */}
        <div className="space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Tv className="h-4.5 w-4.5 mr-2 text-blue-400" />
              Vision Analytics Console
            </h3>

            {selectedCam ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-500 font-bold block uppercase font-sans">Active Channel</span>
                  <span className="text-xs font-bold text-white leading-tight">{selectedCam.name}</span>
                </div>

                {selectedCam.status === 'Online' ? (
                  <div className="space-y-4">
                    {/* Bounding box AI vehicle counters */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">AI Bounding Box classification</span>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-medium">
                        <div className="bg-slate-950 p-2 rounded border border-slate-900 space-y-1">
                          <span className="text-slate-500 uppercase block text-[8px] font-bold">Cars</span>
                          <span className="text-white font-bold text-sm">{selectedCam.liveMetrics.car}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-900 space-y-1">
                          <span className="text-slate-500 uppercase block text-[8px] font-bold">Buses / Trucks</span>
                          <span className="text-white font-bold text-sm">{selectedCam.liveMetrics.bus + selectedCam.liveMetrics.truck}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-900 space-y-1">
                          <span className="text-slate-500 uppercase block text-[8px] font-bold">Motorcycles</span>
                          <span className="text-white font-bold text-sm">{selectedCam.liveMetrics.motorcycle}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded border border-slate-900 space-y-1">
                          <span className="text-slate-500 uppercase block text-[8px] font-bold">Pedestrians</span>
                          <span className="text-white font-bold text-sm">{selectedCam.liveMetrics.pedestrian}</span>
                        </div>
                      </div>
                    </div>

                    {/* Violations logs count */}
                    <div className="space-y-2">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Safety violations logs</span>
                      <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                        <span className="flex items-center text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-2 shrink-0 animate-pulse" />Overspeeding: <b className="text-white font-bold ml-1">{selectedCam.violations.overspeeding}</b></span>
                        <span className="flex items-center text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-2 shrink-0 animate-pulse" />Red Lights: <b className="text-white font-bold ml-1">{selectedCam.violations.redLight}</b></span>
                        <span className="flex items-center text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-2 shrink-0 animate-pulse" />No Helmet: <b className="text-white font-bold ml-1">{selectedCam.violations.noHelmet}</b></span>
                        <span className="flex items-center text-slate-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-2 shrink-0 animate-pulse" />Wrong Lane: <b className="text-white font-bold ml-1">{selectedCam.violations.wrongWay}</b></span>
                      </div>
                    </div>

                    {/* Trigger simulated event */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Simulate Optical Event Trigger</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => triggerAIViolation('Accident')}
                          disabled={isSimulatingAIViolation}
                          className="py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded text-[10px] tracking-wide cursor-pointer transition-all uppercase"
                        >
                          Report Crash
                        </button>
                        <button
                          onClick={() => triggerAIViolation('Stalled Vehicle')}
                          disabled={isSimulatingAIViolation}
                          className="py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded text-[10px] tracking-wide cursor-pointer transition-all uppercase"
                        >
                          Report Stall
                        </button>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center">
                    <AlertTriangle className="h-8 w-8 mb-2 text-slate-600" />
                    <span>Camera is currently Offline/Maintenance. Telemetry feeds frozen.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center">
                <Tv className="h-8 w-8 mb-2 text-slate-600" />
                <span>Select a live camera thumbnail from the grid, to view computer vision overlays and classification dashboards.</span>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
