const express = require('express');
const app = express();
const connectDb = require('./config/db');
const auth = require('./routes/api/auth');
const posts = require('./routes/api/posts');
const users = require('./routes/api/users');
const checkPost = require('./utils/checkPost');

// Connection to DB
connectDb();

// Init Middleware
app.use(express.json({ extended: false }));

// User-defined Routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/posts', posts);
app.use('/api/v1/users', users);

// Test Route
app.get('/', async (req, res) => {
  const result = await checkPost('how can someone be this dumb!!');
  console.log(result);
  res.send('<h1>Hello</h1>');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server hosted at: http://localhost:${PORT}`);
});
