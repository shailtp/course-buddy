const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Initialize Pinecone client
let pineconeIndex = null;

const initializePinecone = async () => {
    if (pineconeIndex) return pineconeIndex;
    
    try {
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME);
        console.log('Pinecone initialized successfully');
        return pineconeIndex;
    } catch (error) {
        console.error('Error initializing Pinecone:', error);
        throw error;
    }
};

/**
 * Generate embedding for a text using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
const generateEmbedding = async (text) => {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

/**
 * Query Pinecone for relevant reviews based on user question
 * @param {string} question - User's question
 * @param {number} topK - Number of results to return (default: 5)
 * @returns {Promise<Array>} - Array of relevant reviews with metadata
 */
const queryReviews = async (question, topK = 5) => {
    try {
        const index = await initializePinecone();
        
        // Generate embedding for the question
        const queryEmbedding = await generateEmbedding(question);
        
        // Query Pinecone
        const queryResponse = await index.query({
            vector: queryEmbedding,
            topK: topK,
            includeMetadata: true
        });
        
        // Extract and format results
        const reviews = queryResponse.matches.map(match => ({
            id: match.id,
            score: match.score,
            professor_name: match.metadata.professor_name,
            course: match.metadata.course,
            review_text: match.metadata.review_text
        }));
        
        console.log(`Found ${reviews.length} relevant reviews for query: "${question}"`);
        return reviews;
        
    } catch (error) {
        console.error('Error querying reviews:', error);
        throw error;
    }
};

/**
 * Format retrieved reviews into context string for LLM
 * @param {Array} reviews - Array of review objects
 * @returns {string} - Formatted context string
 */
const generateContextFromReviews = (reviews) => {
    if (!reviews || reviews.length === 0) {
        return 'No relevant student reviews found.';
    }
    
    let context = 'Here are relevant student reviews from RateMyProfessors:\n\n';
    
    reviews.forEach((review, index) => {
        context += `Review ${index + 1} (${review.professor_name} - ${review.course}):\n`;
        context += `"${review.review_text}"\n\n`;
    });
    
    return context;
};

/**
 * Main RAG function: Query reviews and format for LLM
 * @param {string} question - User's question
 * @param {number} topK - Number of reviews to retrieve
 * @returns {Promise<Object>} - Object containing reviews and formatted context
 */
const ragQuery = async (question, topK = 5) => {
    try {
        const reviews = await queryReviews(question, topK);
        const context = generateContextFromReviews(reviews);
        
        return {
            reviews,
            context,
            hasResults: reviews.length > 0
        };
    } catch (error) {
        console.error('Error in RAG query:', error);
        return {
            reviews: [],
            context: 'Unable to retrieve student reviews at this time.',
            hasResults: false,
            error: error.message
        };
    }
};

module.exports = {
    initializePinecone,
    generateEmbedding,
    queryReviews,
    generateContextFromReviews,
    ragQuery
};

