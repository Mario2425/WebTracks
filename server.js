const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SUNO_API_KEY = process.env.SUNO_API_KEY;

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

        if (!SUNO_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'Suno AI API key not configured. Please add your API key to the .env file.' 
            });
        }

        console.log('Generating sound effect with Suno AI:', prompt, 'Duration:', duration);

        try {
            // Try calling Suno AI API
            const sunoResponse = await callSunoAPI({
                prompt: prompt,
                make_instrumental: true,
                duration: duration || 10,
                tags: 'sound effect, sfx'
            });

            res.json({
                success: true,
                message: 'Sound effect generated successfully',
                audioUrl: sunoResponse.audio_url,
                id: sunoResponse.id,
                prompt: prompt,
                duration: duration,
                status: sunoResponse.status,
                demo: false
            });
        } catch (apiError) {
            // Fallback to demo mode if API fails
            console.log('Suno API unavailable, using demo mode');
            const demoId = `demo-${Date.now()}`;
            res.json({
                success: true,
                message: 'Demo mode: API key may be invalid. Please check your Suno AI API credentials.',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                id: demoId,
                prompt: prompt,
                duration: duration,
                status: 'demo',
                demo: true,
                error_details: apiError.message
            });
        }

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
        const { prompt, genre, mood, tempo, duration, make_instrumental } = req.body;

        if (!prompt && (!genre || !mood)) {
            return res.status(400).json({ error: 'Prompt or genre and mood are required' });
        }

        // Build prompt from parameters if not provided
        let finalPrompt = prompt;
        if (!finalPrompt && genre && mood) {
            finalPrompt = `A ${mood.toLowerCase()} ${genre.toLowerCase()} music track`;
            if (tempo) {
                finalPrompt += ` at ${tempo} BPM`;
            }
        }

        console.log('Generating music with Suno AI:', finalPrompt);

        if (!SUNO_API_KEY) {
            // Return demo mode response if no API key
            const demoId = `demo-${Date.now()}`;
            return res.json({ 
                success: true,
                message: 'Demo mode: Suno AI API key not configured. Add your key to .env file.',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
                id: demoId,
                prompt: finalPrompt,
                parameters: { genre, mood, tempo, duration },
                status: 'demo',
                demo: true
            });
        }

        try {
            // Try calling Suno AI API
            const sunoResponse = await callSunoAPI({
                prompt: finalPrompt,
                make_instrumental: make_instrumental !== false,
                duration: duration || 30,
                tags: genre ? `${genre}, ${mood}` : undefined
            });

            res.json({
                success: true,
                message: 'Music generated successfully with Suno AI',
                audioUrl: sunoResponse.audio_url,
                id: sunoResponse.id,
                prompt: finalPrompt,
                parameters: { genre, mood, tempo, duration },
                status: sunoResponse.status,
                demo: false
            });
        } catch (apiError) {
            // Fallback to demo mode if API fails
            console.log('Suno API error:', apiError.message);
            console.log('Falling back to demo mode');
            const demoId = `demo-${Date.now()}`;
            res.json({
                success: true,
                message: '⚠️ Demo Mode: Your Suno AI API key appears to be invalid or the service is unavailable. Playing demo audio instead.',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
                id: demoId,
                prompt: finalPrompt,
                parameters: { genre, mood, tempo, duration },
                status: 'demo',
                demo: true,
                error_details: 'API Error: ' + apiError.message
            });
        }

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
        uptime: process.uptime(),
        sunoApiConfigured: !!SUNO_API_KEY
    });
});

// Helper function to call Suno AI API
async function callSunoAPI(params) {
    return new Promise((resolve, reject) => {
        const requestData = JSON.stringify({
            prompt: params.prompt,
            make_instrumental: params.make_instrumental || false,
            wait_audio: false
        });

        const options = {
            hostname: 'api.sunoaiapi.com',
            path: '/api/v1/gateway/generate/music',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': SUNO_API_KEY,
                'Content-Length': Buffer.byteLength(requestData)
            }
        };

        console.log('Calling Suno API with:', options.hostname + options.path);

        const apiReq = https.request(options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                console.log('Suno API Response Status:', apiRes.statusCode);
                console.log('Suno API Response:', data.substring(0, 500));
                
                try {
                    const response = JSON.parse(data);
                    
                    if (apiRes.statusCode === 200 || apiRes.statusCode === 201) {
                        // Suno API returns task ID that we need to poll
                        resolve({
                            id: response.data?.task_id || response.task_id || response.id,
                            audio_url: response.data?.audio_url || null,
                            video_url: response.data?.video_url || null,
                            status: response.data?.status || 'processing',
                            metadata: response.data || {}
                        });
                    } else {
                        reject(new Error(`Suno API error (${apiRes.statusCode}): ${response.error || response.message || data}`));
                    }
                } catch (error) {
                    console.error('Failed to parse response:', data.substring(0, 200));
                    reject(new Error(`Failed to parse Suno API response: ${error.message}`));
                }
            });
        });

        apiReq.on('error', (error) => {
            reject(new Error(`Suno API request failed: ${error.message}`));
        });

        apiReq.write(requestData);
        apiReq.end();
    });
}

// API endpoint to check generation status
app.get('/api/generation-status/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!SUNO_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'Suno AI API key not configured' 
            });
        }

        const options = {
            hostname: 'api.sunoaiapi.com',
            path: `/api/v1/gateway/query?ids=${id}`,
            method: 'GET',
            headers: {
                'api-key': SUNO_API_KEY
            }
        };

        https.get(options, (apiRes) => {
            let data = '';

            apiRes.on('data', (chunk) => {
                data += chunk;
            });

            apiRes.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    const taskData = response.data?.[0] || response[0] || response.data || response;
                    
                    res.json({
                        success: true,
                        status: taskData.status,
                        audio_url: taskData.audio_url,
                        video_url: taskData.video_url,
                        metadata: taskData
                    });
                } catch (error) {
                    console.error('Failed to parse status response:', data.substring(0, 200));
                    res.status(500).json({
                        success: false,
                        error: 'Failed to parse status response',
                        details: error.message
                    });
                }
            });
        }).on('error', (error) => {
            res.status(500).json({
                success: false,
                error: 'Failed to check generation status',
                details: error.message
            });
        });

    } catch (error) {
        console.error('Error checking generation status:', error);
        res.status(500).json({
            success: false,
            error: 'Error checking generation status',
            details: error.message
        });
    }
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
