export interface Lane {
  direction: string;
  capacity: number;
  currentVehicleCount: number;
  averageSpeed: number;
}

export interface Intersection {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  congestionIndex: number;
  status: 'Clear' | 'Moderate' | 'Heavy' | 'Emergency';
  lanes: Lane[];
  lastUpdated?: string;
}

export interface SignalPhase {
  direction: string;
  state: 'Red' | 'Yellow' | 'Green';
  density: number;
}

export interface TrafficSignal {
  _id: string;
  intersectionId: string;
  intersectionName: string;
  mode: 'Fixed' | 'Adaptive' | 'Emergency' | 'Manual';
  currentDirection: string;
  greenDuration: number;
  yellowDuration: number;
  redDuration: number;
  timeRemaining: number;
  phases: SignalPhase[];
  lastCycleAdjusted?: string;
}

export interface LiveMetrics {
  car: number;
  bus: number;
  truck: number;
  motorcycle: number;
  bicycle: number;
  rickshaw: number;
  pedestrian: number;
  emergency: number;
}

export interface Camera {
  _id: string;
  intersectionId?: string;
  name: string;
  lat: number;
  lng: number;
  status: 'Online' | 'Offline' | 'Maintenance';
  imageUrl: string;
  liveMetrics: LiveMetrics;
  averageSpeed: number;
  densityScore: number;
  violations: {
    overspeeding: number;
    redLight: number;
    noHelmet: number;
    wrongWay: number;
  };
}

export interface Incident {
  _id: string;
  title: string;
  type: 'Accident' | 'Stalled Vehicle' | 'Road Obstruction' | 'Overspeeding' | 'Red-Light Violation' | 'Wrongway Driving' | 'Construction';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  lat: number;
  lng: number;
  description: string;
  status: 'Active' | 'Assigned' | 'Resolved';
  reportedBy: string;
  assignedOfficer?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface EmergencyVehicle {
  _id: string;
  vehicleNumber: string;
  type: 'Ambulance' | 'Fire Truck' | 'Police';
  status: 'Idle' | 'En Route' | 'Arrived';
  currentLat: number;
  currentLng: number;
  destLat: number;
  destLng: number;
  routePoints: [number, number][];
  speed: number;
  activeGreenCorridor: boolean;
  priorityIntersectionIds: string[];
  createdAt: string;
}

export interface Complaint {
  _id: string;
  citizenName: string;
  citizenEmail: string;
  type: 'Traffic Jam' | 'Road Damage' | 'Flooding' | 'Broken Signal' | 'Illegal Parking' | 'Hazardous Condition';
  description: string;
  lat: number;
  lng: number;
  address?: string;
  imageUrl?: string;
  status: 'Pending' | 'Investigating' | 'In Progress' | 'Resolved';
  officerNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  visibility: number;
  windSpeed: number;
  rainfall: number;
  congestionMultiplier: number;
  timestamp: string;
}

export interface SimulatorLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Traffic Officer' | 'Citizen';
  badgeNumber?: string;
}
