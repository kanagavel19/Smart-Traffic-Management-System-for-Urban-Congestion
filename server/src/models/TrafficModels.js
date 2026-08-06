import mongoose from 'mongoose';

// Intersection Schema
const intersectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  congestionIndex: { type: Number, default: 0 }, // 0 to 100
  status: { type: String, enum: ['Clear', 'Moderate', 'Heavy', 'Emergency'], default: 'Clear' },
  lanes: [{
    direction: { type: String, required: true }, // e.g. Northbound, Southbound
    capacity: { type: Number, default: 100 },
    currentVehicleCount: { type: Number, default: 0 },
    averageSpeed: { type: Number, default: 60 }, // in km/h
  }],
  lastUpdated: { type: Date, default: Date.now }
});

// Traffic Signal Schema
const trafficSignalSchema = new mongoose.Schema({
  intersectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intersection', required: true },
  intersectionName: { type: String, required: true },
  mode: { type: String, enum: ['Fixed', 'Adaptive', 'Emergency', 'Manual'], default: 'Adaptive' },
  currentDirection: { type: String, default: 'Northbound' },
  greenDuration: { type: Number, default: 30 }, // In seconds
  yellowDuration: { type: Number, default: 5 },  // In seconds
  redDuration: { type: Number, default: 35 },     // In seconds
  timeRemaining: { type: Number, default: 30 },   // Dynamic countdown
  phases: [{
    direction: { type: String, required: true },
    state: { type: String, enum: ['Red', 'Yellow', 'Green'], default: 'Red' },
    density: { type: Number, default: 0 } // Calculate based on camera / sensors
  }],
  lastCycleAdjusted: { type: Date, default: Date.now }
});

// CCTV Camera Schema
const cameraSchema = new mongoose.Schema({
  intersectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intersection' },
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  imageUrl: { type: String, default: '/cctv-placeholder.jpg' },
  status: { type: String, enum: ['Online', 'Offline', 'Maintenance'], default: 'Online' },
  liveMetrics: {
    car: { type: Number, default: 0 },
    bus: { type: Number, default: 0 },
    truck: { type: Number, default: 0 },
    motorcycle: { type: Number, default: 0 },
    bicycle: { type: Number, default: 0 },
    rickshaw: { type: Number, default: 0 },
    pedestrian: { type: Number, default: 0 },
    emergency: { type: Number, default: 0 }
  },
  averageSpeed: { type: Number, default: 50 },
  densityScore: { type: Number, default: 10 },
  violations: {
    overspeeding: { type: Number, default: 0 },
    redLight: { type: Number, default: 0 },
    noHelmet: { type: Number, default: 0 },
    wrongWay: { type: Number, default: 0 }
  }
});

// Incident Schema
const incidentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Accident', 'Stalled Vehicle', 'Road Obstruction', 'Overspeeding', 'Red-Light Violation', 'Wrongway Driving', 'Construction'], required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Assigned', 'Resolved'], default: 'Active' },
  reportedBy: { type: String, default: 'AI Camera Sensor' },
  assignedOfficer: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

// Emergency Vehicle Schema
const emergencyVehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true },
  type: { type: String, enum: ['Ambulance', 'Fire Truck', 'Police'], required: true },
  status: { type: String, enum: ['Idle', 'En Route', 'Arrived'], default: 'Idle' },
  currentLat: { type: Number, required: true },
  currentLng: { type: Number, required: true },
  destLat: { type: Number, required: true },
  destLng: { type: Number, required: true },
  routePoints: [[Number]], // Array of [lat, lng]
  speed: { type: Number, default: 0 },
  activeGreenCorridor: { type: Boolean, default: false },
  priorityIntersectionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Intersection' }],
  createdAt: { type: Date, default: Date.now }
});

// Citizen Complaint Schema
const complaintSchema = new mongoose.Schema({
  citizenName: { type: String, required: true },
  citizenEmail: { type: String, required: true },
  type: { type: String, enum: ['Traffic Jam', 'Road Damage', 'Flooding', 'Broken Signal', 'Illegal Parking', 'Hazardous Condition'], required: true },
  description: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Investigating', 'In Progress', 'Resolved'], default: 'Pending' },
  officerNotes: { type: String, default: '' },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

// Weather Schema
const weatherSchema = new mongoose.Schema({
  temperature: { type: Number, default: 25 },
  condition: { type: String, default: 'Clear' }, // e.g. Sunny, Rain, Heavy Rain, Fog, Storm
  humidity: { type: Number, default: 60 },
  visibility: { type: Number, default: 10 }, // in km
  windSpeed: { type: Number, default: 5 }, // in km/h
  rainfall: { type: Number, default: 0 }, // in mm
  congestionMultiplier: { type: Number, default: 1.0 }, // weather impact factor
  timestamp: { type: Date, default: Date.now }
});

// Analytics History Log Custom Schema
const analyticsLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  averageSpeed: { type: Number, default: 45 },
  congestionIndex: { type: Number, default: 25 },
  activeIncidentCount: { type: Number, default: 0 },
  signalEfficiency: { type: Number, default: 85 }, // percentages
  vehicleDistribution: {
    car: { type: Number, default: 0 },
    bus: { type: Number, default: 0 },
    truck: { type: Number, default: 0 },
    motorcycle: { type: Number, default: 0 },
    rickshaw: { type: Number, default: 0 },
    bicycle: { type: Number, default: 0 }
  },
  resolvedComplaints: { type: Number, default: 0 }
});

export const Intersection = mongoose.model('Intersection', intersectionSchema);
export const TrafficSignal = mongoose.model('TrafficSignal', trafficSignalSchema);
export const Camera = mongoose.model('Camera', cameraSchema);
export const Incident = mongoose.model('Incident', incidentSchema);
export const EmergencyVehicle = mongoose.model('EmergencyVehicle', emergencyVehicleSchema);
export const Complaint = mongoose.model('Complaint', complaintSchema);
export const WeatherData = mongoose.model('WeatherData', weatherSchema);
export const AnalyticsLog = mongoose.model('AnalyticsLog', analyticsLogSchema);
