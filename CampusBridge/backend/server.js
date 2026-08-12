const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const setupSocket = require('./socket/socketHandler');

// Load env
require('dotenv').config();

// Connect DB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200
});
app.use('/api/', limiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/mentoring', require('./routes/mentoringRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/interview-experiences', require('./routes/interviewExperienceRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/career', require('./routes/careerRoutes'));

// Socket.io
setupSocket(io);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CampusBridge server running on port ${PORT}`));
