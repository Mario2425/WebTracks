const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow only audio files
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/flac', 'audio/m4a'];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for stem splitting
app.post('/api/stem-split', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }
  
  // Placeholder for AI stem splitting logic
  // In a production environment, this would integrate with an AI model
  res.json({
    success: true,
    message: 'Audio file uploaded for stem splitting',
    filename: req.file.filename,
    stems: [
      { type: 'vocals', status: 'processing' },
      { type: 'drums', status: 'processing' },
      { type: 'bass', status: 'processing' },
      { type: 'other', status: 'processing' }
    ]
  });
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB' });
    }
    return res.status(400).json({ error: `Upload error: ${error.message}` });
  } else if (error) {
    return res.status(400).json({ error: error.message });
  }
  next();
});

// API endpoint for AI sound FX generation
app.post('/api/generate-sfx', (req, res) => {
  const { prompt, duration } = req.body;
  
  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Valid prompt is required' });
  }
  
  if (!duration || typeof duration !== 'number' || duration < 1 || duration > 30) {
    return res.status(400).json({ error: 'Duration must be between 1 and 30 seconds' });
  }
  
  if (prompt.length > 500) {
    return res.status(400).json({ error: 'Prompt must be less than 500 characters' });
  }
  
  // Placeholder for AI sound FX generation logic
  res.json({
    success: true,
    message: 'Sound FX generation started',
    prompt,
    duration,
    status: 'processing'
  });
});

// API endpoint for AI music generation
app.post('/api/generate-music', (req, res) => {
  const { genre, mood, tempo, duration } = req.body;
  
  // Input validation
  const validGenres = ['electronic', 'ambient', 'rock', 'jazz', 'classical', 'hip-hop', 'pop'];
  const validMoods = ['happy', 'sad', 'energetic', 'calm', 'dark', 'uplifting'];
  
  if (!genre || !validGenres.includes(genre.toLowerCase())) {
    return res.status(400).json({ error: 'Valid genre is required' });
  }
  
  if (!mood || !validMoods.includes(mood.toLowerCase())) {
    return res.status(400).json({ error: 'Valid mood is required' });
  }
  
  if (!tempo || typeof tempo !== 'number' || tempo < 60 || tempo > 180) {
    return res.status(400).json({ error: 'Tempo must be between 60 and 180 BPM' });
  }
  
  if (!duration || typeof duration !== 'number' || duration < 10 || duration > 300) {
    return res.status(400).json({ error: 'Duration must be between 10 and 300 seconds' });
  }
  
  // Placeholder for AI music generation logic
  res.json({
    success: true,
    message: 'Music generation started',
    parameters: { genre, mood, tempo, duration },
    status: 'processing'
  });
});

// API endpoint for saving project
app.post('/api/save-project', (req, res) => {
  const { projectData } = req.body;
  
  res.json({
    success: true,
    message: 'Project saved successfully',
    projectId: Date.now().toString()
  });
});

app.listen(PORT, () => {
  console.log(`ForgeAI-Music server running on port ${PORT}`);
});
