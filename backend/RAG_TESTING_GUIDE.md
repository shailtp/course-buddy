# RAG Pipeline Testing Guide

## Prerequisites

Before testing, make sure you have:

1. **Environment Variables Set** (in `backend/.env`):
   ```bash
   # For embeddings
   OPENAI_API_KEY=your_openai_api_key
   
   # For vector database
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=course-buddy-reviews
   
   # For chat (you already have this!)
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

2. **Pinecone Index Created**:
   - Go to https://app.pinecone.io/
   - Create a new index with:
     - Name: `course-buddy-reviews`
     - Dimensions: `1536`
     - Metric: `cosine`

## Step 1: Index Reviews into Pinecone

Run the indexing script to embed and store all reviews:

```bash
cd backend
npm run index-reviews
```

**Expected Output:**
```
=== Starting Review Indexing Process ===

Loaded 13 reviews from professor_reviews.json

Initializing Pinecone...
Connected to Pinecone index: course-buddy-reviews

Processing review 1/13: review_001
  Professor: Timothy Sun, Course: CSC 510
  ✓ Embedding generated (dimension: 1536)

... (continues for all reviews)

Upserting batch of 10 vectors to Pinecone...
✓ Batch upserted successfully

=== Indexing Complete ===
Successfully indexed 13 reviews into Pinecone

Index Statistics:
  Total vectors: 13
  Dimension: 1536

✓ Indexing script completed successfully
```

## Step 2: Start the Backend Server

```bash
cd backend
npm run dev
```

The server should start on `http://localhost:5001`

## Step 3: Start the Frontend

In a new terminal:

```bash
cd frontend
npm start
```

The app should open at `http://localhost:3000`

## Step 4: Test the RAG System

### Login and Navigate to Chat
1. Login to your account
2. Navigate to the Chat page (Course Buddy GPT)

### Test Queries

Try these queries to test the RAG system:

#### 1. Professor-Specific Queries (Should retrieve Timothy Sun reviews)
```
Tell me about Professor Timothy Sun's teaching style
```

**Expected**: The response should include information from student reviews like:
- "breaks everything down to school level concepts"
- "helpful on homework"
- "practice exams are similar to actual tests"

#### 2. Course-Specific Queries (Should retrieve CSC 510 reviews)
```
What do students say about CSC 510?
```

**Expected**: Should mention:
- 6 homework assignments
- Midterm and final structure
- Difficulty level
- Student experiences

#### 3. Professor Comparison (Should retrieve Jingyi Wang reviews)
```
How is Professor Jingyi Wang's teaching?
```

**Expected**: Should include mixed reviews about:
- Clear lectures
- Fast teaching pace
- Availability
- Difficulty

#### 4. Course Recommendation Query (Hybrid - structured + reviews)
```
Recommend me 2 easy upper-division electives I can take next semester
```

**Expected**: Should use both:
- Structured course data (prerequisites, course numbers)
- Student reviews (difficulty mentions, recommendations)

#### 5. Specific Course Query (Should retrieve CSC 256 reviews)
```
What are students saying about CSC 256?
```

**Expected**: Should reference student comments about the course

## Debugging

### Check if Reviews are in Pinecone

You can verify in the Pinecone dashboard:
1. Go to https://app.pinecone.io/
2. Select your index `course-buddy-reviews`
3. Check "Records" count should be 13

### Backend Logs

Watch the backend console for RAG activity:
- `RAG query returned X relevant reviews` - Shows how many reviews matched
- Check the sources in the response for debugging

### Frontend Console

Open browser DevTools console to see:
- `Response sources: {reviewsUsed: X, coursesAvailable: Y, professorsAvailable: Z}`

## Common Issues

### Issue: "Failed to get a response"
**Solution**: Check that:
- OPENAI_API_KEY is set correctly
- Backend server is running
- You're logged in (token is valid)

### Issue: "No relevant reviews found"
**Solution**: 
- Verify indexing completed successfully
- Check Pinecone dashboard shows 13 vectors
- Try a more specific query about Timothy Sun or Jingyi Wang

### Issue: "Error initializing Pinecone"
**Solution**:
- Verify PINECONE_API_KEY is correct
- Verify index name matches: `course-buddy-reviews`
- Check index is created with dimension 1536

## Success Criteria

The RAG system is working correctly if:

1. ✅ All 13 reviews indexed successfully
2. ✅ Queries about "Timothy Sun" return his reviews
3. ✅ Queries about "CSC 510" return relevant course reviews
4. ✅ Responses combine structured data + student reviews (hybrid)
5. ✅ Chat maintains conversation history
6. ✅ Backend logs show `RAG query returned X relevant reviews`

## Next Steps

After successful testing:
1. Add more professor reviews to `professor_reviews.json`
2. Run `npm run index-reviews` again to update Pinecone
3. Test with new professors/courses
4. Fine-tune the number of reviews retrieved (topK parameter)
5. Adjust the LLM temperature/max_tokens for better responses

