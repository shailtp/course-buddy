# Course Buddy 🎓

A comprehensive web application designed to help San Francisco State University Computer Science students make informed decisions about course selection and professor choices.

## 📋 Project Overview

Course Buddy is a full-stack web application that provides:
- **Professor Information**: Browse and find details about CS professors with ratings and reviews
- **Course Information**: Explore Computer Science courses, prerequisites, and descriptions
- **AI-Powered Recommendations**: Get personalized course suggestions based on completed courses
- **Course Buddy GPT**: Interactive Context Aware RAG chatbot for course selection guidance 

## 🎯 Problem Statement

CS students often struggle with:
- Finding the right professors for their courses
- Understanding course prerequisites and difficulty levels
- Making informed decisions about course selection
- Getting personalized recommendations based on their academic background

Course Buddy solves these challenges by providing a centralized platform with comprehensive course and professor data, enhanced with AI-powered recommendations.

## 🛠️ Tech Stack

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
- **OpenRouter API** - LLM integration for recommendations and chatbot
- **Custom Recommendation Algorithm** - Local algorithm for course suggestions

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **AWS EC2** - Cloud hosting

## 🚀 Features

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

### 4. Course Buddy GPT
- Interactive chatbot interface
- Context-aware responses
- Course and professor queries
- Sample questions for guidance

## 📦 Prerequisites

Before running this project, make sure you have:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud)
- OpenRouter API key

## 🔧 Installation & Setup

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
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
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

### 4. OpenRouter API Setup
1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Add the key to your frontend `.env` file
4. The application uses the `openai/gpt-3.5-turbo` model

## 🏃‍♂️ Running Locally

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

## 🐳 Docker Deployment

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

## 📊 Database Schema

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

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Protected routes require valid JWT tokens
- Tokens are stored in localStorage
- Automatic token validation on API requests

## 🤖 AI Integration

### Recommendation System
- Uses local algorithm for course recommendations
- Considers prerequisites, professor ratings, and course levels
- Generates 3x requested recommendations for regeneration

### Chatbot (Course Buddy GPT)
- OpenRouter API integration
- Context-aware responses using course and professor data
- Sample questions for user guidance

## 📱 API Endpoints

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

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests (if implemented)
cd backend
npm test
```

## 📈 Performance Optimizations

- Lazy loading for course and professor data
- Efficient database queries with indexing
- Responsive design for mobile devices
- Optimized Docker images

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB connection string
   - Ensure MongoDB is running

2. **OpenRouter API Errors**
   - Verify your API key is correct
   - Check API key permissions

3. **Port Conflicts**
   - Ensure ports 3000 and 5001 are available
   - Check for other running services

4. **Docker Issues**
   - Clear Docker cache: `docker system prune`
   - Rebuild containers: `docker-compose build --no-cache`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request



---

**Course Buddy** - Making course selection easier for SFSU CS students! 🎓✨
