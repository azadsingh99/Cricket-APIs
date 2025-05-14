const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./src/config/db');
const routes = require('./src/routes');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for score card images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes without versioning
app.use('/api', routes);

// Health check route for the base path
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Cricket API is running'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database and create tables if they don't exist
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 