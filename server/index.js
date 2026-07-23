import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routers/auth.js';
import catalogRouter from './routers/catalog.js';
import reservationsRouter from './routers/reservations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register routers
app.use('/api/auth', authRouter);
app.use('/api/catalog', catalogRouter);
app.use('/api/reservations', reservationsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

