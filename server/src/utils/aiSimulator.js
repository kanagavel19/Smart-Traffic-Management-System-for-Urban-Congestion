import { 
  seedIntersections, 
  seedSignals, 
  seedCameras, 
  seedIncidents, 
  seedEmergencies, 
  seedComplaints, 
  seedWeatherData,
  seedAnalytics
} from './seedData.js';

// In-Memory state fallback (to support zero-database-config runs out of the box)
export const liveState = {
  intersections: JSON.parse(JSON.stringify(seedIntersections)),
  signals: JSON.parse(JSON.stringify(seedSignals)),
  cameras: JSON.parse(JSON.stringify(seedCameras)),
  incidents: JSON.parse(JSON.stringify(seedIncidents)),
  emergencies: JSON.parse(JSON.stringify(seedEmergencies)),
  complaints: JSON.parse(JSON.stringify(seedComplaints)),
  weather: { ...seedWeatherData },
  analytics: JSON.parse(JSON.stringify(seedAnalytics)),
  logs: []
};

// Log helper
const addLog = (message, type = 'info') => {
  const log = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    message,
    type
  };
  liveState.logs.unshift(log);
  if (liveState.logs.length > 50) liveState.logs.pop();
  return log;
};

// Simulate traffic step
export const runSimulationStep = (io) => {
  try {
    // 1. Tick down traffic signals
    liveState.signals.forEach(signal => {
      signal.timeRemaining -= 1;
      
      // Get associated intersection
      const intersection = liveState.intersections.find(i => i._id.toString() === signal.intersectionId.toString());

      // Emergency Mode Override
      const hasEmergencyPath = liveState.emergencies.some(e => 
        e.status === 'En Route' && 
        e.activeGreenCorridor && 
        e.priorityIntersectionIds.includes(signal.intersectionId.toString())
      );

      if (hasEmergencyPath) {
        if (signal.mode !== 'Emergency') {
          signal.mode = 'Emergency';
          signal.currentDirection = 'Northbound'; // Lane path of emergency vehicles
          signal.greenDuration = 90;
          signal.timeRemaining = 60;
          
          addLog(`Emergency Lock: Signal at ${signal.intersectionName} activated Green Corridor for Ambulance, priority path locked.`, 'warning');
        }
      } else if (signal.mode === 'Emergency') {
        // Clear emergency mode once no en route emergency impacts this intersection
        signal.mode = 'Adaptive';
        signal.timeRemaining = 10;
        addLog(`Emergency Lock Cleared: Signal at ${signal.intersectionName} reverted to Adaptive Control mode.`, 'info');
      }

      // Signal Phase Cycle Transition
      if (signal.timeRemaining <= 0) {
        // Toggle Phase directions
        const directionIndex = signal.phases.findIndex(p => p.direction === signal.currentDirection);
        let nextIndex = (directionIndex + 1) % signal.phases.length;
        
        const nextPhase = signal.phases[nextIndex];
        signal.currentDirection = nextPhase.direction;

        // AI Adaptive Timing Logic: Calculate green window based on density
        if (signal.mode === 'Adaptive') {
          // base = 20s
          // add up to 35s depending on traffic density (0 to 100)
          const density = nextPhase.density || Math.floor(Math.random() * 80) + 10;
          const extraTime = Math.floor((density / 100) * 35);
          signal.greenDuration = 20 + extraTime;
          signal.timeRemaining = signal.greenDuration;
          
          if (extraTime > 20) {
            addLog(`Adaptive Timing: Adjusting Green phase at ${signal.intersectionName} to ${signal.greenDuration}s due to heavy ${signal.currentDirection} lanes.`, 'info');
          }
        } else {
          // Fixed mode
          signal.greenDuration = 30;
          signal.timeRemaining = 30;
        }

        // Update phase states visually
        signal.phases.forEach((p, idx) => {
          if (p.direction === signal.currentDirection) {
            p.state = 'Green';
          } else {
            p.state = 'Red';
          }
        });
      }

      // Sync signal lights values for drawing
      signal.phases.forEach((p) => {
        if (p.direction === signal.currentDirection) {
          if (signal.timeRemaining <= 5 && signal.timeRemaining > 0) {
            p.state = 'Yellow';
          } else {
            p.state = 'Green';
          }
        } else {
          p.state = 'Red';
        }
      });
    });

    // 2. Simulate vehicles and drift congestion
    liveState.intersections.forEach(inter => {
      // Weather impact check
      const wMultiplier = liveState.weather.congestionMultiplier || 1.0;
      
      inter.lanes.forEach(lane => {
        // Random drift in count
        const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
        lane.currentVehicleCount = Math.max(2, Math.min(lane.capacity, lane.currentVehicleCount + change));
        
        // Calculate speed based on density and incidents
        const localIncidents = liveState.incidents.filter(inc => 
          inc.status === 'Active' && 
          Math.abs(inc.lat - inter.lat) < 0.002 && 
          Math.abs(inc.lng - inter.lng) < 0.002
        );

        let speedPenalty = 1.0;
        if (localIncidents.length > 0) {
          const highSeverity = localIncidents.some(i => i.severity === 'Critical' || i.severity === 'High');
          speedPenalty = highSeverity ? 0.15 : 0.45; // Huge speed drop
        }

        const occupancy = lane.currentVehicleCount / lane.capacity;
        let baseSpeed = 50 * (1 - occupancy * 0.7); // speed decreases as occupancy grows
        baseSpeed = baseSpeed * speedPenalty / wMultiplier;
        lane.averageSpeed = Math.max(5, Math.floor(baseSpeed));
      });

      // Recalculate Congestion Index
      const sumSpeeds = inter.lanes.reduce((acc, curr) => acc + curr.averageSpeed, 0);
      const avgSpeed = sumSpeeds / inter.lanes.length;
      
      // Congestion Index: 100 when avgSpeed is 5km/h, 0 when avgSpeed is 60km/h
      const index = Math.max(0, Math.min(100, Math.floor(((60 - avgSpeed) / 55) * 100)));
      inter.congestionIndex = index;
      
      // Update statuses
      if (index < 30) inter.status = 'Clear';
      else if (index < 60) inter.status = 'Moderate';
      else if (index < 85) inter.status = 'Heavy';
      else inter.status = 'Emergency';
    });

    // 3. CCTV Bounding Box details & speed calculations
    liveState.cameras.forEach(cam => {
      const parentInter = liveState.intersections.find(i => i._id.toString() === cam.intersectionId?.toString());
      if (parentInter) {
        // Camera counts correlate to intersection count
        const sumCount = parentInter.lanes.reduce((acc, curr) => acc + curr.currentVehicleCount, 0);
        
        // Re-distribute vehicles across AI tags
        cam.liveMetrics.car = Math.floor(sumCount * 0.6);
        cam.liveMetrics.motorcycle = Math.floor(sumCount * 0.15);
        cam.liveMetrics.bus = Math.floor(sumCount * 0.08);
        cam.liveMetrics.truck = Math.floor(sumCount * 0.07);
        cam.liveMetrics.rickshaw = Math.floor(sumCount * 0.05);
        cam.liveMetrics.bicycle = Math.floor(sumCount * 0.03);
        cam.liveMetrics.pedestrian = Math.floor(Math.random() * 40) + 10;
        
        cam.averageSpeed = Math.floor(parentInter.lanes.reduce((acc, curr) => acc + curr.averageSpeed, 0) / parentInter.lanes.length);
        cam.densityScore = parentInter.congestionIndex;
        
        // Random AI violation detection
        if (Math.random() < 0.05) {
          const violTypes = ['overspeeding', 'redLight', 'noHelmet', 'wrongWay'];
          const picked = violTypes[Math.floor(Math.random() * violTypes.length)];
          cam.violations[picked] += 1;
          
          if (picked === 'overspeeding') {
            addLog(`AI Alert: Camera ${cam.name} detected overspeeding vehicle (estimated speed ${cam.averageSpeed + 25} km/h). Ticket logged.`, 'error');
          } else if (picked === 'redLight') {
            addLog(`AI Alert: Camera ${cam.name} flagged red-light violation at eastern corridor crossline.`, 'error');
          }
        }
      }
    });

    // 4. Move Emergency Vehicles along route
    liveState.emergencies.forEach(emp => {
      if (emp.status === 'En Route') {
        // Drift position towards next route point
        const currentLoc = [emp.currentLat, emp.currentLng];
        // Target: next route point
        // Let's find first point that is far enough
        let targetPoint = emp.routePoints[emp.routePoints.length - 1]; // fallback destination
        
        for (let pt of emp.routePoints) {
          const dist = Math.hypot(pt[0] - emp.currentLat, pt[1] - emp.currentLng);
          if (dist > 0.0005) {
            targetPoint = pt;
            break;
          }
        }

        const angle = Math.atan2(targetPoint[0] - emp.currentLat, targetPoint[1] - emp.currentLng);
        const speedFactor = 0.0003; // speed step
        emp.currentLat += Math.sin(angle) * speedFactor;
        emp.currentLng += Math.cos(angle) * speedFactor;
        emp.speed = 50 + Math.floor(Math.random() * 20);

        // Distance check to ultimate destination
        const destDist = Math.hypot(emp.destLat - emp.currentLat, emp.destLng - emp.currentLng);
        if (destDist < 0.0008) {
          emp.status = 'Arrived';
          emp.speed = 0;
          emp.activeGreenCorridor = false;
          addLog(`Emergency Dispatch Completed: ${emp.type} ${emp.vehicleNumber} successfully arrived at destination. Corridor unlocked.`, 'success');
        }
      }
    });

    // Broadcast through socket.io
    if (io) {
      io.emit('trafficData', {
        intersections: liveState.intersections,
        signals: liveState.signals,
        cameras: liveState.cameras,
        incidents: liveState.incidents,
        emergencies: liveState.emergencies,
        complaints: liveState.complaints,
        weather: liveState.weather,
        logs: liveState.logs
      });
    }
  } catch (err) {
    console.error('Simulator step error:', err);
  }
};

// Start simulation loop
export const startTrafficSimulation = (io) => {
  addLog('Intelligent Traffic Simulation Engine online. AI adaptive signals authorized.', 'success');
  
  // Set interval to step every 2 seconds
  const intervalId = setInterval(() => {
    runSimulationStep(io);
  }, 2000);

  return intervalId;
};
