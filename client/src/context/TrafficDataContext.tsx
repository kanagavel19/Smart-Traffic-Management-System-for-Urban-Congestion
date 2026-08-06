import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Intersection, 
  TrafficSignal, 
  Camera, 
  Incident, 
  EmergencyVehicle, 
  Complaint, 
  WeatherData, 
  SimulatorLog 
} from '../types';
import { trafficAPI, complaintAPI, emergencyAPI, weatherAPI } from '../services/api';

interface TrafficDataContextType {
  intersections: Intersection[];
  signals: TrafficSignal[];
  cameras: Camera[];
  incidents: Incident[];
  emergencies: EmergencyVehicle[];
  complaints: Complaint[];
  weather: WeatherData;
  logs: SimulatorLog[];
  isLiveConnected: boolean;
  refreshData: () => Promise<void>;
  overrideSignal: (id: string, mode: 'Fixed' | 'Adaptive' | 'Manual' | 'Emergency', direction?: string) => Promise<void>;
  resolveIncident: (id: string) => Promise<void>;
  reportIncident: (incident: any) => Promise<void>;
  dispatchEmergency: (data: any) => Promise<void>;
  fileComplaint: (formData: FormData) => Promise<void>;
  updateWeather: (data: any) => Promise<void>;
  updateComplaintStatus: (id: string, status: string, notes: string) => Promise<void>;
}

const TrafficDataContext = createContext<TrafficDataContextType | undefined>(undefined);

// Quick local mocks for fallback mode when dev server is offline
import { 
  seedIntersections, 
  seedSignals, 
  seedCameras, 
  seedIncidents, 
  seedEmergencies, 
  seedComplaints, 
  seedWeatherData, 
} from '../utils/seedData'; 

export const TrafficDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [intersections, setIntersections] = useState<Intersection[]>(seedIntersections as any);
  const [signals, setSignals] = useState<TrafficSignal[]>(seedSignals as any);
  const [cameras, setCameras] = useState<Camera[]>(seedCameras as any);
  const [incidents, setIncidents] = useState<Incident[]>(seedIncidents as any);
  const [emergencies, setEmergencies] = useState<EmergencyVehicle[]>(seedEmergencies as any);
  const [complaints, setComplaints] = useState<Complaint[]>(seedComplaints as any);
  const [weather, setWeather] = useState<WeatherData>({ ...seedWeatherData, timestamp: new Date().toISOString() } as any);
  const [logs, setLogs] = useState<SimulatorLog[]>([]);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // REST refresh query
  const refreshData = async () => {
    try {
      const [intsRes, sigsRes, camsRes, incsRes, emsRes, compsRes, wRes] = await Promise.all([
        trafficAPI.getIntersections(),
        trafficAPI.getSignals(),
        trafficAPI.getCameras(),
        trafficAPI.getIncidents(),
        emergencyAPI.getAll(),
        complaintAPI.getAll(),
        weatherAPI.get()
      ]);

      setIntersections(intsRes.data);
      setSignals(sigsRes.data);
      setCameras(camsRes.data);
      setIncidents(incsRes.data);
      setEmergencies(emsRes.data);
      setComplaints(compsRes.data);
      setWeather(wRes.data);
    } catch (e) {
      // Keep mock seeds unchanged
      console.log('Using local client-side sandbox data.');
    }
  };

  const emergenciesRef = useRef(emergencies);
  const weatherRef = useRef(weather);

  useEffect(() => {
    emergenciesRef.current = emergencies;
  }, [emergencies]);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  // Bind Socket connections & sandbox fallback interval
  useEffect(() => {
    const socketUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://127.0.0.1:5000' : '';
    let socket: Socket | null = null;
    let localSandboxInterval: any = null;

    try {
      socket = io(socketUrl, { timeout: 3000, transports: ['websocket'] });

      socket.on('connect', () => {
        setIsLiveConnected(true);
        console.log('Socket link established with central traffic server.');
      });

      socket.on('trafficData', (data: any) => {
        setIntersections(data.intersections);
        setSignals(data.signals);
        setCameras(data.cameras);
        setIncidents(data.incidents);
        setEmergencies(data.emergencies);
        setComplaints(data.complaints);
        setWeather(data.weather);
        setLogs(data.logs);
      });

      socket.on('disconnect', () => {
        setIsLiveConnected(false);
      });

      socket.on('connect_error', () => {
        setIsLiveConnected(false);
      });

    } catch (err) {
      setIsLiveConnected(false);
    }

    // fallback simulation loop
    localSandboxInterval = setInterval(() => {
      // ONLY simulate on client side if Socket is disconnected
      if (socket && socket.connected) return;

      // 1. Tick signal timers
      setSignals(prev => prev.map(sig => {
        let t = sig.timeRemaining - 1;
        let mode = sig.mode;
        let currentDir = sig.currentDirection;
        let phases = [...sig.phases];

        // Emergency override check
        const hasEmergency = emergenciesRef.current.some(e => 
          e.status === 'En Route' && 
          e.activeGreenCorridor && 
          e.priorityIntersectionIds.includes(sig.intersectionId)
        );

        if (hasEmergency) {
          mode = 'Emergency';
          currentDir = 'Northbound';
          t = Math.max(10, t);
        } else if (mode === 'Emergency') {
          mode = 'Adaptive';
          t = 10;
        }

        if (t <= 0) {
          const names = phases.map(p => p.direction);
          const i = names.indexOf(currentDir);
          currentDir = names[(i + 1) % names.length];
          t = mode === 'Adaptive' ? Math.floor(Math.random() * 25) + 20 : 30;
        }

        phases = phases.map(p => {
          if (p.direction === currentDir) {
            return { ...p, state: t <= 4 ? 'Yellow' : 'Green' };
          }
          return { ...p, state: 'Red' };
        });

        return { ...sig, timeRemaining: t, mode, currentDirection: currentDir, phases };
      }));

      // 2. Drift vehicle speeds
      setIntersections(prev => prev.map(inter => {
        const wtM = weatherRef.current.congestionMultiplier || 1.0;
        const lanes = inter.lanes.map(lane => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const count = Math.max(5, Math.min(lane.capacity, lane.currentVehicleCount + delta));
          const occupancy = count / lane.capacity;
          const speed = Math.max(5, Math.floor(55 * (1 - occupancy * 0.6) / wtM));
          return { ...lane, currentVehicleCount: count, averageSpeed: speed };
        });

        const speedsSum = lanes.reduce((acc, l) => acc + l.averageSpeed, 0);
        const index = Math.max(0, Math.min(100, Math.floor(((60 - (speedsSum / lanes.length)) / 55) * 100)));
        let status: any = 'Clear';
        if (index > 80) status = 'Emergency';
        else if (index > 50) status = 'Heavy';
        else if (index > 25) status = 'Moderate';

        return { ...inter, lanes, congestionIndex: index, status };
      }));

      // 3. Move emergencies
      setEmergencies(prev => prev.map(emp => {
        if (emp.status !== 'En Route') return emp;
        let target = emp.routePoints[emp.routePoints.length - 1];
        
        for (let pt of emp.routePoints) {
          const dist = Math.hypot(pt[0] - emp.currentLat, pt[1] - emp.currentLng);
          if (dist > 0.0006) {
            target = pt;
            break;
          }
        }

        const angle = Math.atan2(target[0] - emp.currentLat, target[1] - emp.currentLng);
        const nextLat = emp.currentLat + Math.sin(angle) * 0.0003;
        const nextLng = emp.currentLng + Math.cos(angle) * 0.0003;
        const dist = Math.hypot(emp.destLat - nextLat, emp.destLng - nextLng);
        
        if (dist < 0.0008) {
          // arrived
          setLogs(l => [{
            id: 'log-' + Date.now(),
            timestamp: new Date().toISOString(),
            message: `Emergency dispatch completed: ${emp.type} ${emp.vehicleNumber} has arrived details.`,
            type: 'success'
          }, ...l]);
          return { ...emp, status: 'Arrived', currentLat: emp.destLat, currentLng: emp.destLng, speed: 0, activeGreenCorridor: false };
        }

        return { ...emp, currentLat: nextLat, currentLng: nextLng, speed: 65 + Math.floor(Math.random() * 10) };
      }));

      // 4. Update cameras
      setCameras(prev => prev.map(cam => {
        const randomViolType = Math.random() < 0.04;
        const viols = { ...cam.violations };
        if (randomViolType) {
          const keys = ['overspeeding', 'redLight', 'noHelmet', 'wrongWay'] as const;
          const key = keys[Math.floor(Math.random() * keys.length)];
          viols[key] += 1;
        }

        return {
          ...cam,
          violations: viols,
          liveMetrics: {
            ...cam.liveMetrics,
            car: Math.max(5, cam.liveMetrics.car + (Math.floor(Math.random() * 5) - 2))
          }
        };
      }));

    }, 2000);

    refreshData();

    return () => {
      if (socket) socket.disconnect();
      clearInterval(localSandboxInterval);
    };
  }, []);

  const overrideSignal = async (id: string, mode: 'Fixed' | 'Adaptive' | 'Manual' | 'Emergency', direction?: string) => {
    try {
      await trafficAPI.updateSignal(id, { mode, currentDirection: direction });
      await refreshData();
    } catch (e) {
      // Local fallback
      setSignals(prev => prev.map(s => {
        if (s._id === id) {
          return { ...s, mode, currentDirection: direction || s.currentDirection };
        }
        return s;
      }));
      setLogs(l => [{
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        message: `Manual Override Applied: Signal direction set to ${direction || 'Default'} at intersection (Mode: ${mode})`,
        type: 'info'
      }, ...l]);
    }
  };

  const resolveIncident = async (id: string) => {
    try {
      await trafficAPI.resolveIncident(id);
      await refreshData();
    } catch (e) {
      // fallback
      setIncidents(prev => prev.map(inc => {
        if (inc._id === id) return { ...inc, status: 'Resolved', resolvedAt: new Date().toISOString() };
        return inc;
      }));
      const found = incidents.find(i => i._id === id);
      if (found) {
        setLogs(l => [{
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          message: `Closed incident: ${found.title}`,
          type: 'success'
        }, ...l]);
      }
    }
  };

  const reportIncident = async (incData: any) => {
    try {
      const res = await trafficAPI.reportIncident(incData);
      setIncidents(prev => [res.data, ...prev]);
    } catch (e) {
      const mockInc: Incident = {
        _id: 'inc-' + Date.now(),
        title: incData.title,
        type: incData.type,
        severity: incData.severity || 'Medium',
        lat: Number(incData.lat),
        lng: Number(incData.lng),
        description: incData.description,
        status: 'Active',
        reportedBy: 'Dashboard Override',
        createdAt: new Date().toISOString()
      };
      setIncidents(prev => [mockInc, ...prev]);
      setLogs(l => [{
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        message: `Incident reported: ${mockInc.title} (${mockInc.severity})`,
        type: 'warning'
      }, ...l]);
    }
  };

  const dispatchEmergency = async (data: any) => {
    try {
      const res = await emergencyAPI.dispatch(data);
      setEmergencies(prev => [...prev, res.data]);
    } catch (e) {
      // Fallback path coords NY Grid
      const routePoints: [number, number][] = [
        [Number(data.startLat), Number(data.startLng)],
        [(Number(data.startLat) + Number(data.destLat)) / 2, (Number(data.startLng) + Number(data.destLng)) / 2],
        [Number(data.destLat), Number(data.destLng)]
      ];
      
      const mockEv: EmergencyVehicle = {
        _id: 'ev-' + Date.now(),
        vehicleNumber: data.vehicleNumber,
        type: data.type,
        status: 'En Route',
        currentLat: Number(data.startLat),
        currentLng: Number(data.startLng),
        destLat: Number(data.destLat),
        destLng: Number(data.destLng),
        routePoints,
        speed: 70,
        activeGreenCorridor: data.corridorLocked !== false,
        priorityIntersectionIds: intersections.slice(0, 3).map(i => i._id),
        createdAt: new Date().toISOString()
      };

      setEmergencies(prev => [...prev, mockEv]);
      setLogs(l => [{
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        message: `ALERT: Dispatching emergency vehicle ${mockEv.vehicleNumber}. Route locked.`,
        type: 'warning'
      }, ...l]);
    }
  };

  const fileComplaint = async (formData: FormData) => {
    try {
      const res = await complaintAPI.create(formData);
      setComplaints(prev => [res.data, ...prev]);
    } catch (e) {
      const mockComp: Complaint = {
        _id: 'comp-' + Date.now(),
        citizenName: 'Citizen reporter',
        citizenEmail: 'citizen@traffic.gov',
        type: formData.get('type') as any,
        description: formData.get('description') as string,
        lat: Number(formData.get('lat') || '40.7527'),
        lng: Number(formData.get('lng') || '-73.9818'),
        address: formData.get('address') as string || 'General metropolitan area',
        imageUrl: '',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      setComplaints(prev => [mockComp, ...prev]);
      setLogs(l => [{
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        message: `Citizen complaint logged: ${mockComp.type}`,
        type: 'info'
      }, ...l]);
    }
  };

  const updateWeather = async (data: any) => {
    try {
      const res = await weatherAPI.update(data);
      setWeather(res.data);
    } catch (e) {
      let mult = 1.0;
      if (data.condition === 'Heavy Rain') mult = 1.35;
      if (data.condition === 'Fog') mult = 1.5;
      if (data.condition === 'Storm') mult = 1.6;

      setWeather({
        temperature: Number(data.temperature),
        condition: data.condition,
        humidity: Number(data.humidity),
        visibility: data.condition === 'Fog' ? 1.5 : 10,
        windSpeed: Number(data.windSpeed),
        rainfall: data.condition === 'Heavy Rain' ? 12 : 0,
        congestionMultiplier: mult,
        timestamp: new Date().toISOString()
      });

      setLogs(l => [{
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        message: `Weather impact updated: ${data.condition}`,
        type: 'info'
      }, ...l]);
    }
  };

  const updateComplaintStatus = async (id: string, status: string, notes: string) => {
    try {
      await complaintAPI.updateStatus(id, { status, officerNotes: notes });
      await refreshData();
    } catch (e) {
      setComplaints(prev => prev.map(c => {
        if (c._id === id) {
          return {
            ...c,
            status: status as any,
            officerNotes: notes,
            resolvedAt: status === 'Resolved' ? new Date().toISOString() : undefined
          };
        }
        return c;
      }));
      setLogs(l => [{
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString(),
        message: `Officer responded: Complaint #${id} updated to ${status}`,
        type: 'info'
      }, ...l]);
    }
  };

  return (
    <TrafficDataContext.Provider value={{
      intersections,
      signals,
      cameras,
      incidents,
      emergencies,
      complaints,
      weather,
      logs,
      isLiveConnected,
      refreshData,
      overrideSignal,
      resolveIncident,
      reportIncident,
      dispatchEmergency,
      fileComplaint,
      updateWeather,
      updateComplaintStatus
    }}>
      {children}
    </TrafficDataContext.Provider>
  );
};

export const useTrafficData = () => {
  const context = useContext(TrafficDataContext);
  if (context === undefined) {
    throw new Error('useTrafficData must be used within a TrafficDataProvider');
  }
  return context;
};
