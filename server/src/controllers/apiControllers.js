import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { 
  Intersection, 
  TrafficSignal, 
  Camera, 
  Incident, 
  EmergencyVehicle, 
  Complaint, 
  WeatherData, 
  AnalyticsLog 
} from '../models/TrafficModels.js';
import { liveState } from '../utils/aiSimulator.js';

// JWT helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, role: user.role, name: user.name, email: user.email }, 
    process.env.JWT_SECRET || 'fallback_secret_key_123456', 
    { expiresIn: '7d' }
  );
};

// ----------------------------------------------------
// 1. AUTH CONTROLLER
// ----------------------------------------------------
export const authController = {
  register: async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      const newUser = new User({ name, email, password, role: role || 'Citizen' });
      await newUser.save();
      
      const token = generateToken(newUser);
      res.status(201).json({
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    } catch (err) {
      // In-Memory fallback registration
      const mockId = Math.random().toString(36).substr(2, 9);
      const mockUser = { id: mockId, name, email, role: role || 'Citizen', password: await bcrypt.hash(password || '123', 10) };
      liveState.logs.push({ id: Math.random().toString(36), timestamp: new Date(), message: `New Citizen User registration in-memory: ${name}`, type: 'info' });
      
      const token = generateToken(mockUser);
      res.status(201).json({
        token,
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email, role: mockUser.role }
      });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      // Try MongoDB
      const user = await User.findOne({ email });
      if (user && (await user.comparePassword(password))) {
        const token = generateToken(user);
        return res.json({
          token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
      }
    } catch (e) {
      // failover to memory matching
    }
    
    // In-memory Fallback checks for seedling config
    if (email === 'admin@traffic.gov' && (password === 'adminpassword' || password === 'admin123')) {
      const mock = { id: '60c72b2f9b1d8b2bad0000a1', name: 'Chief Admin', email, role: 'Administrator' };
      return res.json({ token: generateToken(mock), user: mock });
    }
    if (email === 'officer@traffic.gov' && (password === 'officerpassword' || password === 'officer123')) {
      const mock = { id: '60c72b2f9b1d8b2bad0000a2', name: 'Officer John Smith', email, role: 'Traffic Officer' };
      return res.json({ token: generateToken(mock), user: mock });
    }
    if (email === 'citizen@traffic.gov' && (password === 'citizenpassword' || password === 'citizen123')) {
      const mock = { id: '60c72b2f9b1d8b2bad0000a3', name: 'Citizen Jane Doe', email, role: 'Citizen' };
      return res.json({ token: generateToken(mock), user: mock });
    }

    return res.status(401).json({ message: 'Invalid credentials. Use admin@traffic.gov(password: adminpassword) for demo.' });
  },

  getProfile: async (req, res) => {
    res.json({ user: req.user });
  }
};

// ----------------------------------------------------
// 2. TRAFFIC CONTROLLER
// ----------------------------------------------------
export const trafficController = {
  getIntersections: async (req, res) => {
    try {
      const list = await Intersection.find({});
      if (list.length > 0) return res.json(list);
    } catch (e) {}
    res.json(liveState.intersections);
  },

  getSignals: async (req, res) => {
    try {
      const list = await TrafficSignal.find({});
      if (list.length > 0) return res.json(list);
    } catch (e) {}
    res.json(liveState.signals);
  },

  updateSignalMode: async (req, res) => {
    const { id } = req.params;
    const { mode, currentDirection } = req.body;
    try {
      const sig = await TrafficSignal.findById(id);
      if (sig) {
        sig.mode = mode;
        if (currentDirection) sig.currentDirection = currentDirection;
        sig.lastCycleAdjusted = new Date();
        await sig.save();
      }
    } catch (e) {}

    // Fallback sync in liveState
    const cachedSig = liveState.signals.find(s => s._id.toString() === id.toString());
    if (cachedSig) {
      cachedSig.mode = mode;
      if (currentDirection) cachedSig.currentDirection = currentDirection;
      cachedSig.lastCycleAdjusted = new Date();
    }
    res.json({ message: 'Signal mode override approved successfully.' });
  },

  getCameras: async (req, res) => {
    try {
      const list = await Camera.find({});
      if (list.length > 0) return res.json(list);
    } catch (e) {}
    res.json(liveState.cameras);
  },

  getIncidents: async (req, res) => {
    try {
      const list = await Incident.find({}).sort({ createdAt: -1 });
      if (list.length > 0) return res.json(list);
    } catch (e) {}
    res.json(liveState.incidents);
  },

  reportIncident: async (req, res) => {
    const { title, type, severity, lat, lng, description } = req.body;
    const newInc = {
      _id: Math.random().toString(36).substr(2, 9),
      title,
      type,
      severity: severity || 'Medium',
      lat: Number(lat),
      lng: Number(lng),
      description: description || '',
      status: 'Active',
      reportedBy: req.user ? req.user.name : 'AI Sensor System',
      createdAt: new Date()
    };
    
    try {
      const dbInc = new Incident(newInc);
      await dbInc.save();
    } catch (e) {}

    liveState.incidents.unshift(newInc);
    liveState.logs.unshift({ id: Math.random().toString(36), timestamp: new Date(), message: `New incident reported: ${title} (${type})`, type: 'warning' });
    res.status(201).json(newInc);
  },

  resolveIncident: async (req, res) => {
    const { id } = req.params;
    try {
      const dbInc = await Incident.findById(id);
      if (dbInc) {
        dbInc.status = 'Resolved';
        dbInc.resolvedAt = new Date();
        await dbInc.save();
      }
    } catch (e) {}

    const ind = liveState.incidents.find(i => i._id.toString() === id.toString());
    if (ind) {
      ind.status = 'Resolved';
      ind.resolvedAt = new Date();
      liveState.logs.unshift({ id: Math.random().toString(36), timestamp: new Date(), message: `Incident resolved: ${ind.title}`, type: 'success' });
    }
    res.json({ message: 'Incident resolved.' });
  }
};

// ----------------------------------------------------
// 3. COMPLAINT CONTROLLER
// ----------------------------------------------------
export const complaintController = {
  createComplaint: async (req, res) => {
    const { type, description, lat, lng, address } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newComp = {
      _id: Math.random().toString(36).substr(2, 9),
      citizenName: req.user ? req.user.name : 'Citizen User',
      citizenEmail: req.user ? req.user.email : 'citizen@traffic.gov',
      type,
      description,
      lat: Number(lat),
      lng: Number(lng),
      address: address || '',
      imageUrl,
      status: 'Pending',
      createdAt: new Date()
    };

    try {
      const dbComp = new Complaint(newComp);
      await dbComp.save();
    } catch (e) {}

    liveState.complaints.unshift(newComp);
    liveState.logs.unshift({ id: Math.random().toString(36), timestamp: new Date(), message: `Citizen Complaint submitted: ${type}`, type: 'info' });
    res.status(201).json(newComp);
  },

  getComplaints: async (req, res) => {
    try {
      const list = await Complaint.find({}).sort({ createdAt: -1 });
      if (list.length > 0) return res.json(list);
    } catch (e) {}
    res.json(liveState.complaints);
  },

  updateComplaintStatus: async (req, res) => {
    const { id } = req.params;
    const { status, officerNotes } = req.body;
    try {
      const comp = await Complaint.findById(id);
      if (comp) {
        comp.status = status;
        if (officerNotes) comp.officerNotes = officerNotes;
        if (status === 'Resolved') comp.resolvedAt = new Date();
        await comp.save();
      }
    } catch (e) {}

    const cachedComp = liveState.complaints.find(c => c._id.toString() === id.toString());
    if (cachedComp) {
      cachedComp.status = status;
      if (officerNotes) cachedComp.officerNotes = officerNotes;
      if (status === 'Resolved') cachedComp.resolvedAt = new Date();
      
      liveState.logs.unshift({ id: Math.random().toString(36), timestamp: new Date(), message: `Complaint status updated to ${status} by admin`, type: 'info' });
    }
    res.json({ message: 'Complaint state updated successfully.' });
  }
};

// ----------------------------------------------------
// 4. EMERGENCY CONTROLLER
// ----------------------------------------------------
export const emergencyController = {
  getEmergencies: async (req, res) => {
    try {
      const list = await EmergencyVehicle.find({});
      if (list.length > 0) return res.json(list);
    } catch (e) {}
    res.json(liveState.emergencies);
  },

  dispatchVehicle: async (req, res) => {
    const { vehicleNumber, type, startLat, startLng, destLat, destLng, corridorLocked } = req.body;
    
    // Quick path coordinate calculation for NYC demo grid
    const routePoints = [
      [Number(startLat), Number(startLng)],
      [(Number(startLat) + Number(destLat)) / 2, (Number(startLng) + Number(destLng)) / 2],
      [Number(destLat), Number(destLng)]
    ];
    
    // Gather related intersections to lock Green
    const priorityIntersectionIds = liveState.intersections.slice(0, 3).map(i => i._id.toString());

    const newEv = {
      _id: Math.random().toString(36).substr(2, 9),
      vehicleNumber,
      type,
      status: 'En Route',
      currentLat: Number(startLat),
      currentLng: Number(startLng),
      destLat: Number(destLat),
      destLng: Number(destLng),
      routePoints,
      speed: 60,
      activeGreenCorridor: corridorLocked || true,
      priorityIntersectionIds,
      createdAt: new Date()
    };

    try {
      const dbEv = new EmergencyVehicle(newEv);
      await dbEv.save();
    } catch (e) {}

    liveState.emergencies.push(newEv);
    liveState.logs.unshift({ 
      id: Math.random().toString(36), 
      timestamp: new Date(), 
      message: `ALERT: Emergency dispatch active for ${type} ${vehicleNumber}. Corridor signals greenlocked.`, 
      type: 'warning' 
    });
    res.status(201).json(newEv);
  }
};

// ----------------------------------------------------
// 5. WEATHER & ANALYTICS
// ----------------------------------------------------
export const getWeatherData = async (req, res) => {
  res.json(liveState.weather);
};

export const updateWeatherData = async (req, res) => {
  const { temperature, condition, humidity, windSpeed, warningLevel } = req.body;
  
  let congestionMultiplier = 1.0;
  if (condition === 'Heavy Rain') congestionMultiplier = 1.35;
  if (condition === 'Fog') congestionMultiplier = 1.5;
  if (condition === 'Storm') congestionMultiplier = 1.6;

  liveState.weather = {
    temperature: Number(temperature),
    condition,
    humidity: Number(humidity),
    visibility: condition === 'Fog' ? 1.5 : 10,
    windSpeed: Number(windSpeed),
    rainfall: condition === 'Heavy Rain' ? 12 : 0,
    congestionMultiplier,
    timestamp: new Date()
  };

  liveState.logs.unshift({ 
    id: Math.random().toString(36), 
    timestamp: new Date(), 
    message: `Weather Alert: Conditions updated to ${condition}. Speed advisory multiplier: ${congestionMultiplier}x.`, 
    type: 'info' 
  });
  
  res.json(liveState.weather);
};

export const getAnalytics = async (req, res) => {
  const stats = {
    dailyCongestionIndex: liveState.intersections.reduce((acc, curr) => acc + curr.congestionIndex, 0) / liveState.intersections.length,
    activeIncidents: liveState.incidents.filter(i => i.status === 'Active').length,
    totalVehiclesDetected: liveState.cameras.reduce((acc, curr) => 
      acc + Object.values(curr.liveMetrics).reduce((x, y) => x + y, 0), 0
    ),
    weatherFactor: liveState.weather.congestionMultiplier,
    historicalTrends: liveState.analytics,
    intersectionVolHist: liveState.intersections.map(int => ({
      name: int.name.split(' (')[0],
      totalVolume: int.lanes.reduce((acc, l) => acc + l.currentVehicleCount, 0),
      congestionIndex: int.congestionIndex
    }))
  };
  res.json(stats);
};
