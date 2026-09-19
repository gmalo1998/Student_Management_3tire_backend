require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');

const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');

const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

const app = express();

// ========================================
// MIDDLEWARE
// ========================================

app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management API is running',
  });
});

// ========================================
// ROUTES
// ========================================

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);

// ========================================
// ERROR HANDLING
// ========================================

app.use(notFound);
app.use(errorHandler);

// ========================================
// SERVER
// ========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Wait for MongoDB Atlas connection
    await connectDB();

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error(
      'Server startup failed:',
      error.message
    );

    process.exit(1);
  }
};

startServer();