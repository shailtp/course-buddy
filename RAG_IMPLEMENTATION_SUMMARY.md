# RAG Pipeline Implementation Summary

This Course Buddy application now has a **Hybrid RAG (Retrieval-Augmented Generation) Pipeline** that combines:
1. **Structured Data**: Course prerequisites, descriptions, and professor ratings from MongoDB
2. **Natural Language Reviews**: Student reviews from RateMyProfessors via Pinecone vector search

## What Was Built

### 1. Data Structure
- **File**: `backend/data/professor_reviews.json`
- **Format**: Simplified JSON with only essential fields (id, professor_name, course, review_text)
- **Current Data**: 13 reviews for 2 professors (Timothy Sun, Jingyi Wang)

### 2. RAG Service (`backend/services/ragService.js`)
- OpenAI text-embedding-3-small for generating embeddings
- Pinecone integration for vector storage and similarity search
- `ragQuery()` function that retrieves top-K relevant reviews for any question

### 3. Indexing Script (`backend/scripts/indexReviews.js`)
- Reads professor_reviews.json
- Generates embeddings for each review
- Uploads to Pinecone with metadata
- **Run with**: `npm run index-reviews`

### 4. Backend API Endpoint
- **Route**: `POST /api/chat/query`
- **Controller**: `chatQuery()` in recommendationController.js
- **Features**:
  - Fetches structured data (courses/professors from MongoDB)
  - Performs RAG query (retrieves relevant student reviews)
  - Combines both contexts for LLM
  - Uses OpenAI GPT-3.5-turbo for responses

### 5. Frontend Integration (`frontend/src/pages/Chat.js`)
- Updated to call backend `/api/chat/query` endpoint
- Removed direct OpenRouter calls
- Backend now handles all context (hybrid approach)
- Maintains conversation history

### 6. Helper Tools
- **Add Review Script**: `npm run add-review` - Interactive CLI to add reviews
- **Setup Guide**: `backend/RAG_SETUP.md` - Environment setup instructions
- **Testing Guide**: `backend/RAG_TESTING_GUIDE.md` - Comprehensive testing steps

## Files Created/Modified

### New Files Created
```
backend/
├── data/
│   └── professor_reviews.json          ✅ Review data in Natural Lang.
├── services/
│   └── ragService.js                   ✅ RAG service with Pinecone
├── scripts/
│   ├── indexReviews.js                 ✅ Index reviews to Pinecone
│   └── addReview.js                    ✅ CLI tool to add new reviews
├── RAG_SETUP.md                        ✅ Setup instructions
└── RAG_TESTING_GUIDE.md                ✅ Testing guide
```

### Modified Files
```
backend/
├── controllers/recommendationController.js   ✅ Added chatQuery endpoint
├── routes/recommendationRoutes.js            ✅ Added /chat/query route
└── package.json                              ✅ Added scripts + Pinecone dependency

frontend/
└── src/pages/Chat.js                         ✅ Updated to use backend API
```

## Steps to Test

### 1. Setup Environment Variables
Add to `backend/.env`:
```bash
# For embeddings (RAG)
OPENAI_API_KEY=your_openai_api_key

# For vector database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=course-buddy-reviews

#LLM provider for chat
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Create Pinecone Index
- Go to https://app.pinecone.io/
- Create index: name=`course-buddy-reviews`, dimensions=`1536`, metric=`cosine`

### 3. Index Reviews
```bash
cd backend
npm run index-reviews
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Test the Chat
- Login to your account
- Go to Chat page
- Try queries like:
  - "Tell me about Professor Timothy Sun's teaching style"
  - "What students say about CSC 510 and the testing/assignment structure?"

## Architecture Flow

```
User Question
     ↓
Frontend (Chat.js)
     ↓
Backend API (/api/chat/query)
     ↓
     ├─→ MongoDB: Fetch courses + professors (structured data)
     ├─→ Pinecone: Vector search for relevant reviews (RAG)
     └─→ OpenAI: Combine contexts + generate response
     ↓
Response (with structured data + student reviews)
     ↓
Frontend Display
```

## Key Features

✅ **Hybrid Approach**: Combines structured DB data with natural language reviews  
✅ **Semantic Search**: Finds relevant reviews based on meaning, not keywords  
✅ **Context-Rich Responses**: LLM has access to both data types  
✅ **Scalable**: Easy to add more reviews (JSON format)  
✅ **Fast Retrieval**: Pinecone provides millisecond vector search  
✅ **Conversation History**: Maintains chat context  

## Adding More Reviews

### Method 1: Interactive CLI
```bash
npm run add-review
```

### Method 2: Manual JSON Edit
Edit `backend/data/professor_reviews.json`, add:
```json
{
  "id": "review_014",
  "professor_name": "New Professor",
  "course": "CSC XXX",
  "review_text": "Review text here..."
}
```

Then re-run: `npm run index-reviews`

## Monitoring and Debugging

- **Backend Logs**: Watch for "RAG query returned X relevant reviews"
- **Frontend Console**: Check `Response sources` for stats
- **Pinecone Dashboard**: Verify vector count and run queries

## Cost Considerations

- **OpenAI Embeddings**: ~$0.00002 per 1K tokens (text-embedding-3-small)
- **OpenAI Chat**: ~$0.0005 per 1K tokens (GPT-3.5-turbo)
- **Pinecone**: Free tier includes 100K vectors, sufficient for thousands of reviews

## Future Enhancements

- [ ] Implement review freshness (weight recent reviews higher)
- [ ] Add analytics on which reviews are retrieved most
- [ ] Cache frequent queries/chunks
- [ ] Implement user feedback on response quality

---

