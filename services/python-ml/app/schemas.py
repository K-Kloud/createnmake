"""Pydantic schemas for ML microservice"""

from pydantic import BaseModel, HttpUrl
from typing import Dict, Any, List, Optional, Union
from enum import Enum

class ProcessingType(str, Enum):
    STYLE_TRANSFER = "style_transfer"
    BACKGROUND_REMOVAL = "background_removal" 
    COLOR_ENHANCEMENT = "color_enhancement"
    SUPER_RESOLUTION = "super_resolution"
    FABRIC_ANALYSIS = "fabric_analysis"
    DESIGN_OPTIMIZATION = "design_optimization"

class MLModelType(str, Enum):
    CLASSIFICATION = "classification"
    DETECTION = "detection"
    SEGMENTATION = "segmentation"
    GENERATION = "generation"
    RECOMMENDATION = "recommendation"

class AnalyticsType(str, Enum):
    USER_BEHAVIOR = "user_behavior"
    DESIGN_TRENDS = "design_trends"
    PERFORMANCE_METRICS = "performance_metrics"
    CONVERSION_ANALYSIS = "conversion_analysis"
    PREDICTIVE_ANALYTICS = "predictive_analytics"

class RecommendationType(str, Enum):
    DESIGN_SUGGESTIONS = "design_suggestions"
    COLOR_PALETTE = "color_palette"
    STYLE_MATCHING = "style_matching"
    TREND_FORECASTING = "trend_forecasting"

# Request schemas
class ImageProcessingRequest(BaseModel):
    image_url: HttpUrl
    processing_type: ProcessingType
    parameters: Optional[Dict[str, Any]] = {}
    
class MLInferenceRequest(BaseModel):
    model_name: str
    input_data: Union[Dict[str, Any], List[Any]]
    parameters: Optional[Dict[str, Any]] = {}
    
class AnalyticsRequest(BaseModel):
    data_type: str
    data_source: str
    analytics_type: AnalyticsType
    parameters: Optional[Dict[str, Any]] = {}
    
class RecommendationRequest(BaseModel):
    user_id: str
    recommendation_type: RecommendationType
    context: Dict[str, Any]
    parameters: Optional[Dict[str, Any]] = {}

# Response schemas
class ProcessingResult(BaseModel):
    success: bool
    result_url: Optional[HttpUrl] = None
    metadata: Dict[str, Any]
    processing_time: float
    
class MLInferenceResult(BaseModel):
    success: bool
    predictions: Union[Dict[str, Any], List[Any]]
    confidence_scores: Optional[List[float]] = None
    model_version: str
    inference_time: float
    
class AnalyticsResult(BaseModel):
    success: bool
    insights: Dict[str, Any]
    visualizations: Optional[List[Dict[str, Any]]] = None
    computation_time: float
    
class RecommendationResult(BaseModel):
    success: bool
    recommendations: List[Dict[str, Any]]
    confidence_scores: List[float]
    explanation: Optional[str] = None
    generation_time: float

# Health check schema
class HealthCheck(BaseModel):
    status: str
    service: str
    version: str
    timestamp: str
    dependencies: Dict[str, str]