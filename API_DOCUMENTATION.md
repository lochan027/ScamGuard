# 🔌 ScamGuard API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URLs](#base-urls)
4. [Endpoints](#endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Examples](#examples)
9. [SDKs & Libraries](#sdks--libraries)

---

## Overview

The ScamGuard API provides RESTful endpoints for real-time scam detection and network analysis. The API processes text and URL submissions through our ML engine and returns detailed risk assessments with feature analysis.

### Key Features
- **Real-time Analysis**: Instant ML-powered risk assessment
- **Feature Extraction**: Comprehensive text and URL analysis
- **Similarity Detection**: Find related submissions automatically
- **Network Visualization**: Generate graph data for visualization
- **JSON Responses**: Consistent API response format

---

## Authentication

Currently, the ScamGuard API operates without authentication for public access. However, we recommend implementing rate limiting and monitoring for production use.

### Future Authentication (Planned)
```http
Authorization: Bearer YOUR_API_KEY
X-API-Key: YOUR_API_KEY
```

---

## Base URLs

| Environment | Base URL |
|-------------|----------|
| **Production** | `https://scam-guard-production.up.railway.app` |
| **Development** | `http://localhost:5001` |
| **Staging** | `https://scam-guard-staging.up.railway.app` |

---

## Endpoints

### 1. Health Check

#### `GET /api/health`

Check the health status of the API service.

**Request**
```http
GET /api/health
```

**Response**
```json
{
  "status": "OK",
  "timestamp": "2024-08-31T05:07:06.353Z"
}
```

**Status Codes**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is down

---

### 2. Submit Content for Analysis

#### `POST /api/submit`

Submit text, URLs, or messages for ML-powered scam analysis.

**Request**
```http
POST /api/submit
Content-Type: application/json
```

**Request Body**
```json
{
  "text": "string (required)",
  "type": "text|email|url|message (required)"
}
```

**Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | ✅ | Content to analyze (max 1000 characters) |
| `type` | string | ✅ | Content type classification |

**Content Types**
- `text` - General text content
- `email` - Email messages
- `url` - URLs or links
- `message` - SMS or chat messages

**Response**
```json
{
  "success": true,
  "submission": {
    "id": "uuid",
    "text": "string",
    "type": "string",
    "riskScore": 0-100,
    "riskCategory": "safe|suspicious|scam",
    "features": {
      "length": "number",
      "hasUrl": "boolean",
      "hasPhone": "boolean",
      "hasEmail": "boolean",
      "hasCurrency": "boolean",
      "hasUrgency": "boolean",
      "hasThreat": "boolean",
      "hasReward": "boolean",
      "hasAuthority": "boolean",
      "hasAction": "boolean",
      "hasSuspiciousDomain": "boolean",
      "keywordMatches": "number"
    },
    "timestamp": "FirebaseTimestamp",
    "similarSubmissions": ["array of IDs"]
  },
  "node": {
    "id": "uuid",
    "label": "string",
    "riskScore": "number",
    "riskCategory": "string",
    "type": "string",
    "timestamp": "FirebaseTimestamp"
  },
  "edges": [
    {
      "id": "string",
      "source": "uuid",
      "target": "uuid",
      "weight": "number (0-1)",
      "type": "similarity"
    }
  ],
  "message": "string"
}
```

**Status Codes**
- `200 OK` - Analysis completed successfully
- `400 Bad Request` - Invalid input parameters
- `422 Unprocessable Entity` - Content too long or invalid
- `500 Internal Server Error` - ML processing error

**Example Request**
```bash
curl -X POST https://scam-guard-production.up.railway.app/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "text": "URGENT: Your PayPal account has been suspended. Click here to verify: https://paypal-secure-login.com",
    "type": "email"
  }'
```

**Example Response**
```json
{
  "success": true,
  "submission": {
    "id": "73fa27b8-c19a-42b5-921d-3b0e0d3260af",
    "text": "URGENT: Your PayPal account has been suspended. Click here to verify: https://paypal-secure-login.com",
    "type": "email",
    "riskScore": 100,
    "riskCategory": "scam",
    "features": {
      "length": 101,
      "hasUrl": true,
      "hasPhone": false,
      "hasEmail": false,
      "hasCurrency": false,
      "hasUrgency": true,
      "hasThreat": true,
      "hasReward": false,
      "hasAuthority": true,
      "hasAction": true,
      "hasSuspiciousDomain": true,
      "keywordMatches": 5
    },
    "timestamp": {
      "_seconds": 1756616845,
      "_nanoseconds": 443000000
    },
    "similarSubmissions": ["e3d6e358-3037-49ef-97c7-5298a62309a3"]
  },
  "node": {
    "id": "73fa27b8-c19a-42b5-921d-3b0e0d3260af",
    "label": "URGENT: Your PayPal account has been suspended. Cl...",
    "riskScore": 100,
    "riskCategory": "scam",
    "type": "email",
    "timestamp": {
      "_seconds": 1756616845,
      "_nanoseconds": 443000000
    }
  },
  "edges": [
    {
      "id": "73fa27b8-c19a-42b5-921d-3b0e0d3260af-e3d6e358-3037-49ef-97c7-5298a62309a3",
      "source": "73fa27b8-c19a-42b5-921d-3b0e0d3260af",
      "target": "e3d6e358-3037-49ef-97c7-5298a62309a3",
      "weight": 0.6013071895424836,
      "type": "similarity"
    }
  ],
  "message": "Submission classified as scam with risk score 100"
}
```

---

### 3. Get All Submissions

#### `GET /api/submissions`

Retrieve all analyzed submissions with their risk assessments and features.

**Request**
```http
GET /api/submissions
```

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | ❌ | Maximum number of submissions to return (default: 100) |
| `offset` | number | ❌ | Number of submissions to skip (default: 0) |
| `category` | string | ❌ | Filter by risk category (safe, suspicious, scam) |
| `type` | string | ❌ | Filter by content type (text, email, url, message) |

**Response**
```json
[
  {
    "id": "uuid",
    "text": "string",
    "type": "string",
    "riskScore": "number",
    "riskCategory": "string",
    "features": {
      "length": "number",
      "hasUrl": "boolean",
      "hasPhone": "boolean",
      "hasEmail": "boolean",
      "hasCurrency": "boolean",
      "hasUrgency": "boolean",
      "hasThreat": "boolean",
      "hasReward": "boolean",
      "hasAuthority": "boolean",
      "hasAction": "boolean",
      "hasSuspiciousDomain": "boolean",
      "keywordMatches": "number"
    },
    "timestamp": "FirebaseTimestamp",
    "similarSubmissions": ["array of IDs"]
  }
]
```

**Status Codes**
- `200 OK` - Submissions retrieved successfully
- `500 Internal Server Error` - Database error

**Example Request**
```bash
# Get all submissions
curl https://scam-guard-production.up.railway.app/api/submissions

# Get only scam submissions
curl "https://scam-guard-production.up.railway.app/api/submissions?category=scam"

# Get first 10 email submissions
curl "https://scam-guard-production.up.railway.app/api/submissions?type=email&limit=10"
```

---

### 4. Get Network Graph Data

#### `GET /api/graph`

Retrieve network graph data for visualization, including nodes (submissions) and edges (similarity relationships).

**Request**
```http
GET /api/graph
```

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `minSimilarity` | number | ❌ | Minimum similarity threshold for edges (0-1, default: 0.3) |
| `maxNodes` | number | ❌ | Maximum number of nodes to return (default: 1000) |

**Response**
```json
{
  "nodes": [
    {
      "id": "uuid",
      "label": "string",
      "riskScore": "number",
      "riskCategory": "string",
      "type": "string",
      "timestamp": "FirebaseTimestamp"
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "uuid",
      "target": "uuid",
      "weight": "number (0-1)",
      "type": "string"
    }
  ]
}
```

**Status Codes**
- `200 OK` - Graph data retrieved successfully
- `500 Internal Server Error` - Database error

**Example Request**
```bash
# Get all graph data
curl https://scam-guard-production.up.railway.app/api/graph

# Get graph with higher similarity threshold
curl "https://scam-guard-production.up.railway.app/api/graph?minSimilarity=0.5"
```

---

## Data Models

### Submission Object
```json
{
  "id": "string (UUID)",
  "text": "string (max 1000 chars)",
  "type": "text|email|url|message",
  "riskScore": "number (0-100)",
  "riskCategory": "safe|suspicious|scam",
  "features": "FeatureObject",
  "timestamp": "FirebaseTimestamp",
  "similarSubmissions": ["array of UUIDs"]
}
```

### Feature Object
```json
{
  "length": "number (character count)",
  "hasUrl": "boolean",
  "hasPhone": "boolean",
  "hasEmail": "boolean",
  "hasCurrency": "boolean",
  "hasUrgency": "boolean",
  "hasThreat": "boolean",
  "hasReward": "boolean",
  "hasAuthority": "boolean",
  "hasAction": "boolean",
  "hasSuspiciousDomain": "boolean",
  "keywordMatches": "number (0-10+)"
}
```

### Node Object (Graph)
```json
{
  "id": "string (UUID)",
  "label": "string (truncated text)",
  "riskScore": "number (0-100)",
  "riskCategory": "safe|suspicious|scam",
  "type": "text|email|url|message",
  "timestamp": "FirebaseTimestamp"
}
```

### Edge Object (Graph)
```json
{
  "id": "string (source-target format)",
  "source": "string (source node UUID)",
  "target": "string (target node UUID)",
  "weight": "number (similarity score 0-1)",
  "type": "similarity"
}
```

### Risk Categories
| Category | Risk Score Range | Description |
|----------|------------------|-------------|
| **Safe** | 0-20 | Low-risk content, likely legitimate |
| **Suspicious** | 21-70 | Medium-risk content, requires attention |
| **Scam** | 71-100 | High-risk content, likely malicious |

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error context",
    "timestamp": "ISO8601 timestamp"
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Invalid request parameters |
| `CONTENT_TOO_LONG` | 422 | Content exceeds maximum length |
| `INVALID_CONTENT_TYPE` | 400 | Unsupported content type |
| `ML_PROCESSING_ERROR` | 500 | Machine learning processing failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Example Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required field: text",
    "details": "The 'text' field is required for content analysis",
    "timestamp": "2024-08-31T05:07:06.353Z"
  }
}
```

---

## Rate Limiting

### Current Limits
- **Submit Endpoint**: 100 requests per 15 minutes per IP
- **Read Endpoints**: 1000 requests per 15 minutes per IP
- **Health Endpoint**: No limits

### Rate Limit Response
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 900
```

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests from this IP",
    "details": "Rate limit: 100 requests per 15 minutes",
    "retryAfter": 900
  }
}
```

---

## Examples

### Complete Workflow Example

#### 1. Check API Health
```bash
curl https://scam-guard-production.up.railway.app/api/health
```

#### 2. Submit Suspicious Content
```bash
curl -X POST https://scam-guard-production.up.railway.app/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Congratulations! You have won $1000. Click here to claim: https://free-prize.net",
    "type": "message"
  }'
```

#### 3. Get All Submissions
```bash
curl https://scam-guard-production.up.railway.app/api/submissions
```

#### 4. Get Network Graph
```bash
curl https://scam-guard-production.up.railway.app/api/graph
```

### JavaScript/Node.js Example
```javascript
class ScamGuardAPI {
  constructor(baseURL = 'https://scam-guard-production.up.railway.app') {
    this.baseURL = baseURL;
  }

  async submitContent(text, type) {
    const response = await fetch(`${this.baseURL}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async getSubmissions(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/api/submissions?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  async getGraph(options = {}) {
    const params = new URLSearchParams(options);
    const response = await fetch(`${this.baseURL}/api/graph?${params}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }
}

// Usage
const api = new ScamGuardAPI();

// Submit content
const result = await api.submitContent(
  'URGENT: Your account needs verification',
  'email'
);

console.log(`Risk Score: ${result.submission.riskScore}%`);
console.log(`Category: ${result.submission.riskCategory}`);

// Get scam submissions
const scams = await api.getSubmissions({ category: 'scam' });
console.log(`Found ${scams.length} scam submissions`);

// Get graph data
const graph = await api.getGraph({ minSimilarity: 0.5 });
console.log(`Graph has ${graph.nodes.length} nodes and ${graph.edges.length} edges`);
```

### Python Example
```python
import requests
import json

class ScamGuardAPI:
    def __init__(self, base_url="https://scam-guard-production.up.railway.app"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def submit_content(self, text, content_type):
        """Submit content for analysis"""
        url = f"{self.base_url}/api/submit"
        data = {"text": text, "type": content_type}
        
        response = self.session.post(url, json=data)
        response.raise_for_status()
        
        return response.json()
    
    def get_submissions(self, **filters):
        """Get all submissions with optional filters"""
        url = f"{self.base_url}/api/submissions"
        params = {k: v for k, v in filters.items() if v is not None}
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def get_graph(self, **options):
        """Get network graph data"""
        url = f"{self.base_url}/api/graph"
        params = {k: v for k, v in options.items() if v is not None}
        
        response = self.session.get(url, params=params)
        response.raise_for_status()
        
        return response.json()

# Usage
api = ScamGuardAPI()

# Submit content
result = api.submit_content(
    "URGENT: Your account needs verification",
    "email"
)

print(f"Risk Score: {result['submission']['riskScore']}%")
print(f"Category: {result['submission']['riskCategory']}")

# Get scam submissions
scams = api.get_submissions(category="scam")
print(f"Found {len(scams)} scam submissions")

# Get graph data
graph = api.get_graph(minSimilarity=0.5)
print(f"Graph has {len(graph['nodes'])} nodes and {len(graph['edges'])} edges")
```

---

## SDKs & Libraries

### Official SDKs
Currently, ScamGuard provides a JavaScript/Node.js SDK. Additional language support is planned.

### Community Libraries
Feel free to create and share client libraries for your preferred programming language!

### Integration Examples
- **Web Applications**: Direct API calls from frontend
- **Mobile Apps**: REST API integration
- **Chatbots**: Automated scam detection
- **Security Tools**: Bulk analysis and monitoring
- **Research**: Academic and security research

---

## Support & Feedback

### Getting Help
- **Documentation**: This API documentation
- **Technical Issues**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **General Questions**: Community forum

### API Status
- **Status Page**: Check service health
- **Uptime**: 99.9%+ availability
- **Response Time**: <200ms average
- **Support**: 24/7 monitoring

---

*API Documentation Version: 1.0*  
*Last Updated: August 31, 2024*  
*ScamGuard API Team*
