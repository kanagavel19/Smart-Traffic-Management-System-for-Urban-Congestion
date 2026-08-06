import React, { useState } from 'react';
import { useTrafficData } from '../../context/TrafficDataContext';
import { GlassCard } from '../common/GlassCard';
import { AlertTriangle, Send, Zap, Plus } from 'lucide-react';

export const GreenCorridorPlanner: React.FC = () => {
  const { emergencies, dispatchEmergency, intersections } = useTrafficData();
  const [vehicleNo, setVehicleNo] = useState('AMB-911');
  const [type, setType] = useState<'Ambulance' | 'Fire Truck' | 'Police'>('Ambulance');
  const [startPoint, setStartPoint] = useState('40.7580, -73.9780'); // Midtown North
  const [endPoint, setEndPoint] = useState('40.7441, -73.9961'); // Chelsea
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeEmergencies = emergencies.filter(e => e.status === 'En Route');

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const [startLat, startLng] = startPoint.split(',').map(s => Number(s.trim()));
      const [destLat, destLng] = endPoint.split(',').map(s => Number(s.trim()));
      
      await dispatchEmergency({
        vehicleNumber: vehicleNo,
        type,
        startLat,
        startLng,
        destLat,
        destLng,
        corridorLocked: true
      });
      
      setVehicleNo('AMB-' + Math.floor(Math.random() * 900 + 100));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Emergency Green Corridors</h2>
        <p className="text-xs text-slate-500 mt-1">First responder priority routing. Prevents signal delays in emergency dispatch zones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Dispatch form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassCard>
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Plus className="mr-2 h-4 w-4 text-emerald-400" />
              Dispatch Priority Unit
            </h3>
            
            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vehicle ID / Call Sign</label>
                <input 
                  type="text" 
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="e.g. AMB-911"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unit Type</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="Ambulance">Ambulance Emergency</option>
                  <option value="Fire Truck">Fire Engine Emergency</option>
                  <option value="Police">Police Escort Priority</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Coordinates (Lat, Lng)</label>
                <input 
                  type="text" 
                  value={startPoint}
                  onChange={e => setStartPoint(e.target.value)}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="Lat, Lng"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setStartPoint('40.7580, -73.9780')} 
                  className="text-[9px] text-slate-400 hover:text-white mt-1 cursor-pointer"
                >
                  Quick Insert: Midtown Station
                </button>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Coordinates (Lat, Lng)</label>
                <input 
                  type="text" 
                  value={endPoint}
                  onChange={e => setEndPoint(e.target.value)}
                  className="w-full mt-1.5 p-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-blue-500" 
                  placeholder="Lat, Lng"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setEndPoint('40.7441, -73.9961')} 
                  className="text-[9px] text-slate-400 hover:text-white mt-1 cursor-pointer"
                >
                  Quick Insert: Chelsea Accident Scene
                </button>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] rounded-lg">
                <span>Green corridor lock locks upcoming signals along shortest path to solid GREEN.</span>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700/50 text-slate-950 font-bold rounded-lg text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <Send className="mr-1.5 h-3.5 w-3.5" />
                {isSubmitting ? 'Acquiring Locks...' : 'Authorize Dispatch Corridor'}
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Right Active Emergency list */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="h-full flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center">
              <Zap className="mr-2 h-4 w-4 text-rose-500 animate-pulse" />
              Active Dispatch Corridor Locks
            </h3>
            
            {activeEmergencies.length > 0 ? (
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {activeEmergencies.map(emp => (
                  <div key={emp._id} className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{emp.vehicleNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 text-red-500">
                          {emp.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">
                        Corridor Active GreenLock
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Telemetry Speed</span>
                        <span className="text-white font-bold">{emp.speed} km/h</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Intersection Status</span>
                        <span className="text-emerald-400 font-bold">Priority Locks Engaged (3)</span>
                      </div>
                    </div>

                    {/* Simple visual path pipeline */}
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">Pass Nodes Route</span>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 overflow-x-auto whitespace-nowrap py-1">
                        <span>Start</span>
                        <span>→</span>
                        {intersections.slice(0, 3).map((int) => (
                          <React.Fragment key={int._id}>
                            <span className="bg-slate-900 py-0.5 px-2 rounded border border-slate-800 font-bold text-[10px] text-white">
                              {int.name.split(' (')[0]}
                            </span>
                            <span>→</span>
                          </React.Fragment>
                        ))}
                        <span>Destination</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500 text-xs">
                <AlertTriangle className="h-8 w-8 mb-2 text-slate-600" />
                <span>No active emergency dispatch lanes are currently locked.</span>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
