import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

import connectDB from './config/db.js';
import apiRoutes from './routes/apiRoutes.js';
import { startTrafficSimulation } from './utils/aiSimulator.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Init environment variables
dotenv.config();

// Ensure uploads folder exists
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir);
}

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io Server Setup
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev simplicity
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
  }
});

// Middleware Stack
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading uploaded image assets in browser
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.resolve('./uploads')));

// Root status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'online',
    systemTime: new Date(),
    service: 'Smart Traffic Management Server',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rate limiting and API Routing
app.use('/api', apiLimiter, apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start AI Smart Traffic Simulation
const simulationIntervalId = startTrafficSimulation(io);

// Socket connection listener
io.on('connection', (socket) => {
  console.log(`Socket Client Connected: ${socket.id}`);
  
  // Send immediate capture of current simulated state upon connection
  socket.emit('initialState', {
    status: 'connected',
    message: 'Welcome to Smart City Traffic Engine Stream'
  });

  socket.on('disconnect', () => {
    console.log(`Socket Client Disconnected: ${socket.id}`);
  });
});

// Server Listening Config
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  Traffic Management System Server online on port ${PORT}`);
  console.log(`  Local status check: http://localhost:${PORT}/status`);
  console.log(`===================================================`);
});

// Handle server termination clean shutdown
process.on('SIGTERM', () => {
  clearInterval(simulationIntervalId);
  server.close(() => {
    console.log('Server terminated. Cleaned up simulated loops.');
    process.exit(0);
  });
});
