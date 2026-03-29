const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create admin user (initial setup)
const setupAdmin = async () => {
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user created successfully');
    }
    
    // Create admission officer
    const officerExists = await User.findOne({ username: 'officer' });
    if (!officerExists) {
      const hashedPassword = await bcrypt.hash('officer123', 10);
      const officer = new User({
        username: 'officer',
        password: hashedPassword,
        role: 'admission_officer',
      });
      await officer.save();
      console.log('Admission officer created successfully');
    }
    
    // Create management user
    const managementExists = await User.findOne({ username: 'management' });
    if (!managementExists) {
      const hashedPassword = await bcrypt.hash('management123', 10);
      const management = new User({
        username: 'management',
        password: hashedPassword,
        role: 'management',
      });
      await management.save();
      console.log('Management user created successfully');
    }
  } catch (error) {
    console.error('Error setting up users:', error);
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username' });
    }
    
    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      'secretkey123',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login, setupAdmin };