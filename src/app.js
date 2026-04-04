import express from 'express';
import dotenv from 'dotenv';

import { rateLimiter } from './middleware/rateLimit.js';
import { initDb } from './db.js';

import userRoutes from './routes/users.js';
import recordRoutes from './routes/records.js';
import dashboardRoutes from './routes/dashboard.js';

import { requireActive } from './middleware/access.js';
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// GLOBAL MIDDLEWARE

// Parse JSON request body
app.use(express.json());

// Rate limiting
app.use(rateLimiter);

// START SERVER

(async () => {
  try {
    // Initialize database BEFORE using routes
    await initDb({ test: false });
    console.log('Database initialized');

    // ROUTES

    // Public routes (NO authentication required)
    app.use('/api/users', userRoutes); // includes /login

    // Apply authentication middleware AFTER public routes
    app.use(authenticateToken);

    // Ensure user is active
    app.use(requireActive);

    // Protected routes
    app.use('/api/records', recordRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    // Root route
    app.get('/', (req, res) => {
      res.send('Finance Backend API is running');
    });

    // ERROR HANDLER
    app.use(errorHandler);

    // START LISTEN
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsInVzZXJuYW1lIjoiZ3Vsc2hhbiIsInJvbGUiOiJhZG1pbiIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTc3NTEyODI3MSwiZXhwIjoxNzc1MTM1NDcxfQ.wl_Qe16ZGrgDkkD3IIKlA3FSe9zdSs2PhQKo9kVy1aI