import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTrafficData } from '../../context/TrafficDataContext';
import { useAuth } from '../../context/AuthContext';
import { GlassCard } from '../common/GlassCard';
import { Eye, Navigation, Layers } from 'lucide-react';
import { Camera } from '../../types';

// Setup Leaflet DivIcon Creators for custom HTML rendering
const createSignalIcon = (color: 'Green' | 'Yellow' | 'Red') => {
  const colorMap = {
    Green: '#10B981',
    Yellow: '#F59E0B',
    Red: '#EF4444'
  };
  const activeColor = colorMap[color] || '#3b82f6';
  
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border border-white/20" style="background: rgba(15,23,42,0.85); box-shadow: 0 0 10px ${activeColor};">
             <div class="w-4 h-4 rounded-full" style="background: ${activeColor};"></div>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createCameraIcon = (status: string) => {
  const color = status === 'Online' ? '#3b82f6' : status === 'Offline' ? '#64748b' : '#f59e0b';
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-lg border border-white/10" style="background: ${color}; color: #fff;">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createIncidentIcon = (severity: string) => {
  const color = severity === 'Critical' ? '#EF4444' : severity === 'High' ? '#F97316' : '#F59E0B';
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-7 h-7 rounded-full border border-slate-900 border-2" style="background: ${color}; color: #fff; animation: pulse 1.5s infinite;">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createEmergencyIcon = (_type: string) => {
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 bg-rose-600 text-white animate-pulse" style="box-shadow: 0 0 15px #EF4444;">
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createComplaintIcon = (status: string) => {
  const color = status === 'Resolved' ? '#10B981' : '#a855f7';
  return L.divIcon({
    html: `<div class="flex items-center justify-center w-6 h-6 rounded-full border border-white/10" style="background: ${color}; color: #fff;">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
           </div>`,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Helper: Center Map component
const CenterMap: React.FC<{ coords: [number, number] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords]);
  return null;
};

export const LiveTrafficMap: React.FC = () => {
  const { user } = useAuth();
  const { 
    intersections, 
    signals, 
    cameras, 
    incidents, 
    emergencies, 
    complaints, 
    overrideSignal
  } = useTrafficData();

  // Filters State
  const [layers, setLayers] = useState({
    signals: true,
    cameras: true,
    incidents: true,
    emergencies: true,
    complaints: true
  });

  const [centerCoords, setCenterCoords] = useState<[number, number]>([40.7580, -73.9815]);
  const [activeCamFeed, setActiveCamFeed] = useState<Camera | null>(null);
  
  // Custom Routing State
  const [routingStart, setRoutingStart] = useState<[number, number] | null>(null);
  const [routingEnd, setRoutingEnd] = useState<[number, number] | null>(null);
  const [suggestedRoute, setSuggestedRoute] = useState<[number, number][]>([]);
  const [routingText, setRoutingText] = useState('');

  // Auto-Routing penalty A* optimizer simulator
  const handleRouteCalculation = () => {
    if (!routingStart || !routingEnd) return;
    
    // Check if middle zone (Herald square diagonal) has high congestion (> 60)
    const herald = intersections.find(i => i.name.includes('Herald'));
    const chelsea = intersections.find(i => i.name.includes('Chelsea'));
    
    const highCongestion = (herald && herald.congestionIndex > 65) || (chelsea && chelsea.status === 'Emergency');
    
    if (highCongestion) {
      // Divert route through East side (Grand central -> Upper East -> Chelsea bypass)
      setSuggestedRoute([
        routingStart,
        [40.7620, -73.9723], // Midtown north (clear lane)
        [40.7527, -73.9818], // grand central
        [40.7794, -73.9555], // lexington (clear corridor)
        routingEnd
      ]);
      setRoutingText('Optimal route recalculated. High Congestion avoided on Broadway Corridor (Saved 12 mins).');
    } else {
      // Direct route (Grand central -> Chelsea straight)
      setSuggestedRoute([
        routingStart,
        [40.7489, -73.9881], // herald sq
        routingEnd
      ]);
      setRoutingText('Fastest path detected along Broadway diagonal corridor (Normal traffic flow).');
    }
  };

  const handleQuickLoc = (coords: [number, number]) => {
    setCenterCoords(coords);
  };

  // Define color-coded segments based on traffic speeds
  const getPolylineColor = (congestionVal: number) => {
    if (congestionVal > 80) return '#EF4444'; // Red Heavy
    if (congestionVal > 50) return '#F97316'; // Orange Moderate
    if (congestionVal > 25) return '#F59E0B'; // Yellow Warning
    return '#10B981'; // Green Clear
  };

  return (
    <div className="space-y-6">
      
      {/* Upper Filters bar & Action presets */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Live GIS Traffic Map</h2>
          <p className="text-xs text-slate-500 mt-1">Real-time overlay of city traffic flow grids, emergency paths and AI optical nodes.</p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs font-semibold">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="text-slate-400 font-medium">Layers:</span>
          <label className="flex items-center space-x-1 ml-2 cursor-pointer">
            <input type="checkbox" checked={layers.signals} onChange={(e) => setLayers(l => ({ ...l, signals: e.target.checked }))} className="rounded accent-blue-600" />
            <span>Signals</span>
          </label>
          <label className="flex items-center space-x-1 ml-2 cursor-pointer">
            <input type="checkbox" checked={layers.cameras} onChange={(e) => setLayers(l => ({ ...l, cameras: e.target.checked }))} className="rounded accent-blue-600" />
            <span>CCTV</span>
          </label>
          <label className="flex items-center space-x-1 ml-2 cursor-pointer">
            <input type="checkbox" checked={layers.incidents} onChange={(e) => setLayers(l => ({ ...l, incidents: e.target.checked }))} className="rounded accent-blue-600" />
            <span>Incidents</span>
          </label>
          <label className="flex items-center space-x-1 ml-2 cursor-pointer">
            <input type="checkbox" checked={layers.emergencies} onChange={(e) => setLayers(l => ({ ...l, emergencies: e.target.checked }))} className="rounded accent-blue-600" />
            <span>Emergency</span>
          </label>
          <label className="flex items-center space-x-1 ml-2 cursor-pointer">
            <input type="checkbox" checked={layers.complaints} onChange={(e) => setLayers(l => ({ ...l, complaints: e.target.checked }))} className="rounded accent-blue-600" />
            <span>Complaints</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Interactive Control widget panel */}
        <div className="space-y-6">
          
          {/* Quick Hub Navigation selector */}
          <GlassCard className="bg-slate-900/60">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center">
              <Navigation className="mr-2 h-4.5 w-4.5 text-blue-400" />
              Focus Areas Grid
            </h3>
            <div className="space-y-2">
              {intersections.map(int => (
                <button
                  key={int._id}
                  onClick={() => handleQuickLoc([int.lat, int.lng])}
                  className="w-full text-left text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2.5 rounded-lg flex items-center justify-between text-slate-300 font-medium transition-all"
                >
                  <span className="truncate mr-2">{int.name.split(' (')[0]}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    int.status === 'Clear' ? 'bg-emerald-500/10 text-emerald-400' :
                    int.status === 'Moderate' ? 'bg-amber-500/10 text-amber-400' :
                    int.status === 'Heavy' ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-500 animate-pulse'
                  }`}>
                    Idx: {int.congestionIndex}
                  </span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* AI Optimal Route Finder */}
          <GlassCard className="bg-slate-900/60">
            <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider flex items-center">
              <Navigation className="mr-2 h-4.5 w-4.5 text-emerald-400" />
              Routing Optimizer
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Click below to input start/end nodes. AI will redirect path around high density bottlenecks.</p>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Start Coordinates Pin</span>
                <button 
                  onClick={() => setRoutingStart([40.7580, -73.9780])}
                  className="w-full mt-1 bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-300 text-left font-semibold hover:bg-slate-800/50"
                >
                  {routingStart ? 'Start Point Locked (Midtown)' : 'Set Start Point'}
                </button>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Destination Coordinate</span>
                <button 
                  onClick={() => setRoutingEnd([40.7441, -73.9961])}
                  className="w-full mt-1 bg-slate-950 p-2 rounded border border-slate-800 text-[10px] text-slate-300 text-left font-semibold hover:bg-slate-800/50"
                >
                  {routingEnd ? 'Destination Locked (Chelsea)' : 'Set End Point'}
                </button>
              </div>

              {routingStart && routingEnd && (
                <button
                  onClick={handleRouteCalculation}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-all mt-2 cursor-pointer"
                >
                  Calculate Congestion-Aware Route
                </button>
              )}

              {routingText && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wide rounded-lg">
                  {routingText}
                </div>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Center GIS Maps Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative h-[550px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            
            {/* Live Camera Feed Popup Modal Overlay */}
            {activeCamFeed && (
              <div className="absolute top-4 left-4 z-[1000] w-64 bg-slate-900/90 border border-slate-700/80 rounded-xl p-3.5 backdrop-blur-md shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center">
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    CCTV Feed Focus
                  </span>
                  <button onClick={() => setActiveCamFeed(null)} className="text-slate-400 hover:text-white font-bold text-xs">✕</button>
                </div>
                
                <img src={activeCamFeed.imageUrl} alt="cctv feed" className="h-28 w-full object-cover rounded-lg border border-slate-800" />
                <h4 className="text-xs font-bold text-white leading-tight">{activeCamFeed.name}</h4>
                
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                  <span className="bg-slate-950 p-1.5 rounded border border-slate-800">Cars: <b>{activeCamFeed.liveMetrics.car}</b></span>
                  <span className="bg-slate-950 p-1.5 rounded border border-slate-800">Buses: <b>{activeCamFeed.liveMetrics.bus}</b></span>
                  <span className="bg-slate-950 p-1.5 rounded border border-slate-800">Trucks: <b>{activeCamFeed.liveMetrics.truck}</b></span>
                  <span className="bg-slate-950 p-1.5 rounded border border-slate-800">Speed: <b>{activeCamFeed.averageSpeed} km/h</b></span>
                </div>
              </div>
            )}

            <MapContainer 
              center={centerCoords} 
              zoom={14} 
              style={{ height: '100%', width: '100%', borderRadius: '16px' }}
              zoomControl={true}
            >
              <CenterMap coords={centerCoords} />
              
              {/* Dark Map Tiles Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="dark-map-tiles"
              />

              {/* Road Segments Color Overlay */}
              <Polyline positions={[[40.7527, -73.9818], [40.7489, -73.9881]]} color={getPolylineColor(65)} weight={6} opacity={0.8} />
              <Polyline positions={[[40.7489, -73.9881], [40.7441, -73.9961]]} color={getPolylineColor(92)} weight={6} opacity={0.8} />
              <Polyline positions={[[40.7620, -73.9723], [40.7527, -73.9818]]} color={getPolylineColor(20)} weight={6} opacity={0.8} />
              <Polyline positions={[[40.7527, -73.9818], [40.7794, -73.9555]]} color={getPolylineColor(12)} weight={6} opacity={0.8} />

              {/* Route Suggestion path */}
              {suggestedRoute.length > 0 && (
                <Polyline positions={suggestedRoute} color="#10B981" weight={4} dashArray="8, 8" opacity={0.9} />
              )}

              {/* INTERSECTIONS / SIGNALS LAYER */}
              {layers.signals && signals.map(sig => {
                const corrIntIndex = intersections.find(i => i._id.toString() === sig.intersectionId.toString());
                const coords: [number, number] = corrIntIndex ? [corrIntIndex.lat, corrIntIndex.lng] : [40.7527, -73.9818];
                const activePhaseState = sig.phases.find(p => p.direction === sig.currentDirection)?.state || 'Red';

                return (
                  <Marker 
                    key={sig._id} 
                    position={coords} 
                    icon={createSignalIcon(activePhaseState)}
                  >
                    <Popup>
                      <div className="p-1 max-w-sm space-y-2">
                        <h4 className="text-xs font-bold text-white leading-tight">{sig.intersectionName}</h4>
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Active direction: <b className="text-emerald-400 font-bold">{sig.currentDirection}</b></span>
                          <span>Mode: <b className="text-blue-400 font-bold">{sig.mode}</b></span>
                        </div>
                        
                        <div className="space-y-1 bg-slate-950 p-2 rounded border border-slate-800">
                          {sig.phases.map(p => (
                            <div key={p.direction} className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">{p.direction}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                p.state === 'Green' ? 'bg-emerald-500/10 text-emerald-400' :
                                p.state === 'Yellow' ? 'bg-amber-500/50 text-slate-950' : 'bg-red-500/10 text-red-500'
                              }`}>
                                {p.state}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Officer Actions controls inside popup */}
                        {(user?.role === 'Administrator' || user?.role === 'Traffic Officer') && (
                          <div className="flex space-x-1.5 pt-2">
                            <button
                              onClick={() => overrideSignal(sig._id, 'Adaptive')}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[9px] font-bold cursor-pointer transition-all"
                            >
                              Auto Adaptive
                            </button>
                            <button
                              onClick={() => overrideSignal(sig._id, 'Manual', 'Northbound')}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] font-bold cursor-pointer transition-all"
                            >
                              Force N/S Green
                            </button>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}

              {/* CCTV OPTICAL LAYER */}
              {layers.cameras && cameras.map(cam => (
                <Marker 
                  key={cam._id} 
                  position={[cam.lat, cam.lng]} 
                  icon={createCameraIcon(cam.status)}
                >
                  <Popup>
                    <div className="p-1 space-y-2">
                      <h4 className="text-xs font-bold text-white leading-tight">{cam.name}</h4>
                      <p className="text-[10px] text-slate-400">Status: <b className="text-emerald-400">{cam.status}</b></p>
                      
                      <button
                        onClick={() => setActiveCamFeed(cam)}
                        className="w-full py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded text-[10px] font-bold text-blue-400 flex items-center justify-center cursor-pointer transition-all"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                        View Live CCTV AI feed
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* EMERGENCY VEHICLES LAYER */}
              {layers.emergencies && emergencies.filter(e => e.status === 'En Route').map(emp => (
                <div key={emp._id}>
                  {/* Ambulance Marker */}
                  <Marker 
                    position={[emp.currentLat, emp.currentLng]} 
                    icon={createEmergencyIcon(emp.type)}
                  >
                    <Popup>
                      <div className="p-1 space-y-1.5 text-xs text-slate-300">
                        <h4 className="text-xs font-bold text-white">{emp.type}: {emp.vehicleNumber}</h4>
                        <p>Status: <span className="text-red-400 font-bold">{emp.status}</span></p>
                        <p>Speed: <span className="text-teal-400 font-bold">{emp.speed} km/h</span></p>
                        <p className="text-[10px] text-slate-500">Green corridor lock applied downstream.</p>
                      </div>
                    </Popup>
                  </Marker>
                  {/* Ambulance Path line visualization */}
                  <Polyline positions={emp.routePoints} color="#EF4444" weight={2} dashArray="4, 4" opacity={0.6} />
                </div>
              ))}

              {/* INCIDENTS / ACCIDENTS LAYER */}
              {layers.incidents && incidents.filter(i => i.status === 'Active').map(inc => (
                <Marker 
                  key={inc._id} 
                  position={[inc.lat, inc.lng]} 
                  icon={createIncidentIcon(inc.severity)}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs text-slate-300">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide">{inc.title}</h4>
                      <p>Type: <b>{inc.type}</b></p>
                      <p>Severity: <b>{inc.severity}</b></p>
                      <p className="text-[10px] text-slate-400 mt-1">{inc.description}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* CITIZEN COMPLAINTS LAYER */}
              {layers.complaints && complaints.map(comp => (
                <Marker 
                  key={comp._id} 
                  position={[comp.lat, comp.lng]} 
                  icon={createComplaintIcon(comp.status)}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs text-slate-300">
                      <h4 className="text-xs font-bold text-purple-400">{comp.type}</h4>
                      <p>Status: <b>{comp.status}</b></p>
                      <p className="text-[10px] text-slate-400 italic">"{comp.description}"</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

            </MapContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
