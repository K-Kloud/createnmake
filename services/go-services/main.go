package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	"context"
)

// Prometheus metrics
var (
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "endpoint", "status"},
	)
	
	httpDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "http_request_duration_seconds",
			Help: "Duration of HTTP requests",
		},
		[]string{"method", "endpoint"},
	)

	activeConnections = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_connections",
			Help: "Number of active connections",
		},
	)
)

func init() {
	// Register metrics
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpDuration)
	prometheus.MustRegister(activeConnections)
}

type Server struct {
	router *gin.Engine
	redis  *redis.Client
}

type FileUploadRequest struct {
	FileName string `json:"filename"`
	FileSize int64  `json:"filesize"`
	FileType string `json:"filetype"`
}

type ProcessingRequest struct {
	JobID      string                 `json:"job_id"`
	JobType    string                 `json:"job_type"`
	Parameters map[string]interface{} `json:"parameters"`
}

type HealthResponse struct {
	Status    string            `json:"status"`
	Service   string            `json:"service"`
	Version   string            `json:"version"`
	Uptime    string            `json:"uptime"`
	Resources map[string]string `json:"resources"`
}

func NewServer() *Server {
	// Initialize Redis client
	redisClient := redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_URL", "localhost:6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       0,
	})

	// Test Redis connection
	ctx := context.Background()
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Printf("Warning: Redis connection failed: %v", err)
	}

	// Set Gin mode
	if getEnv("GIN_MODE", "debug") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()
	
	return &Server{
		router: router,
		redis:  redisClient,
	}
}

func (s *Server) setupRoutes() {
	// Middleware for metrics
	s.router.Use(s.prometheusMiddleware())
	
	// Health check
	s.router.GET("/health", s.healthCheck)
	
	// Metrics endpoint
	s.router.GET("/metrics", gin.WrapH(promhttp.Handler()))
	
	// File processing endpoints
	v1 := s.router.Group("/api/v1")
	{
		v1.POST("/upload/prepare", s.prepareFileUpload)
		v1.POST("/upload/complete", s.completeFileUpload)
		v1.GET("/upload/status/:jobId", s.getUploadStatus)
		
		// Job processing endpoints
		v1.POST("/jobs/create", s.createProcessingJob)
		v1.GET("/jobs/:jobId", s.getJobStatus)
		v1.DELETE("/jobs/:jobId", s.cancelJob)
		
		// Cache management
		v1.GET("/cache/:key", s.getCacheValue)
		v1.POST("/cache/:key", s.setCacheValue)
		v1.DELETE("/cache/:key", s.deleteCacheValue)
		
		// Performance utilities
		v1.POST("/compress", s.compressData)
		v1.POST("/resize-image", s.resizeImage)
		v1.POST("/convert-format", s.convertFormat)
	}
}

func (s *Server) prometheusMiddleware() gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		start := time.Now()
		
		// Process request
		c.Next()
		
		// Record metrics
		duration := time.Since(start).Seconds()
		statusCode := strconv.Itoa(c.Writer.Status())
		
		httpRequestsTotal.WithLabelValues(c.Request.Method, c.FullPath(), statusCode).Inc()
		httpDuration.WithLabelValues(c.Request.Method, c.FullPath()).Observe(duration)
	})
}

func (s *Server) healthCheck(c *gin.Context) {
	uptime := time.Since(startTime).String()
	
	// Check Redis connection
	redisStatus := "healthy"
	ctx := context.Background()
	if _, err := s.redis.Ping(ctx).Result(); err != nil {
		redisStatus = "unhealthy"
	}
	
	response := HealthResponse{
		Status:  "healthy",
		Service: "go-performance-service",
		Version: "1.0.0",
		Uptime:  uptime,
		Resources: map[string]string{
			"redis": redisStatus,
		},
	}
	
	c.JSON(http.StatusOK, response)
}

func (s *Server) prepareFileUpload(c *gin.Context) {
	var req FileUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	// Generate upload URL and job ID
	jobID := generateJobID()
	uploadURL := fmt.Sprintf("/upload/%s", jobID)
	
	// Store upload metadata in Redis
	ctx := context.Background()
	uploadData := map[string]interface{}{
		"filename": req.FileName,
		"filesize": req.FileSize,
		"filetype": req.FileType,
		"status":   "prepared",
		"created":  time.Now().Unix(),
	}
	
	data, _ := json.Marshal(uploadData)
	s.redis.Set(ctx, fmt.Sprintf("upload:%s", jobID), data, time.Hour*24)
	
	c.JSON(http.StatusOK, gin.H{
		"job_id":     jobID,
		"upload_url": uploadURL,
		"expires_at": time.Now().Add(time.Hour * 24).Unix(),
	})
}

func (s *Server) completeFileUpload(c *gin.Context) {
	jobID := c.PostForm("job_id")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "job_id required"})
		return
	}
	
	// Update status in Redis
	ctx := context.Background()
	key := fmt.Sprintf("upload:%s", jobID)
	
	exists, err := s.redis.Exists(ctx, key).Result()
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Upload job not found"})
		return
	}
	
	// Update status
	s.redis.HSet(ctx, key, "status", "completed", "completed_at", time.Now().Unix())
	
	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"status": "completed",
	})
}

func (s *Server) getUploadStatus(c *gin.Context) {
	jobID := c.Param("jobId")
	
	ctx := context.Background()
	key := fmt.Sprintf("upload:%s", jobID)
	
	data, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Upload job not found"})
		return
	}
	
	var uploadData map[string]interface{}
	json.Unmarshal([]byte(data), &uploadData)
	
	c.JSON(http.StatusOK, uploadData)
}

func (s *Server) createProcessingJob(c *gin.Context) {
	var req ProcessingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	jobID := generateJobID()
	
	// Store job in Redis
	ctx := context.Background()
	jobData := map[string]interface{}{
		"job_id":     jobID,
		"job_type":   req.JobType,
		"parameters": req.Parameters,
		"status":     "queued",
		"created":    time.Now().Unix(),
	}
	
	data, _ := json.Marshal(jobData)
	s.redis.Set(ctx, fmt.Sprintf("job:%s", jobID), data, time.Hour*48)
	
	// Add to processing queue
	s.redis.LPush(ctx, "processing_queue", jobID)
	
	c.JSON(http.StatusCreated, gin.H{
		"job_id": jobID,
		"status": "queued",
	})
}

func (s *Server) getJobStatus(c *gin.Context) {
	jobID := c.Param("jobId")
	
	ctx := context.Background()
	key := fmt.Sprintf("job:%s", jobID)
	
	data, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}
	
	var jobData map[string]interface{}
	json.Unmarshal([]byte(data), &jobData)
	
	c.JSON(http.StatusOK, jobData)
}

func (s *Server) cancelJob(c *gin.Context) {
	jobID := c.Param("jobId")
	
	ctx := context.Background()
	key := fmt.Sprintf("job:%s", jobID)
	
	// Update job status
	exists, err := s.redis.Exists(ctx, key).Result()
	if err != nil || exists == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}
	
	s.redis.HSet(ctx, key, "status", "cancelled", "cancelled_at", time.Now().Unix())
	
	c.JSON(http.StatusOK, gin.H{
		"job_id": jobID,
		"status": "cancelled",
	})
}

func (s *Server) getCacheValue(c *gin.Context) {
	key := c.Param("key")
	
	ctx := context.Background()
	value, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Key not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"key":   key,
		"value": value,
	})
}

func (s *Server) setCacheValue(c *gin.Context) {
	key := c.Param("key")
	
	var data map[string]interface{}
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	value := data["value"]
	ttl := time.Hour // default TTL
	
	if ttlValue, exists := data["ttl"]; exists {
		if ttlSeconds, ok := ttlValue.(float64); ok {
			ttl = time.Duration(ttlSeconds) * time.Second
		}
	}
	
	ctx := context.Background()
	valueStr, _ := json.Marshal(value)
	err := s.redis.Set(ctx, key, valueStr, ttl).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set value"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"key":    key,
		"status": "set",
	})
}

func (s *Server) deleteCacheValue(c *gin.Context) {
	key := c.Param("key")
	
	ctx := context.Background()
	deleted, err := s.redis.Del(ctx, key).Result()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete key"})
		return
	}
	
	if deleted == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Key not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"key":    key,
		"status": "deleted",
	})
}

func (s *Server) compressData(c *gin.Context) {
	// Placeholder for data compression
	c.JSON(http.StatusOK, gin.H{
		"message": "Compression endpoint - implementation needed",
	})
}

func (s *Server) resizeImage(c *gin.Context) {
	// Placeholder for image resizing
	c.JSON(http.StatusOK, gin.H{
		"message": "Image resize endpoint - implementation needed", 
	})
}

func (s *Server) convertFormat(c *gin.Context) {
	// Placeholder for format conversion
	c.JSON(http.StatusOK, gin.H{
		"message": "Format conversion endpoint - implementation needed",
	})
}

func (s *Server) Start(port string) {
	s.setupRoutes()
	
	log.Printf("Starting Go performance service on port %s", port)
	log.Fatal(s.router.Run(":" + port))
}

var startTime = time.Now()

func main() {
	server := NewServer()
	port := getEnv("PORT", "8002")
	server.Start(port)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func generateJobID() string {
	return fmt.Sprintf("job_%d_%d", time.Now().Unix(), time.Now().Nanosecond())
}