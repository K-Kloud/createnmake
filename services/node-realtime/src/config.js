require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 8003,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Redis configuration
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379/1',
    
    // JWT configuration
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',
    
    // CORS configuration
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000', 'http://localhost:8080'],
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Rate limiting
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
    
    // WebRTC configuration
    WEBRTC_ICE_SERVERS: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ],
    
    // Supabase configuration
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};