#!/bin/bash

# OpenTech Multi-Stack Development Startup Script

echo "🚀 Starting OpenTech Multi-Stack Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check required ports
echo "🔍 Checking ports..."
check_port 5173 || echo "   Frontend development server"
check_port 8001 || echo "   Python ML service"
check_port 8002 || echo "   Go performance service"
check_port 8003 || echo "   Node.js realtime service"
check_port 6379 || echo "   Redis cache"

# Start development services
echo "🐳 Starting development containers..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Health check function
health_check() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:$port/health" >/dev/null 2>&1; then
            echo "✅ $service is ready"
            return 0
        fi
        echo "   Waiting for $service... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service failed to start"
    return 1
}

# Check service health
echo "🔍 Checking service health..."
health_check "Python ML Service" 8001
health_check "Go Performance Service" 8002
health_check "Node.js Realtime Service" 8003

# Check Redis
if redis-cli -h localhost -p 6379 ping | grep -q PONG; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not responding"
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📊 Service URLs:"
echo "   Frontend:              http://localhost:5173"
echo "   Python ML API:         http://localhost:8001"
echo "   Go Performance API:    http://localhost:8002"
echo "   Node.js Realtime:      http://localhost:8003"
echo "   Redis:                 localhost:6379"
echo ""
echo "📖 Documentation:"
echo "   API Docs (Python):     http://localhost:8001/docs"
echo "   API Docs (Go):         http://localhost:8002/swagger"
echo "   WebSocket Test:        http://localhost:8003/test"
echo ""
echo "🛠️  Development Commands:"
echo "   View logs:             docker-compose -f docker-compose.dev.yml logs -f [service]"
echo "   Restart service:       docker-compose -f docker-compose.dev.yml restart [service]"
echo "   Stop all:              docker-compose -f docker-compose.dev.yml down"
echo ""
echo "Happy coding! 🚀"