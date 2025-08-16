const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Scooby:OgzjHRCxtXE9wHC3@tourist.z0kko6u.mongodb.net/?retryWrites=true&w=majority&appName=Tourist';

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');

    // Test users data
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'guide@example.com',
        password: 'password123',
        role: 'Guide',
        specialization: 'Mountain Hiking',
        experience: 5
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'tourist@example.com',
        password: 'password123',
        role: 'Tourist',
        nationality: 'USA',
        preferences: ['Adventure', 'Culture']
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'provider@example.com',
        password: 'password123',
        role: 'ServiceProvider',
        businessName: 'Mike\'s Travel Services',
        serviceType: 'Transportation'
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'guide2@example.com',
        password: 'password123',
        role: 'Guide',
        specialization: 'City Tours',
        experience: 3
      },
      {
        firstName: 'Bob',
        lastName: 'Davis',
        email: 'tourist2@example.com',
        password: 'password123',
        role: 'Tourist',
        nationality: 'Canada',
        preferences: ['Nature', 'Photography']
      }
    ];

    // Create users if they don't exist
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('Test users creation completed');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
