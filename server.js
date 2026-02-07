const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /mp3|wav|ogg|m4a|flac/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
});

// Routes

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint for stem splitting
app.post('/api/stem-split', upload.single('audioFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing file:', req.file.filename);

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // In a real implementation, you would use Demucs, Spleeter, or similar
        // For now, we'll return mock data
        const stems = {
            vocals: `/uploads/stems/${req.file.filename}-vocals.wav`,
            drums: `/uploads/stems/${req.file.filename}-drums.wav`,
            bass: `/uploads/stems/${req.file.filename}-bass.wav`,
            other: `/uploads/stems/${req.file.filename}-other.wav`
        };

        res.json({
            success: true,
            message: 'Audio file processed successfully',
            stems: stems,
            originalFile: req.file.filename
        });

    } catch (error) {
        console.error('Error processing audio:', error);
        res.status(500).json({
            success: false,
            error: 'Error processing audio file',
            details: error.message
        });
    }
});

// API endpoint for generating sound effects
app.post('/api/generate-sfx', async (req, res) => {
    try {
        const { prompt, duration } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Generating sound effect:', prompt, 'Duration:', duration);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // In a real implementation, this would call SunoAI or similar API
        const audioUrl = `/uploads/generated/sfx-${Date.now()}.wav`;

        res.json({
            success: true,
            message: 'Sound effect generated successfully',
            audioUrl: audioUrl,
            prompt: prompt,
            duration: duration
        });

    } catch (error) {
        console.error('Error generating sound effect:', error);
        res.status(500).json({
            success: false,
            error: 'Error generating sound effect',
            details: error.message
        });
    }
});

// API endpoint for generating music
app.post('/api/generate-music', async (req, res) => {
    try {
        const { genre, mood, tempo, duration } = req.body;

        if (!genre || !mood) {
            return res.status(400).json({ error: 'Genre and mood are required' });
        }

        console.log('Generating music:', { genre, mood, tempo, duration });

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 5000));

        // In a real implementation, this would call SunoAI, MusicGen, or similar API
        const audioUrl = `/uploads/generated/music-${Date.now()}.wav`;

        res.json({
            success: true,
            message: 'Music generated successfully',
            audioUrl: audioUrl,
            parameters: { genre, mood, tempo, duration }
        });

    } catch (error) {
        console.error('Error generating music:', error);
        res.status(500).json({
            success: false,
            error: 'Error generating music',
            details: error.message
        });
    }
});

// API endpoint for saving projects
app.post('/api/save-project', express.json({ limit: '10mb' }), async (req, res) => {
    try {
        const { projectName, projectData } = req.body;

        if (!projectName || !projectData) {
            return res.status(400).json({ error: 'Project name and data are required' });
        }

        const projectsDir = path.join(__dirname, 'projects');
        if (!fs.existsSync(projectsDir)) {
            fs.mkdirSync(projectsDir, { recursive: true });
        }

        const filename = `${projectName}-${Date.now()}.json`;
        const filepath = path.join(projectsDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(projectData, null, 2));

        res.json({
            success: true,
            message: 'Project saved successfully',
            filename: filename
        });

    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({
            success: false,
            error: 'Error saving project',
            details: error.message
        });
    }
});

// API endpoint to load a project
app.get('/api/projects', (req, res) => {
    try {
        const projectsDir = path.join(__dirname, 'projects');
        
        if (!fs.existsSync(projectsDir)) {
            return res.json({ success: true, projects: [] });
        }

        const files = fs.readdirSync(projectsDir);
        const projects = files
            .filter(file => file.endsWith('.json'))
            .map(file => ({
                name: file,
                path: `/projects/${file}`,
                modified: fs.statSync(path.join(projectsDir, file)).mtime
            }));

        res.json({ success: true, projects });

    } catch (error) {
        console.error('Error loading projects:', error);
        res.status(500).json({
            success: false,
            error: 'Error loading projects',
            details: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong!',
        details: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎵 ForgeAI Music Server is running on http://localhost:${PORT}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
