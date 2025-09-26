/**
 * OpenTech Real-time Service
 * Handles WebSocket connections, WebRTC signaling, and real-time features
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const client = require('prom-client');

// Import custom modules
const SocketManager = require('./services/SocketManager');
const WebRTCService = require('./services/WebRTCService');
const NotificationService = require('./services/NotificationService');
const CollaborationService = require('./services/CollaborationService');
const PresenceService = require('./services/PresenceService');
const config = require('./config');

class RealTimeServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });
        
        this.redis = new Redis(config.REDIS_URL);
        this.logger = this.createLogger();
        this.metrics = this.setupMetrics();
        
        // Initialize services
        this.socketManager = new SocketManager(this.io, this.redis, this.logger);
        this.webrtcService = new WebRTCService(this.io, this.logger);
        this.notificationService = new NotificationService(this.io, this.redis, this.logger);
        this.collaborationService = new CollaborationService(this.io, this.redis, this.logger);
        this.presenceService = new PresenceService(this.io, this.redis, this.logger);
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }
    
    createLogger() {
        return winston.createLogger({
            level: config.LOG_LEVEL,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
                new winston.transports.File({ filename: 'logs/combined.log' })
            ]
        });
    }
    
    setupMetrics() {
        const register = new client.Registry();
        
        const httpRequestsTotal = new client.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [register]
        });
        
        const socketConnectionsTotal = new client.Gauge({
            name: 'socket_connections_total',
            help: 'Total number of active socket connections',
            registers: [register]
        });
        
        const webrtcConnectionsTotal = new client.Gauge({
            name: 'webrtc_connections_total', 
            help: 'Total number of active WebRTC connections',
            registers: [register]
        });
        
        return {
            register,
            httpRequestsTotal,
            socketConnectionsTotal,
            webrtcConnectionsTotal
        };
    }
    
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors({
            origin: config.ALLOWED_ORIGINS,
            credentials: true
        }));
        this.app.use(compression());
        
        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: 'Too many requests from this IP'
        });
        this.app.use('/api/', limiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Request logging
        this.app.use((req, res, next) => {
            this.logger.info(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
        
        // Metrics middleware
        this.app.use((req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.metrics.httpRequestsTotal
                    .labels(req.method, req.route?.path || req.path, res.statusCode)
                    .inc();
            });
            
            next();
        });
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'realtime-service',
                version: '1.0.0',
                uptime: process.uptime(),
                connections: {
                    socket: this.io.engine.clientsCount,
                    redis: this.redis.status
                }
            });
        });
        
        // Metrics endpoint
        this.app.get('/metrics', async (req, res) => {
            res.set('Content-Type', this.metrics.register.contentType);
            res.end(await this.metrics.register.metrics());
        });
        
        // WebRTC signaling endpoints
        this.app.post('/api/v1/webrtc/create-room', this.authenticateToken, async (req, res) => {
            try {
                const room = await this.webrtcService.createRoom(req.body.roomOptions);
                res.json({ success: true, room });
            } catch (error) {
                this.logger.error('Failed to create WebRTC room:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        this.app.post('/api/v1/webrtc/join-room/:roomId', this.authenticateToken, async (req, res) => {
            try {
                const { roomId } = req.params;
                const { userId } = req.user;
                const result = await this.webrtcService.joinRoom(roomId, userId);
                res.json({ success: true, ...result });
            } catch (error) {
                this.logger.error('Failed to join WebRTC room:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Collaboration endpoints
        this.app.get('/api/v1/collaboration/rooms', this.authenticateToken, async (req, res) => {
            try {
                const rooms = await this.collaborationService.getUserRooms(req.user.userId);
                res.json({ success: true, rooms });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Presence endpoints
        this.app.get('/api/v1/presence/online', async (req, res) => {
            try {
                const onlineUsers = await this.presenceService.getOnlineUsers();
                res.json({ success: true, users: onlineUsers });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
        
        // Notification endpoints
        this.app.post('/api/v1/notifications/send', this.authenticateToken, async (req, res) => {
            try {
                const { targetUserId, type, data } = req.body;
                await this.notificationService.sendNotification(targetUserId, type, data);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }
    
    setupSocketHandlers() {
        // Authentication middleware for sockets
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.query.token;
                
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                
                const decoded = jwt.verify(token, config.JWT_SECRET);
                socket.userId = decoded.userId;
                socket.user = decoded;
                
                this.logger.info('Socket authenticated', {
                    socketId: socket.id,
                    userId: decoded.userId
                });
                
                next();
            } catch (error) {
                this.logger.error('Socket authentication failed:', error);
                next(new Error('Authentication failed'));
            }
        });
        
        // Connection handler
        this.io.on('connection', (socket) => {
            this.metrics.socketConnectionsTotal.inc();
            
            this.logger.info('New socket connection', {
                socketId: socket.id,
                userId: socket.userId
            });
            
            // Register socket with services
            this.socketManager.handleConnection(socket);
            this.presenceService.handleConnection(socket);
            this.collaborationService.handleConnection(socket);
            this.webrtcService.handleConnection(socket);
            
            // Handle disconnection
            socket.on('disconnect', (reason) => {
                this.metrics.socketConnectionsTotal.dec();
                
                this.logger.info('Socket disconnected', {
                    socketId: socket.id,
                    userId: socket.userId,
                    reason
                });
                
                // Cleanup
                this.socketManager.handleDisconnection(socket);
                this.presenceService.handleDisconnection(socket);
                this.collaborationService.handleDisconnection(socket);
                this.webrtcService.handleDisconnection(socket);
            });
            
            // Error handling
            socket.on('error', (error) => {
                this.logger.error('Socket error:', {
                    socketId: socket.id,
                    userId: socket.userId,
                    error: error.message
                });
            });
        });
    }
    
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        
        jwt.verify(token, config.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            req.user = user;
            next();
        });
    }
    
    async start() {
        const port = config.PORT || 8003;
        
        try {
            // Test Redis connection
            await this.redis.ping();
            this.logger.info('Redis connection established');
            
            // Start server
            this.server.listen(port, () => {
                this.logger.info(`Real-time service started on port ${port}`);
                console.log(`🚀 Real-time service running on http://localhost:${port}`);
            });
            
            // Graceful shutdown
            this.setupGracefulShutdown();
            
        } catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }
    
    setupGracefulShutdown() {
        const gracefulShutdown = async (signal) => {
            this.logger.info(`Received ${signal}, starting graceful shutdown`);
            
            // Close server
            this.server.close(() => {
                this.logger.info('HTTP server closed');
            });
            
            // Close Socket.IO
            this.io.close(() => {
                this.logger.info('Socket.IO server closed');
            });
            
            // Close Redis connection
            await this.redis.quit();
            this.logger.info('Redis connection closed');
            
            process.exit(0);
        };
        
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
}

// Start the server
if (require.main === module) {
    const server = new RealTimeServer();
    server.start().catch(error => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}

module.exports = RealTimeServer;