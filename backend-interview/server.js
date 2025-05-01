const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/interview_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Response schema and model
const responseSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  response: String,
  sequence: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const Response = mongoose.model('Response', responseSchema);

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `interview-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// API Routes


app.post('/api/save-responses', async (req, res) => {
  try {
    const { response, sequence } = req.body;
    if (!response) {
      return res.status(400).json({ error: 'Response content is required' });
    }
    const newResponse = new Response({ response, sequence });
    await newResponse.save();
    res.status(201).json({ message: 'Response saved', id: newResponse.id });
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

app.post('/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    res.status(200).json({ message: 'Video uploaded successfully', filename: req.file.filename });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Start server
const PORT = 5200;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));