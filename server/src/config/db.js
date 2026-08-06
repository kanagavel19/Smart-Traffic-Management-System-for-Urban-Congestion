import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_traffic';
    console.log('Connecting to database...');
    
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s
    });
    
    console.log(`MongoDB Connected successfully to: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`Database connection failed: ${error.message}`);
    console.warn('Backend server running in In-Memory / Simulated mode. Database changes will not persist across restarts, but the API and WebSockets will remain 100% operational.');
  }
};

export default connectDB;
