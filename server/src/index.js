import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });


console.log("PORT     :", process.env.PORT);
console.log("MONGO    :", process.env.MONGODB_URI ? "✅ loaded" : "❌ MISSING");
console.log("JWT      :", process.env.ACCESS_TOKEN_SECRET ? "✅ loaded" : "❌ MISSING");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Opinion Platform API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});