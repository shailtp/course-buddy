require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Professor = require('../models/Professor');
const Course = require('../models/Course');

console.log('=== MongoDB Connection Test ===');
console.log('Connecting to MongoDB...');
console.log('MongoDB URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('Connected to MongoDB successfully!');

  try {
    // Count professors
    const professorCount = await Professor.countDocuments();
    console.log(`Found ${professorCount} professors in the database`);

    // Sample professors
    if (professorCount > 0) {
      const professors = await Professor.find().limit(3).lean();
      console.log('Sample professors:');
      professors.forEach(prof => {
        console.log(`- ${prof.name} (ID: ${prof._id})`);
        console.log(`  Overall quality: ${prof.overall_quality}, Would take again: ${prof.would_take_again}%, Difficulty: ${prof.difficulty}`);
        console.log(`  RMP link: ${prof.rmp_link || 'N/A'}`);
      });
    }

    // Count courses
    const courseCount = await Course.countDocuments();
    console.log(`Found ${courseCount} courses in the database`);

    // Sample courses
    if (courseCount > 0) {
      const courses = await Course.find().limit(3).lean();
      console.log('Sample courses:');
      courses.forEach(course => {
        console.log(`- ${course.course_number}: ${course.course_title}`);
        console.log(`  Prerequisites: ${course.prerequisites || 'None'}`);
        console.log(`  Professor count: ${course.professors ? course.professors.length : 0}`);
      });

      // Test course-professor relationship
      if (courses[0] && courses[0].professors && courses[0].professors.length > 0) {
        const courseWithProfs = await Course.findById(courses[0]._id).lean();
        const profId = courseWithProfs.professors[0];
        const professor = await Professor.findById(profId).lean();
        
        console.log('\nTesting course-professor relationship:');
        console.log(`Course: ${courseWithProfs.course_number} (${courseWithProfs.course_title})`);
        console.log(`First professor ID: ${profId}`);
        if (professor) {
          console.log(`Found professor: ${professor.name}`);
          console.log(`Professor details: Rating=${professor.overall_quality}, Would take again=${professor.would_take_again}%`);
        } else {
          console.log('ERROR: Professor not found with this ID');
        }
      }
    }
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
})
.catch(err => {
  console.error('Failed to connect to MongoDB:', err);
}); 