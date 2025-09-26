# OpenTech Multi-Stack Deployment Guide

## Quick Start

### Development Environment
```bash
# Make scripts executable
chmod +x scripts/start-dev.sh scripts/deploy-production.sh

# Start development environment
./scripts/start-dev.sh
```

### Production Deployment
```bash
# Deploy to production with scaling
./scripts/deploy-production.sh
```

## Architecture Overview

### Microservices Layer
1. **Frontend (React + TypeScript)**: Main web application
2. **Python ML/AI Service**: FastAPI-based machine learning and AI processing
3. **Go Performance Service**: High-performance operations and caching
4. **Node.js Real-time Service**: WebSocket connections and real-time features

### Data Pipeline
- **Redis**: Caching and message queues
- **Kafka**: Event streaming
- **Elasticsearch**: Search and analytics
- **InfluxDB**: Time-series data
- **MongoDB**: Document storage
- **Neo4j**: Graph relationships

### Monitoring & Observability
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards and visualization
- **Nginx**: Load balancing and SSL termination
- **Kong**: API Gateway

## Service URLs

### Development
- Frontend: http://localhost:5173
- Python ML API: http://localhost:8001
- Go Performance API: http://localhost:8002
- Node.js Realtime: http://localhost:8003
- Redis: localhost:6379

### Production
- Application: http://localhost (via Nginx)
- API Gateway: http://localhost:8000 (Kong)
- Monitoring: http://localhost:3001 (Grafana)
- Metrics: http://localhost:9090 (Prometheus)

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=https://igkiffajkpfwdfxwokwg.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional API Keys (for enhanced AI features)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Security
JWT_SECRET=your_jwt_secret
```

## Scaling Configuration

### Horizontal Scaling
The production deployment automatically scales services:
- Frontend: 3 replicas
- Python ML Service: 2 replicas
- Go Performance Service: 3 replicas
- Node.js Realtime: 2 replicas

### Custom Scaling
```bash
# Scale specific services
docker-compose -f docker-compose.multi-stack.yml up -d --scale python-ml-service=4

# Scale multiple services
docker-compose -f docker-compose.multi-stack.yml up -d \
  --scale webapp=5 \
  --scale go-performance-service=6
```

## Health Monitoring

### Service Health Endpoints
- Python ML: `GET /health`
- Go Performance: `GET /health`
- Node.js Realtime: `GET /health`
- Main App: `GET /health`

### Monitoring Integration
The system includes comprehensive monitoring:
- Real-time metrics collection
- Service health dashboards
- Automated alerts
- Performance tracking

## Security Features

### Network Security
- Rate limiting on API endpoints
- CORS configuration
- SSL/TLS termination
- Security headers

### Authentication
- JWT-based authentication
- Role-based access control
- API key management
- Session management

## Performance Optimizations

### Caching Strategy
- Redis for session data
- Application-level caching
- CDN integration ready
- Database query optimization

### Load Balancing
- Nginx reverse proxy
- Round-robin distribution
- Health check integration
- Failover capabilities

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 8001, 8002, 8003, 6379 are available
2. **Docker not running**: Ensure Docker daemon is running
3. **Service not responding**: Check logs with `docker-compose logs [service]`

### Debugging Commands
```bash
# View service logs
docker-compose -f docker-compose.multi-stack.yml logs -f [service]

# Check service status
docker-compose -f docker-compose.multi-stack.yml ps

# Restart specific service
docker-compose -f docker-compose.multi-stack.yml restart [service]

# Access service shell
docker-compose -f docker-compose.multi-stack.yml exec [service] /bin/bash
```

### Performance Monitoring
- Prometheus metrics: http://localhost:9090
- Grafana dashboards: http://localhost:3001
- Service health: Use the MultiStackDashboard component

## Development Workflow

### Local Development
1. Run `./scripts/start-dev.sh` to start all services
2. Services auto-reload on code changes
3. Use service-specific endpoints for testing
4. Monitor logs for debugging

### Adding New Services
1. Create service directory in `services/`
2. Add Dockerfile and configuration
3. Update `docker-compose.multi-stack.yml`
4. Add health checks and monitoring
5. Update documentation

This multi-stack architecture provides enterprise-level scalability, comprehensive monitoring, and robust security while maintaining development flexibility.