"""
FastAPI Microservice for ML/AI Processing
Handles advanced image processing, ML model inference, and AI analytics
"""

import os
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import asyncio
from loguru import logger
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from fastapi import Response

from app.services.image_processor import ImageProcessor
from app.services.ml_models import MLModelService  
from app.services.analytics_engine import AnalyticsEngine
from app.services.recommendation_engine import RecommendationEngine
from app.config import Settings
from app.middleware.auth import verify_token
from app.schemas import (
    ImageProcessingRequest, 
    MLInferenceRequest, 
    AnalyticsRequest,
    RecommendationRequest
)

# Prometheus metrics
REQUEST_COUNT = Counter('ml_service_requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('ml_service_request_duration_seconds', 'Request duration')
ERROR_COUNT = Counter('ml_service_errors_total', 'Total errors', ['error_type'])

settings = Settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - startup and shutdown"""
    # Startup
    logger.info("Starting ML/AI Microservice...")
    
    # Initialize services
    app.state.image_processor = ImageProcessor()
    app.state.ml_service = MLModelService()
    app.state.analytics_engine = AnalyticsEngine()
    app.state.recommendation_engine = RecommendationEngine()
    
    # Load ML models
    await app.state.ml_service.load_models()
    logger.info("ML models loaded successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ML/AI Microservice...")
    await app.state.ml_service.cleanup()

app = FastAPI(
    title="OpenTech ML/AI Microservice",
    description="Advanced ML/AI processing service for fashion design generation and analysis",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_process_time_header(request, call_next):
    """Add request timing and metrics"""
    start_time = time.time()
    REQUEST_COUNT.labels(method=request.method, endpoint=request.url.path).inc()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    REQUEST_DURATION.observe(process_time)
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ml-ai-microservice",
        "version": "1.0.0"
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/image/process")
async def process_image(
    request: ImageProcessingRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Advanced image processing with ML enhancement"""
    try:
        image_processor = app.state.image_processor
        
        result = await image_processor.process_advanced(
            image_url=request.image_url,
            processing_type=request.processing_type,
            parameters=request.parameters
        )
        
        # Background analytics
        background_tasks.add_task(
            log_processing_analytics, 
            request.image_url, 
            request.processing_type,
            result
        )
        
        return result
        
    except Exception as e:
        ERROR_COUNT.labels(error_type="image_processing").inc()
        logger.error(f"Image processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/ml/inference")
async def ml_inference(
    request: MLInferenceRequest,
    token: str = Depends(verify_token)
):
    """Run ML model inference"""
    try:
        ml_service = app.state.ml_service
        
        result = await ml_service.run_inference(
            model_name=request.model_name,
            input_data=request.input_data,
            parameters=request.parameters
        )
        
        return result
        
    except Exception as e:
        ERROR_COUNT.labels(error_type="ml_inference").inc()
        logger.error(f"ML inference error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/analytics/compute")
async def compute_analytics(
    request: AnalyticsRequest,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Compute advanced analytics"""
    try:
        analytics_engine = app.state.analytics_engine
        
        result = await analytics_engine.compute_analytics(
            data_type=request.data_type,
            data_source=request.data_source,
            analytics_type=request.analytics_type,
            parameters=request.parameters
        )
        
        # Store results in background
        background_tasks.add_task(
            store_analytics_results,
            result,
            request.data_type
        )
        
        return result
        
    except Exception as e:
        ERROR_COUNT.labels(error_type="analytics").inc()
        logger.error(f"Analytics computation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/recommendations/generate")
async def generate_recommendations(
    request: RecommendationRequest,
    token: str = Depends(verify_token)
):
    """Generate AI-powered recommendations"""
    try:
        recommendation_engine = app.state.recommendation_engine
        
        recommendations = await recommendation_engine.generate_recommendations(
            user_id=request.user_id,
            recommendation_type=request.recommendation_type,
            context=request.context,
            parameters=request.parameters
        )
        
        return recommendations
        
    except Exception as e:
        ERROR_COUNT.labels(error_type="recommendations").inc()
        logger.error(f"Recommendation generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/models/train")
async def train_custom_model(
    request: dict,
    background_tasks: BackgroundTasks,
    token: str = Depends(verify_token)
):
    """Train custom ML models"""
    try:
        ml_service = app.state.ml_service
        
        # Start training in background
        task_id = await ml_service.start_training(
            model_type=request["model_type"],
            training_data=request["training_data"],
            parameters=request.get("parameters", {})
        )
        
        return {
            "status": "training_started",
            "task_id": task_id,
            "estimated_completion": "2-4 hours"
        }
        
    except Exception as e:
        ERROR_COUNT.labels(error_type="model_training").inc()
        logger.error(f"Model training error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Background task functions
async def log_processing_analytics(image_url: str, processing_type: str, result: dict):
    """Log processing analytics in background"""
    try:
        analytics_engine = app.state.analytics_engine
        await analytics_engine.log_processing_event(image_url, processing_type, result)
    except Exception as e:
        logger.error(f"Failed to log analytics: {str(e)}")

async def store_analytics_results(result: dict, data_type: str):
    """Store analytics results in background"""
    try:
        analytics_engine = app.state.analytics_engine
        await analytics_engine.store_results(result, data_type)
    except Exception as e:
        logger.error(f"Failed to store analytics results: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    import time
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        access_log=True
    )