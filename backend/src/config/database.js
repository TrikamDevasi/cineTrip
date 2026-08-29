const mongoose = require('mongoose');
const dns = require('dns');

// Fallback to public DNS if local ISP DNS fails SRV lookup
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
