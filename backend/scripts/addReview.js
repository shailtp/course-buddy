const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Interactive CLI tool to add reviews to professor_reviews.json
 */
const addReview = async () => {
    try {
        console.log('\n=== Add New Professor Review ===\n');
        
        // Read existing reviews
        const reviewsPath = path.join(__dirname, '../data/professor_reviews.json');
        const reviewsData = await fs.readFile(reviewsPath, 'utf-8');
        const data = JSON.parse(reviewsData);
        
        // Get new review details
        const professorName = await question('Professor Name: ');
        const course = await question('Course (e.g., CSC 510): ');
        const reviewText = await question('Review Text: ');
        
        // Generate new ID
        const lastId = data.reviews.length > 0 
            ? parseInt(data.reviews[data.reviews.length - 1].id.split('_')[1]) 
            : 0;
        const newId = `review_${String(lastId + 1).padStart(3, '0')}`;
        
        // Create new review object
        const newReview = {
            id: newId,
            professor_name: professorName,
            course: course.toUpperCase(),
            review_text: reviewText
        };
        
        // Add to reviews array
        data.reviews.push(newReview);
        
        // Write back to file
        await fs.writeFile(reviewsPath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log('\n✓ Review added successfully!');
        console.log(`  ID: ${newId}`);
        console.log(`  Professor: ${professorName}`);
        console.log(`  Course: ${course.toUpperCase()}`);
        console.log(`\nTotal reviews: ${data.reviews.length}`);
        console.log('\nDon\'t forget to run "npm run index-reviews" to update Pinecone!\n');
        
    } catch (error) {
        console.error('Error adding review:', error.message);
    } finally {
        rl.close();
    }
};

// Run the script
addReview();

