require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('../services/ragService');

/**
 * Index all professor reviews into Pinecone
 */
const indexReviews = async () => {
    try {
        console.log('=== Starting Review Indexing Process ===\n');
        
        // Read reviews from JSON file
        const reviewsPath = path.join(__dirname, '../data/professor_reviews.json');
        const reviewsData = await fs.readFile(reviewsPath, 'utf-8');
        const { reviews } = JSON.parse(reviewsData);
        
        console.log(`Loaded ${reviews.length} reviews from professor_reviews.json\n`);
        
        // Initialize Pinecone
        console.log('Initializing Pinecone...');
        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        const indexName = process.env.PINECONE_INDEX_NAME;
        const index = pinecone.index(indexName);
        console.log(`Connected to Pinecone index: ${indexName}\n`);
        
        // Process reviews in batches
        const batchSize = 10;
        const vectors = [];
        
        for (let i = 0; i < reviews.length; i++) {
            const review = reviews[i];
            
            console.log(`Processing review ${i + 1}/${reviews.length}: ${review.id}`);
            console.log(`  Professor: ${review.professor_name}, Course: ${review.course}`);
            
            try {
                // Create text to embed (combine all relevant fields)
                const textToEmbed = `Professor: ${review.professor_name}\nCourse: ${review.course}\nReview: ${review.review_text}`;
                
                // Generate embedding
                const embedding = await generateEmbedding(textToEmbed);
                
                // Prepare vector for Pinecone
                vectors.push({
                    id: review.id,
                    values: embedding,
                    metadata: {
                        professor_name: review.professor_name,
                        course: review.course,
                        review_text: review.review_text
                    }
                });
                
                console.log(`  ✓ Embedding generated (dimension: ${embedding.length})\n`);
                
                // If we've reached batch size or it's the last review, upsert to Pinecone
                if (vectors.length >= batchSize || i === reviews.length - 1) {
                    console.log(`Upserting batch of ${vectors.length} vectors to Pinecone...`);
                    await index.upsert(vectors);
                    console.log(`✓ Batch upserted successfully\n`);
                    vectors.length = 0; // Clear the batch
                }
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`  ✗ Error processing review ${review.id}:`, error.message);
            }
        }
        
        console.log('=== Indexing Complete ===');
        console.log(`Successfully indexed ${reviews.length} reviews into Pinecone`);
        
        // Get index stats
        const stats = await index.describeIndexStats();
        console.log('\nIndex Statistics:');
        console.log(`  Total vectors: ${stats.totalRecordCount || 0}`);
        console.log(`  Dimension: ${stats.dimension || 0}`);
        
    } catch (error) {
        console.error('=== Indexing Failed ===');
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

// Run the indexing
indexReviews()
    .then(() => {
        console.log('\n✓ Indexing script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n✗ Indexing script failed:', error);
        process.exit(1);
    });

