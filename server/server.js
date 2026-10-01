require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const seed = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/media', require('./routes/media'));
app.get('/api/health', (req, res) => res.json({ ok: true }));

async function connectDb() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/media_portal';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB');
  } catch {
    console.log('MongoDB not found -> starting a built-in temporary database (first run downloads it, please wait)...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    await mongoose.connect(mem.getUri());
    console.log('Using temporary in-memory database (data resets when the server restarts)');
  }
}

connectDb()
  .then(seed)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('API running on port ' + (process.env.PORT || 5000))))
  .catch(err => { console.error('Startup failed:', err); process.exit(1); });
