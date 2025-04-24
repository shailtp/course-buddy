/**
 * Script to import course and professor data from Excel files to MongoDB
 * 
 * Usage:
 * node scripts/importData.js
 */

require('dotenv').config();
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import models
const Professor = require('../models/Professor');
const Course = require('../models/Course');

// MongoDB connection
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

// Import courses from Excel
async function importCourses(filePath) {
    try {
        console.log('Importing courses from:', filePath);
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // Clear existing courses (optional)
        await Course.deleteMany({});
        console.log('Cleared existing courses');
        
        let importCount = 0;
        
        for (const row of data) {
            // Skip header or empty rows
            if (!row['Course Number']) continue;
            
            try {
                const course = new Course({
                    course_number: row['Course Number'].trim(),
                    course_title: row['Course Title'].trim(),
                    prerequisites: row['Course Prerequisite'] || 'null',
                    description: row['Course Description'] || '',
                    professors: [] // Will be populated later
                });
                
                await course.save();
                importCount++;
                console.log(`Imported course: ${row['Course Number']} - ${row['Course Title']}`);
            } catch (err) {
                console.error(`Error importing course ${row['Course Number']}:`, err.message);
            }
        }
        
        console.log(`Successfully imported ${importCount} courses out of ${data.length}`);
    } catch (err) {
        console.error('Error importing courses:', err);
    }
}

// Import professors from Excel
async function importProfessors(filePath) {
    try {
        console.log('Importing professors from:', filePath);
        const workbook = xlsx.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);
        
        // Clear existing professors (optional)
        await Professor.deleteMany({});
        console.log('Cleared existing professors');
        
        let importCount = 0;
        
        for (const row of data) {
            // Skip header or empty rows
            if (!row['Professor Name']) continue;
            
            try {
                // Generate ID from name
                const profId = row['Professor Name'].toLowerCase().replace(/\s+/g, '_');
                
                // Parse courses offered
                const coursesOffered = row['UG Courses offered by professor'] 
                    ? row['UG Courses offered by professor'].split(',').map(c => c.trim())
                    : [];
                
                const professor = new Professor({
                    _id: profId,
                    name: row['Professor Name'],
                    courses_offered: coursesOffered,
                    overall_quality: parseFloat(row['Overall Quality out of 5'] || 0),
                    would_take_again: parseInt(row['% would take again'] || 0),
                    difficulty: parseFloat(row['Level of Difficulty out of 5'] || 0),
                    rmp_link: row['Link'] || ''
                });
                
                await professor.save();
                importCount++;
                console.log(`Imported professor: ${row['Professor Name']}`);
            } catch (err) {
                console.error(`Error importing professor ${row['Professor Name'] || 'unknown'}:`, err.message);
            }
        }
        
        console.log(`Successfully imported ${importCount} professors out of ${data.length}`);
    } catch (err) {
        console.error('Error importing professors:', err);
    }
}

// Link professors to courses
async function linkProfessorsToCourses() {
    try {
        console.log('Linking professors to courses...');
        const professors = await Professor.find({});
        let linkCount = 0;
        
        for (const professor of professors) {
            // For each course offered by the professor
            for (const courseNum of professor.courses_offered) {
                try {
                    // Find the course by course number
                    const course = await Course.findOne({ 
                        course_number: courseNum.trim() 
                    });
                    
                    if (course) {
                        // Add professor to course if not already there
                        if (!course.professors.includes(professor.name)) {
                            course.professors.push(professor.name);
                            await course.save();
                            linkCount++;
                            console.log(`Linked ${professor.name} to ${course.course_number}`);
                        }
                    } else {
                        console.log(`Course ${courseNum} not found for professor ${professor.name}`);
                    }
                } catch (err) {
                    console.error(`Error linking ${professor.name} to ${courseNum}:`, err.message);
                }
            }
        }
        
        console.log(`Successfully linked ${linkCount} professor-course relationships`);
    } catch (err) {
        console.error('Error linking professors to courses:', err);
    }
}

// Main function
async function main() {
    try {
        await connectDB();
        
        // Set paths to Excel files
        const courseFile = path.join(__dirname, '../data/course_list_csc.xlsx');
        const professorFile = path.join(__dirname, '../data/Professor_Rating.xlsx');
        
        // Check if files exist
        if (!fs.existsSync(courseFile)) {
            console.error(`Course file not found: ${courseFile}`);
            process.exit(1);
        }
        
        if (!fs.existsSync(professorFile)) {
            console.error(`Professor file not found: ${professorFile}`);
            process.exit(1);
        }
        
        // Import data
        await importCourses(courseFile);
        await importProfessors(professorFile);
        
        // Link professors to courses
        await linkProfessorsToCourses();
        
        console.log('Data import complete!');
        mongoose.connection.close();
    } catch (err) {
        console.error('Error in main function:', err);
        process.exit(1);
    }
}

// Run the import process
main(); 