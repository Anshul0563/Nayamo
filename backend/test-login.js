const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find().select('+password').limit(5);
    console.log('=== USERS IN DB ===');
    users.forEach(u => {
      console.log('Email:', u.email, '| Role:', u.role, '| Active:', u.isActive, '| Has comparePassword:', typeof u.comparePassword);
    });
    
    if (users.length > 0) {
      const admin = users.find(u => u.role === 'admin');
      if (admin) {
        console.log('\nAdmin found:', admin.email);
        const wrong = await admin.comparePassword('wrongpassword');
        console.log('Wrong password test:', wrong);
      } else {
        console.log('\nNo admin user found!');
      }
    } else {
      console.log('No users found! Run: node seedAdmin.js');
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}
test();
