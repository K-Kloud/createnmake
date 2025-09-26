"""ML Model service for training and inference"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, Any, List, Optional, Union
import asyncio
import pickle
import joblib
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from transformers import pipeline, AutoTokenizer, AutoModel
import uuid
from loguru import logger
import os

class MLModelService:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.training_tasks = {}
        self.model_storage_path = "/app/models"
        os.makedirs(self.model_storage_path, exist_ok=True)
        
    async def load_models(self):
        """Load pre-trained models"""
        try:
            # Load text classification model
            self.models['text_classifier'] = pipeline(
                "text-classification",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
            
            # Load image classification model  
            self.models['image_classifier'] = pipeline(
                "image-classification",
                model="google/vit-base-patch16-224"
            )
            
            # Load text embedding model
            self.models['text_embeddings'] = pipeline(
                "feature-extraction",
                model="sentence-transformers/all-MiniLM-L6-v2"
            )
            
            # Load fashion-specific models
            await self._load_fashion_models()
            
            logger.info("All ML models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            
    async def _load_fashion_models(self):
        """Load fashion-specific ML models"""
        try:
            # Style classifier
            self.models['style_classifier'] = RandomForestClassifier(n_estimators=100)
            
            # Color palette generator
            self.models['color_palette'] = KMeans(n_clusters=5, random_state=42)
            
            # Trend predictor
            self.models['trend_predictor'] = GradientBoostingRegressor(n_estimators=100)
            
            # Load pre-trained weights if available
            await self._load_pretrained_weights()
            
        except Exception as e:
            logger.error(f"Failed to load fashion models: {str(e)}")
    
    async def _load_pretrained_weights(self):
        """Load pre-trained model weights from storage"""
        try:
            style_model_path = os.path.join(self.model_storage_path, "style_classifier.pkl")
            if os.path.exists(style_model_path):
                self.models['style_classifier'] = joblib.load(style_model_path)
                
            trend_model_path = os.path.join(self.model_storage_path, "trend_predictor.pkl")  
            if os.path.exists(trend_model_path):
                self.models['trend_predictor'] = joblib.load(trend_model_path)
                
        except Exception as e:
            logger.warning(f"Could not load pretrained weights: {str(e)}")
    
    async def run_inference(self, model_name: str, input_data: Union[Dict, List], parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Run inference on specified model"""
        try:
            start_time = asyncio.get_event_loop().time()
            
            if model_name not in self.models:
                raise ValueError(f"Model '{model_name}' not found")
            
            model = self.models[model_name]
            
            # Route to appropriate inference method
            if model_name == "text_classifier":
                result = await self._text_classification_inference(model, input_data, parameters)
            elif model_name == "image_classifier":
                result = await self._image_classification_inference(model, input_data, parameters)
            elif model_name == "text_embeddings":
                result = await self._text_embedding_inference(model, input_data, parameters)
            elif model_name == "style_classifier":
                result = await self._style_classification_inference(model, input_data, parameters)
            elif model_name == "color_palette":
                result = await self._color_palette_inference(model, input_data, parameters)
            elif model_name == "trend_predictor":
                result = await self._trend_prediction_inference(model, input_data, parameters)
            else:
                result = await self._general_inference(model, input_data, parameters)
            
            inference_time = asyncio.get_event_loop().time() - start_time
            
            return {
                "success": True,
                "predictions": result,
                "model_version": "1.0.0",
                "inference_time": inference_time
            }
            
        except Exception as e:
            logger.error(f"Inference failed for {model_name}: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "model_name": model_name
            }
    
    async def _text_classification_inference(self, model, input_data: Union[str, List[str]], parameters: Dict) -> Dict[str, Any]:
        """Text classification inference"""
        if isinstance(input_data, str):
            input_data = [input_data]
            
        results = model(input_data)
        return {
            "classifications": results,
            "input_count": len(input_data)
        }
    
    async def _image_classification_inference(self, model, input_data: str, parameters: Dict) -> Dict[str, Any]:
        """Image classification inference"""
        # input_data should be image URL or base64
        result = model(input_data)
        return {
            "classification": result,
            "top_prediction": result[0] if result else None
        }
    
    async def _text_embedding_inference(self, model, input_data: Union[str, List[str]], parameters: Dict) -> Dict[str, Any]:
        """Text embedding inference"""
        if isinstance(input_data, str):
            input_data = [input_data]
            
        embeddings = model(input_data)
        return {
            "embeddings": embeddings,
            "dimensions": len(embeddings[0]) if embeddings else 0,
            "input_count": len(input_data)
        }
    
    async def _style_classification_inference(self, model, input_data: Dict, parameters: Dict) -> Dict[str, Any]:
        """Fashion style classification"""
        # Extract features from input_data
        features = self._extract_style_features(input_data)
        
        if hasattr(model, 'predict_proba'):
            prediction = model.predict(features.reshape(1, -1))[0]
            probabilities = model.predict_proba(features.reshape(1, -1))[0]
            
            style_classes = ["casual", "formal", "sporty", "elegant", "trendy"]
            
            return {
                "predicted_style": style_classes[prediction] if prediction < len(style_classes) else "unknown",
                "confidence_scores": probabilities.tolist(),
                "all_styles": style_classes
            }
        else:
            return {"error": "Model not trained yet"}
    
    async def _color_palette_inference(self, model, input_data: Dict, parameters: Dict) -> Dict[str, Any]:
        """Color palette generation"""
        # Extract colors from input image/design
        colors = self._extract_colors(input_data)
        
        if len(colors) > 0:
            palette = model.fit_predict(colors.reshape(-1, 3))
            dominant_colors = model.cluster_centers_
            
            return {
                "color_palette": dominant_colors.tolist(),
                "color_distribution": np.bincount(palette).tolist(),
                "palette_size": len(dominant_colors)
            }
        else:
            return {"error": "No colors found in input"}
    
    async def _trend_prediction_inference(self, model, input_data: Dict, parameters: Dict) -> Dict[str, Any]:
        """Fashion trend prediction"""
        # Extract trend features
        features = self._extract_trend_features(input_data)
        
        if hasattr(model, 'predict'):
            trend_score = model.predict(features.reshape(1, -1))[0]
            
            return {
                "trend_score": float(trend_score),
                "trend_level": self._categorize_trend_score(trend_score),
                "confidence": min(abs(trend_score), 1.0)
            }
        else:
            return {"error": "Model not trained yet"}
    
    async def _general_inference(self, model, input_data: Any, parameters: Dict) -> Dict[str, Any]:
        """General inference for custom models"""
        try:
            if hasattr(model, 'predict'):
                if isinstance(input_data, (list, np.ndarray)):
                    predictions = model.predict(input_data)
                else:
                    predictions = model.predict([input_data])
                return {"predictions": predictions.tolist() if hasattr(predictions, 'tolist') else predictions}
            else:
                return {"error": "Model does not support prediction"}
        except Exception as e:
            return {"error": f"General inference failed: {str(e)}"}
    
    async def start_training(self, model_type: str, training_data: Dict, parameters: Dict) -> str:
        """Start training a custom model"""
        task_id = str(uuid.uuid4())
        
        # Start training in background
        asyncio.create_task(self._train_model_async(task_id, model_type, training_data, parameters))
        
        self.training_tasks[task_id] = {
            "status": "started",
            "model_type": model_type,
            "start_time": asyncio.get_event_loop().time()
        }
        
        return task_id
    
    async def _train_model_async(self, task_id: str, model_type: str, training_data: Dict, parameters: Dict):
        """Asynchronous model training"""
        try:
            self.training_tasks[task_id]["status"] = "training"
            
            if model_type == "style_classifier":
                await self._train_style_classifier(training_data, parameters)
            elif model_type == "trend_predictor":
                await self._train_trend_predictor(training_data, parameters)
            elif model_type == "recommendation_engine":
                await self._train_recommendation_engine(training_data, parameters)
            else:
                raise ValueError(f"Unknown model type: {model_type}")
            
            self.training_tasks[task_id]["status"] = "completed"
            logger.info(f"Training completed for task {task_id}")
            
        except Exception as e:
            self.training_tasks[task_id]["status"] = "failed"
            self.training_tasks[task_id]["error"] = str(e)
            logger.error(f"Training failed for task {task_id}: {str(e)}")
    
    async def _train_style_classifier(self, training_data: Dict, parameters: Dict):
        """Train fashion style classifier"""
        X = np.array(training_data["features"])
        y = np.array(training_data["labels"])
        
        model = RandomForestClassifier(
            n_estimators=parameters.get("n_estimators", 100),
            max_depth=parameters.get("max_depth", None),
            random_state=42
        )
        
        # Train model
        model.fit(X, y)
        
        # Save model
        self.models["style_classifier"] = model
        model_path = os.path.join(self.model_storage_path, "style_classifier.pkl")
        joblib.dump(model, model_path)
    
    async def _train_trend_predictor(self, training_data: Dict, parameters: Dict):
        """Train trend prediction model"""
        X = np.array(training_data["features"])  
        y = np.array(training_data["trend_scores"])
        
        model = GradientBoostingRegressor(
            n_estimators=parameters.get("n_estimators", 100),
            learning_rate=parameters.get("learning_rate", 0.1),
            random_state=42
        )
        
        # Train model
        model.fit(X, y)
        
        # Save model
        self.models["trend_predictor"] = model
        model_path = os.path.join(self.model_storage_path, "trend_predictor.pkl")
        joblib.dump(model, model_path)
    
    async def _train_recommendation_engine(self, training_data: Dict, parameters: Dict):
        """Train recommendation engine"""
        # Collaborative filtering implementation
        user_item_matrix = np.array(training_data["user_item_matrix"])
        
        # Use matrix factorization for recommendations
        from sklearn.decomposition import NMF
        
        model = NMF(
            n_components=parameters.get("n_components", 10),
            random_state=42
        )
        
        W = model.fit_transform(user_item_matrix)
        H = model.components_
        
        self.models["recommendation_engine"] = {
            "model": model,
            "user_factors": W,
            "item_factors": H
        }
    
    def _extract_style_features(self, input_data: Dict) -> np.ndarray:
        """Extract features for style classification"""
        # Placeholder feature extraction
        features = [
            input_data.get("color_variance", 0.5),
            input_data.get("pattern_complexity", 0.3),
            input_data.get("silhouette_score", 0.7),
            input_data.get("texture_roughness", 0.4),
            input_data.get("formality_score", 0.6)
        ]
        return np.array(features)
    
    def _extract_colors(self, input_data: Dict) -> np.ndarray:
        """Extract colors from input data"""
        if "colors" in input_data:
            return np.array(input_data["colors"])
        else:
            # Generate sample colors as placeholder
            return np.random.randint(0, 256, (100, 3))
    
    def _extract_trend_features(self, input_data: Dict) -> np.ndarray:
        """Extract features for trend prediction"""
        features = [
            input_data.get("social_media_mentions", 100),
            input_data.get("search_volume", 1000),
            input_data.get("influencer_adoption", 0.3),
            input_data.get("retail_availability", 0.5),
            input_data.get("seasonal_relevance", 0.8)
        ]
        return np.array(features)
    
    def _categorize_trend_score(self, score: float) -> str:
        """Categorize trend prediction score"""
        if score > 0.8:
            return "hot_trend"
        elif score > 0.6:
            return "rising_trend"  
        elif score > 0.4:
            return "stable"
        elif score > 0.2:
            return "declining"
        else:
            return "outdated"
    
    async def cleanup(self):
        """Cleanup resources"""
        try:
            # Clear models from memory
            self.models.clear()
            self.scalers.clear()
            logger.info("ML service cleanup completed")
        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
    
    def get_training_status(self, task_id: str) -> Dict[str, Any]:
        """Get training task status"""
        if task_id in self.training_tasks:
            return self.training_tasks[task_id]
        else:
            return {"error": "Task not found"}