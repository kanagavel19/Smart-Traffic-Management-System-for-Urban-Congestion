import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  authController, 
  trafficController, 
  complaintController, 
  emergencyController, 
  getWeatherData, 
  updateWeatherData, 
  getAnalytics 
} from '../controllers/apiControllers.js';
import { protect, authorize } from '../middleware/auth.js';

// Setup file upload configurations
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit
});

const router = express.Router();

// ----------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/profile', protect, authController.getProfile);

// ----------------------------------------------------
// SMART TRAFFIC ENDPOINTS
// ----------------------------------------------------
router.get('/traffic/intersections', trafficController.getIntersections);
router.get('/traffic/signals', trafficController.getSignals);
router.patch('/traffic/signals/:id', protect, authorize('Administrator', 'Traffic Officer'), trafficController.updateSignalMode);
router.get('/traffic/cameras', trafficController.getCameras);

// incidents
router.get('/traffic/incidents', trafficController.getIncidents);
router.post('/traffic/incidents', protect, authorize('Administrator', 'Traffic Officer'), trafficController.reportIncident);
router.patch('/traffic/incidents/:id/resolve', protect, authorize('Administrator', 'Traffic Officer'), trafficController.resolveIncident);

// ----------------------------------------------------
// CITIZEN COMPLAINT PORTAL ENDPOINTS
// ----------------------------------------------------
// Everyone of type Citizen / Officer can submit complaints.
// Protect ensures user token is correct. If fallback mode matches or token verified, proceed.
router.post('/complaints', upload.single('image'), complaintController.createComplaint);
router.get('/complaints', complaintController.getComplaints);
router.patch('/complaints/:id/status', protect, authorize('Administrator', 'Traffic Officer'), complaintController.updateComplaintStatus);

// ----------------------------------------------------
// EMERGENCY GREEN CORRIDORS
// ----------------------------------------------------
router.get('/emergencies', emergencyController.getEmergencies);
router.post('/emergencies/dispatch', protect, authorize('Administrator', 'Traffic Officer'), emergencyController.dispatchVehicle);

// ----------------------------------------------------
// WEATHER SIGNAL INTELLIGENCE
// ----------------------------------------------------
router.get('/weather', getWeatherData);
router.post('/weather', protect, authorize('Administrator', 'Traffic Officer'), updateWeatherData);

// ----------------------------------------------------
// ANALYTICS & REPORTS
// ----------------------------------------------------
router.get('/analytics', getAnalytics);

export default router;
