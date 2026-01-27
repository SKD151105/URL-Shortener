import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const { MONGODB_URI } = process.env;

const connectDB = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        await mongoose.connect(MONGODB_URI);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('Error connecting to MongoDB', { error: error.message });
        process.exit(1);
    }
};

export default connectDB;