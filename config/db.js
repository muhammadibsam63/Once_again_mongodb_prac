
import dns from 'node:dns';
import mongoose from 'mongoose';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI is missing from the .env file');
    }

    console.log('⏳ Connecting to MongoDB Atlas...');

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    return mongoose.connection;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error(`❌ MongoDB error: ${error.message}`);
});

export default connectDB;
