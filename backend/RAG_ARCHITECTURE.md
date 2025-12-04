# RAG Pipeline Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Course Buddy RAG System                      │
│                      (Hybrid Architecture)                       │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │  Data Layer  │
│  (React)     │────────▶│  (Express)   │────────▶│              │
│              │         │              │         │              │
│  Chat.js     │         │ chatQuery()  │         │  MongoDB     │
│              │         │              │         │  Pinecone    │
│              │◀────────│              │◀────────│  OpenAI      │
└──────────────┘         └──────────────┘         └──────────────┘
```

## Data Flow

### 1. User Asks Question
```
User: "Tell me about Professor Timothy Sun's teaching style"
  ↓
Frontend sends to: POST /api/chat/query
```

### 2. Backend Processing (Hybrid Approach)

```
┌─────────────────────────────────────────────────────────┐
│              Backend chatQuery Function                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step A: Fetch Structured Data                          │
│  ┌────────────────────────────────┐                     │
│  │ MongoDB.find()                 │                     │
│  │ • All Courses (prerequisites)  │                     │
│  │ • All Professors (ratings)     │                     │
│  └────────────────────────────────┘                     │
│                                                          │
│  Step B: RAG Query (Vector Search)                      │
│  ┌────────────────────────────────┐                     │
│  │ 1. Embed question (OpenAI)     │                     │
│  │ 2. Search Pinecone (semantic)  │                     │
│  │ 3. Return top 5 reviews        │                     │
│  └────────────────────────────────┘                     │
│                                                          │
│  Step C: Combine Contexts                               │
│  ┌────────────────────────────────┐                     │
│  │ • Structured data → JSON       │                     │
│  │ • Reviews → Natural language   │                     │
│  │ • Merge into single prompt     │                     │
│  └────────────────────────────────┘                     │
│                                                          │
│  Step D: Generate Response                              │
│  ┌────────────────────────────────┐                     │
│  │ OpenAI GPT-3.5-turbo           │                     │
│  │ (with hybrid context)          │                     │
│  └────────────────────────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3. Response Sent Back
```
{
  "answer": "Based on student reviews, Professor Timothy Sun...",
  "sources": {
    "reviewsUsed": 5,
    "coursesAvailable": 56,
    "professorsAvailable": 21
  }
}
```

## Component Details

### 📁 professor_reviews.json
```json
{
  "reviews": [
    {
      "id": "review_001",
      "professor_name": "Timothy Sun",
      "course": "CSC 510",
      "review_text": "Student review text..."
    }
  ]
}
```

### 🔧 ragService.js
```javascript
// Main Functions:
- generateEmbedding(text)     // OpenAI embedding
- queryReviews(question)       // Pinecone search
- ragQuery(question)           // Complete RAG flow
```

### 📊 Pinecone Vector Database
```
Index: course-buddy-reviews
├── Vectors: 1536 dimensions (OpenAI embeddings)
├── Metadata: professor_name, course, review_text
└── Metric: Cosine similarity
```

### 🗄️ MongoDB (Existing)
```
Collections:
├── courses (prerequisites, descriptions)
└── professors (ratings, difficulty, courses)
```

### 🤖 LLM Services Used
```
1. OpenAI: text-embedding-3-small
   - Purpose: Generate embeddings for reviews & queries
   - Output: 1536-dimensional vectors
   - Cost: ~$0.00002 per 1K tokens (very cheap!)

2. OpenRouter: gpt-3.5-turbo
   - Purpose: Generate natural language responses
   - Input: Hybrid context (structured + reviews)
   - Uses your existing OpenRouter setup
```

## Why This Architecture?

### ✅ Advantages

1. **Best of Both Worlds**
   - Structured data: Precise (prerequisites, ratings)
   - Reviews: Natural, contextual insights

2. **Semantic Search**
   - "teaching style" matches reviews about "explanations" and "lectures"
   - Not limited to exact keyword matching

3. **Scalable**
   - Add reviews without changing code
   - Pinecone handles millions of vectors

4. **Maintainable**
   - Simple JSON format for reviews
   - Clear separation of concerns

### 🔄 Data Update Flow

```
1. Add review to professor_reviews.json
         ↓
2. Run: npm run index-reviews
         ↓
3. Script generates embedding
         ↓
4. Uploads to Pinecone
         ↓
5. Immediately available for queries
```

## Performance

- **Embedding Generation**: ~100ms per text
- **Pinecone Query**: <50ms for top-K search
- **MongoDB Query**: ~20ms for all courses/professors
- **GPT-3.5 Response**: ~1-2 seconds
- **Total Response Time**: ~2-3 seconds

## Security

- ✅ Protected routes (JWT authentication)
- ✅ API keys in environment variables
- ✅ Rate limiting via OpenAI/Pinecone
- ✅ No sensitive data in vector metadata

## Monitoring Points

1. **Backend Logs**
   ```
   RAG query returned X relevant reviews
   Loaded Y courses and Z professors
   ```

2. **Frontend Console**
   ```javascript
   Response sources: {reviewsUsed: 5, ...}
   ```

3. **Pinecone Dashboard**
   - Total vectors count
   - Query performance
   - Storage usage
