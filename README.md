# Course Buddy

A comprehensive web application designed to help San Francisco State University Computer Science students make informed decisions about course selection and professor choices.

## Project Overview

Course Buddy is a full-stack web application that provides:
- **Professor Information**: Browse and find details about CS professors with ratings and reviews
- **Course Information**: Explore Computer Science courses, prerequisites, and descriptions
- **AI-Powered Recommendations**: Get personalized course suggestions based on completed courses
- **Course Buddy GPT**: Interactive chatbot with hybrid RAG pipeline combining structured data and semantic search of student reviews 

## Problem Statement

CS students often struggle with:
- Finding the right professors for their courses
- Understanding course prerequisites and difficulty levels
- Making informed decisions about course selection
- Getting personalized recommendations based on their academic background
- Accessing natural language student experiences and reviews

Course Buddy solves these challenges by providing a centralized platform with comprehensive course and professor data, enhanced with AI-powered recommendations and a hybrid RAG system for context-rich responses.

## Tech Stack

### Frontend
- **React.js** - User interface framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS3** - Styling and responsive design

### Backend
- **Node.js** - Server runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization

### AI/ML
- **OpenRouter API** - LLM integration for chat completions
- **OpenAI Embeddings** - text-embedding-3-small for vector generation
- **Pinecone** - Vector database for semantic search
- **Custom Recommendation Algorithm** - Local algorithm for course suggestions
- **Hybrid RAG Pipeline** - Combines structured MongoDB data with semantic review search

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **AWS EC2** - Cloud hosting

## Features

### 1. Professor Information
- Searchable professor database
- RateMyProfessors integration
- Detailed ratings and reviews
- Course offerings per professor

### 2. Course Information
- Complete course catalog
- Prerequisites and descriptions
- Professor assignments
- Course difficulty indicators

### 3. AI-Powered Recommendations
- Multi-step recommendation form
- Prerequisites validation
- Professor quality consideration
- Course level prioritization
- Regeneration capability (up to 3 times)

### 4. Course Buddy GPT (Hybrid RAG System)
- Interactive chatbot interface powered by hybrid RAG pipeline
- Combines structured data (MongoDB) with semantic search (Pinecone)
- Retrieves relevant student reviews using OpenAI embeddings
- Context-aware responses using OpenRouter
- Handles both logic-heavy queries (prerequisites, course structure) and vague queries (teaching style, student experiences)
- Sample questions for guidance

## RAG Hybrid Pipeline Architecture

### System Design

The Course Buddy GPT uses a hybrid approach combining two data sources:

**1. Structured Data (MongoDB)**
- Course prerequisites and descriptions
- Professor ratings and difficulty levels
- Course offerings and enrollment data
- Optimal for logic-heavy queries requiring precise data

**2. Semantic Search (RAG Pipeline)**
- Student reviews embedded using OpenAI text-embedding-3-small
- Vector storage in Pinecone (1536 dimensions)
- Semantic similarity search for natural language queries
- Optimal for vague queries about teaching style and student experiences

### Data Flow

```
User Question
     |
     v
Backend API (/api/chat/query)
     |
     +-- MongoDB: Fetch courses + professors (structured data)
     |
     +-- RAG Service:
         |
         +-- OpenAI: Generate query embedding
         |
         +-- Pinecone: Search for similar review vectors
         |
         +-- Return: Top-K relevant student reviews
     |
     v
OpenRouter: Generate response with combined context
     |
     v
User receives answer enriched with both data types
```

### Components

- **ragService.js**: Handles embedding generation and Pinecone queries
- **indexReviews.js**: Batch indexing script for review embeddings
- **professor_reviews.json**: Source data for student reviews
- **Chat.js**: Frontend interface for user interactions

## RAG System Evaluation Results

**Test Date:** November 10, 2025  
**Total Test Cases:** 10  
**Success Rate:** 100% (all tests executed successfully)

### Performance Metrics

| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| Context Recall | 87.33% | >70% | Exceeds Target |
| Context Precision | 86.00% | >80% | Meets Target |
| F1 Score | 77.97% | >75% | Meets Target |
| Context Relevance | 97.50% | >70% | Exceeds Target |
| Answer Relevance | 97.50% | >70% | Exceeds Target |
| Entity Accuracy | 90.00% | >90% | Meets Target |

### Key Findings

**Strengths:**
- Excellent context recall (87.33%) - retrieves most expected relevant reviews
- Outstanding relevance scores (97.5%) - retrieved content highly relevant to queries
- 100% test success rate - stable system with no crashes or API failures

**System Stability:**
- Retrieval system functioning correctly with 87% recall
- Context quality excellent at 97.5% relevance
- No system failures during evaluation

**Overall Assessment:** The RAG system is functional and retrieves relevant information successfully. All critical metrics meet or exceed production targets.

### Testing Framework

The system includes a comprehensive evaluation framework with:
- 10 RAG-specific test cases covering teaching style, course structure, and professor comparisons
- 12 hybrid system test cases covering logic-heavy, vague, and combined queries
- RAGAS-inspired metrics for retrieval and generation quality
- Automated evaluation scripts (`npm run eval:rag`, `npm run eval:hybrid`)

For detailed testing documentation, see `backend/testing/TESTING_README.md`

## Prerequisites

Before running this project, make sure you have:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)
- OpenRouter API key (for chat completions)
- OpenAI API key (for embeddings)
- Pinecone account and API key (for vector database)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd course-buddy
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
# Database
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001

# Email Service
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# AI Services
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=course-buddy-reviews
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
REACT_APP_OPENROUTER_KEY=your_openrouter_api_key
```

### 4. API Keys Setup

**OpenAI** (for embeddings):
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Add $5 minimum credit (embeddings are very cheap: ~$0.00002 per 1K tokens)

**OpenRouter** (for chat completions):
1. Visit https://openrouter.ai/
2. Create an account and get your API key
3. The application uses the `openai/gpt-3.5-turbo` model

**Pinecone** (for vector database):
1. Visit https://app.pinecone.io/
2. Sign up for a free account
3. Create a new index:
   - Name: `course-buddy-reviews`
   - Dimensions: `1536`
   - Metric: `cosine`
4. Copy your API key from the dashboard

### 5. Index Student Reviews

After setting up API keys, index the student reviews:
```bash
cd backend
npm run index-reviews
```

This will embed all reviews and store them in Pinecone. You only need to do this once, or when you add new reviews.

## Running Locally

### Development Mode

1. **Start Backend Server**
```bash
cd backend
npm start
```
Backend will run on `http://localhost:5001`

2. **Start Frontend Development Server**
```bash
cd frontend
npm start
```
Frontend will run on `http://localhost:3000`

### Production Mode with Docker

1. **Build and Run with Docker Compose**
```bash
docker-compose up --build
```

2. **Access the Application**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5001`

## Docker Deployment

### Local Docker Testing
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### AWS EC2 Deployment
See `README-DEPLOYMENT.md` for detailed AWS EC2 deployment instructions.

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String,
  personalEmail: String,
  password: String,
  completed_courses: [String],
  isVerified: Boolean
}
```

### Professor Model
```javascript
{
  name: String,
  courses_offered: [String],
  overall_quality: Number,
  would_take_again: Number,
  difficulty: Number,
  rmp_link: String
}
```

### Course Model
```javascript
{
  course_number: String,
  course_title: String,
  prerequisites: String,
  description: String,
  professors: [ObjectId]
}
```

## Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Protected routes require valid JWT tokens
- Tokens are stored in localStorage
- Automatic token validation on API requests

## AI Integration

### Recommendation System
- Uses local algorithm for course recommendations
- Considers prerequisites, professor ratings, and course levels
- Generates 3x requested recommendations for regeneration

### Chatbot (Course Buddy GPT) - Hybrid RAG System

**Architecture:**
- **Structured Data Layer**: MongoDB queries for precise course/professor information
- **Semantic Search Layer**: Pinecone vector database for student review retrieval
- **Embedding Generation**: OpenAI text-embedding-3-small (1536 dimensions)
- **LLM Generation**: OpenRouter with GPT-3.5-turbo for natural language responses

**Query Processing:**
1. User question received at `/api/chat/query`
2. Parallel data retrieval:
   - MongoDB: Fetch course prerequisites, professor ratings, course descriptions
   - RAG Pipeline: Generate query embedding, search Pinecone for relevant reviews
3. Context combination: Merge structured data and retrieved reviews
4. LLM generation: OpenRouter generates response using combined context
5. Return enriched answer to user

**Capabilities:**
- Logic-heavy queries: Uses structured data (e.g., "What are prerequisites for CSC 340?")
- Vague queries: Uses semantic search (e.g., "I want a professor who explains clearly")
- Hybrid queries: Combines both (e.g., "What do students say about CSC 510?")

### Review Management
- Add reviews: `npm run add-review` (interactive CLI)
- Index reviews: `npm run index-reviews` (batch embedding and upload to Pinecone)
- Format: JSON file at `backend/data/professor_reviews.json`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get specific course
- `GET /api/courses/professor/:id` - Get courses by professor

### Professors
- `GET /api/professors` - Get all professors
- `GET /api/professors/:id` - Get specific professor

### Recommendations
- `POST /api/recommendations` - Get course recommendations

### Chat (RAG System)
- `POST /api/chat/query` - RAG-enhanced chat query with hybrid context

## Testing

### Manual Testing
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### RAG System Evaluation
```bash
cd backend

# Test RAG retrieval quality
npm run eval:rag

# Test complete hybrid system (requires auth token)
npm run eval:hybrid YOUR_AUTH_TOKEN
```

Evaluation includes:
- Context recall and precision metrics
- F1 scores for retrieval quality
- Answer relevance and entity accuracy
- Category-wise performance (logic-heavy vs vague queries)

See `backend/testing/TESTING_README.md` for detailed testing documentation.

## Performance Metrics

## Performance Metrics

### RAG System
- Context Recall: 87.33%
- Context Precision: 86.00%
- F1 Score: 77.97%
- System Stability: 100%

### Application Optimizations
- Lazy loading for course and professor data
- Efficient database queries with indexing
- Vector similarity search with Pinecone (sub-50ms queries)
- Semantic caching for common queries
- Responsive design for mobile devices
- Optimized Docker images

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB connection string
   - Ensure MongoDB is running

2. **OpenRouter API Errors**
   - Verify your API key is correct
   - Check API key permissions

3. **OpenAI API Errors (RAG System)**
   - Ensure you have credits in your OpenAI account
   - Check API key is correctly set in backend `.env`
   - Error "insufficient_quota": Add credits at https://platform.openai.com/account/billing

4. **Pinecone Connection Issues**
   - Verify index name matches `.env` (course-buddy-reviews)
   - Check index dimensions are 1536
   - Ensure API key is valid

5. **RAG System Not Retrieving Reviews**
   - Verify reviews are indexed: `npm run index-reviews`
   - Check Pinecone dashboard for vector count (should be >0)
   - Ensure backend server is running

6. **Port Conflicts**
   - Ensure ports 3000 and 5001 are available
   - Check for other running services

7. **Docker Issues**
   - Clear Docker cache: `docker system prune`
   - Rebuild containers: `docker-compose build --no-cache`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



---

**Course Buddy** - Making course selection easier for SFSU CS students with AI-powered recommendations and semantic search.
