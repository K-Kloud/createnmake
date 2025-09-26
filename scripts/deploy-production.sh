#!/bin/bash

# OpenTech Multi-Stack Production Deployment Script

echo "🚀 Deploying OpenTech Multi-Stack to Production..."

# Set production environment
export NODE_ENV=production
export COMPOSE_PROJECT_NAME=opentech-prod

# Build and deploy services
echo "🏗️  Building and deploying services..."

# Pull latest images
docker-compose -f docker-compose.multi-stack.yml pull

# Build services with production optimizations
docker-compose -f docker-compose.multi-stack.yml build --no-cache

# Deploy with scaling
echo "📊 Deploying with horizontal scaling..."
docker-compose -f docker-compose.multi-stack.yml up -d \
  --scale webapp=3 \
  --scale python-ml-service=2 \
  --scale go-performance-service=3 \
  --scale node-realtime-service=2

# Wait for services
echo "⏳ Waiting for services to stabilize..."
sleep 30

# Health checks
echo "🔍 Running production health checks..."

services=(
  "webapp:8080"
  "python-ml-service:8001"
  "go-performance-service:8002"
  "node-realtime-service:8003"
  "prometheus:9090"
  "grafana:3001"
)

for service in "${services[@]}"; do
  IFS=':' read -r name port <<< "$service"
  if curl -f "http://localhost:$port/health" >/dev/null 2>&1; then
    echo "✅ $name is healthy"
  else
    echo "❌ $name health check failed"
  fi
done

# Database health
echo "🗄️  Checking database health..."
if docker-compose -f docker-compose.multi-stack.yml exec -T redis redis-cli ping | grep -q PONG; then
  echo "✅ Redis is healthy"
fi

# Setup monitoring alerts
echo "📊 Configuring monitoring alerts..."
curl -X POST http://localhost:9090/-/reload || echo "⚠️  Prometheus reload failed"

echo ""
echo "🎉 Production deployment completed!"
echo ""
echo "🌐 Production URLs:"
echo "   Application:          http://localhost"
echo "   API Gateway:          http://localhost:8000"
echo "   Monitoring:           http://localhost:3001"
echo "   Metrics:              http://localhost:9090"
echo ""
echo "📊 Scaling Information:"
echo "   Frontend replicas:    3"
echo "   ML service replicas:  2"
echo "   Go service replicas:  3"
echo "   Realtime replicas:    2"
echo ""
echo "Production environment is live! 🚀"