const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB for Web Scraping...");
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Load Mongoose Models
const Professor = require('../models/Professor');

// Define the URL and Selectors
const RMP_BASE_URL = 'https://www.ratemyprofessors.com';
const SFSU_URL = `${RMP_BASE_URL}/search/teachers?query=Computer%20Science&sid=U2Nob29sLTEyNTI=`;

// Main Scraping Function
const scrapeProfessors = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(SFSU_URL, { waitUntil: 'networkidle2' });

    // Wait for professors list to load
    await page.waitForSelector('.Card__StyledCard-sy7w8r-0');

    // Extract Professor Links
    const professorLinks = await page.$$eval('.Card__StyledCard-sy7w8r-0 a', links =>
        links.map(link => link.href)
    );

    console.log("Found Professor Links:", professorLinks);

    for (const link of professorLinks) {
        await page.goto(link, { waitUntil: 'networkidle2' });

        // Extract Professor Information
        const professorData = await page.evaluate(() => {
            const name = document.querySelector('h1').innerText;
            const rating = document.querySelector('.RatingValue__Numerator-qw8sqy-2').innerText;
            const difficulty = document.querySelector('.Difficulty__StyledDifficultyRating-sc-1iq7b3s-1').innerText;

            return {
                name,
                average_rating: parseFloat(rating),
                difficulty: parseFloat(difficulty)
            };
        });

        console.log("Scraped Data:", professorData);

        // Save to MongoDB
        const existingProfessor = await Professor.findOne({ name: professorData.name });

        if (existingProfessor) {
            existingProfessor.average_rating = professorData.average_rating;
            existingProfessor.difficulty = professorData.difficulty;
            await existingProfessor.save();
        } else {
            const newProfessor = new Professor({
                name: professorData.name,
                average_rating: professorData.average_rating,
                difficulty: professorData.difficulty
            });
            await newProfessor.save();
        }
    }

    await browser.close();
    console.log("Web Scraping Completed and Data Saved to MongoDB");
};

// Connect to DB and Start Scraping
connectDB().then(() => {
    scrapeProfessors().catch(console.error);
});
