const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config()

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET_KEY;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true
}));

app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  let userType;
  if (username === 'type1') {
    userType = 'type_1';
  } else {
    userType = 'type_2';
  }

  const token = jwt.sign({ user_type: userType }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600000 
  });

  res.json({ 
    message: 'Authentication successful',
    user_type: userType,
    token: token
  });
});

app.get('/profile', (req, res) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userType = decoded.user_type === 'type_1' ? 1 : 2;
    
    res.json({ user_type: userType });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;