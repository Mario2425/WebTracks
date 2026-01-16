// Navigation
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetSection = btn.getAttribute('data-section');
        
        // Update active states
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
    });
});

// DAW Controls
let isPlaying = false;
let currentTime = 0;
let trackCount = 2;

const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const recordBtn = document.getElementById('record-btn');
const masterVolume = document.getElementById('master-volume');
const volumeDisplay = document.getElementById('volume-display');
const tempoInput = document.getElementById('tempo');
const addTrackBtn = document.getElementById('add-track-btn');
const tracksList = document.getElementById('tracks-list');
const saveProjectBtn = document.getElementById('save-project-btn');
const exportBtn = document.getElementById('export-btn');

// Transport controls
playBtn.addEventListener('click', () => {
    isPlaying = true;
    playBtn.textContent = '⏸️ Pause';
    console.log('Playing...');
    animateTimeline();
});

pauseBtn.addEventListener('click', () => {
    isPlaying = false;
    playBtn.textContent = '▶️ Play';
    console.log('Paused');
});

stopBtn.addEventListener('click', () => {
    isPlaying = false;
    currentTime = 0;
    playBtn.textContent = '▶️ Play';
    console.log('Stopped');
    drawTimeline();
});

recordBtn.addEventListener('click', () => {
    console.log('Recording started...');
    alert('Recording feature will be available in the full version');
});

// Master volume control
masterVolume.addEventListener('input', (e) => {
    volumeDisplay.textContent = `${e.target.value}%`;
});

// Add track functionality
addTrackBtn.addEventListener('click', () => {
    trackCount++;
    const newTrack = createTrackElement(trackCount);
    tracksList.appendChild(newTrack);
    initializeTrackControls(newTrack);
});

function createTrackElement(trackNumber) {
    const track = document.createElement('div');
    track.className = 'track';
    track.setAttribute('data-track', trackNumber);
    track.innerHTML = `
        <div class="track-controls">
            <input type="text" class="track-name" value="Track ${trackNumber}" placeholder="Track name">
            <button class="btn-mute">M</button>
            <button class="btn-solo">S</button>
            <input type="range" class="track-volume" min="0" max="100" value="80">
        </div>
        <div class="track-waveform">
            <canvas width="700" height="80"></canvas>
        </div>
    `;
    return track;
}

function initializeTrackControls(track) {
    const muteBtn = track.querySelector('.btn-mute');
    const soloBtn = track.querySelector('.btn-solo');
    
    muteBtn.addEventListener('click', () => {
        muteBtn.classList.toggle('active');
    });
    
    soloBtn.addEventListener('click', () => {
        soloBtn.classList.toggle('active');
    });
}

// Initialize existing track controls
document.querySelectorAll('.track').forEach(track => {
    initializeTrackControls(track);
});

// Timeline drawing
const timelineCanvas = document.getElementById('timeline-canvas');
const timelineCtx = timelineCanvas.getContext('2d');

function drawTimeline() {
    timelineCtx.fillStyle = '#34495e';
    timelineCtx.fillRect(0, 0, timelineCanvas.width, timelineCanvas.height);
    
    // Draw time markers
    timelineCtx.strokeStyle = '#7f8c8d';
    timelineCtx.lineWidth = 1;
    
    for (let i = 0; i <= 10; i++) {
        const x = (timelineCanvas.width / 10) * i;
        timelineCtx.beginPath();
        timelineCtx.moveTo(x, 0);
        timelineCtx.lineTo(x, timelineCanvas.height);
        timelineCtx.stroke();
    }
    
    // Draw playhead
    const playheadX = (currentTime / 100) * timelineCanvas.width;
    timelineCtx.fillStyle = '#e74c3c';
    timelineCtx.fillRect(playheadX, 0, 2, timelineCanvas.height);
}

function animateTimeline() {
    if (!isPlaying) return;
    
    currentTime = (currentTime + 0.5) % 100;
    drawTimeline();
    requestAnimationFrame(animateTimeline);
}

drawTimeline();

// Draw waveforms for tracks
document.querySelectorAll('.track-waveform canvas').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw sample waveform
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x / 10) * Math.random() * 20;
        if (x === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
});

// Save project
saveProjectBtn.addEventListener('click', async () => {
    const projectData = {
        tracks: Array.from(document.querySelectorAll('.track')).map(track => ({
            name: track.querySelector('.track-name').value,
            volume: track.querySelector('.track-volume').value
        })),
        tempo: tempoInput.value,
        masterVolume: masterVolume.value
    };
    
    try {
        const response = await fetch('/api/save-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectData })
        });
        const result = await response.json();
        alert('Project saved successfully!');
    } catch (error) {
        alert('Error saving project');
        console.error(error);
    }
});

exportBtn.addEventListener('click', () => {
    alert('Export functionality will be available in the full version');
});

// AI Stem Splitting
const stemDropZone = document.getElementById('stem-drop-zone');
const stemFileInput = document.getElementById('stem-file-input');
const stemStatus = document.getElementById('stem-status');
const stemResults = document.getElementById('stem-results');

stemDropZone.addEventListener('click', () => {
    stemFileInput.click();
});

stemFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleStemFile(e.target.files[0]);
    }
});

stemDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    stemDropZone.classList.add('dragover');
});

stemDropZone.addEventListener('dragleave', () => {
    stemDropZone.classList.remove('dragover');
});

stemDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    stemDropZone.classList.remove('dragover');
    
    if (e.dataTransfer.files.length > 0) {
        handleStemFile(e.dataTransfer.files[0]);
    }
});

async function handleStemFile(file) {
    stemStatus.className = 'status-message processing';
    stemStatus.textContent = '🔄 Processing your audio file for stem separation...';
    
    const formData = new FormData();
    formData.append('audio', file);
    
    try {
        const response = await fetch('/api/stem-split', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            stemStatus.className = 'status-message success';
            stemStatus.textContent = '✅ Audio file uploaded successfully! Processing stems...';
            
            displayStemResults(result.stems);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        stemStatus.className = 'status-message error';
        stemStatus.textContent = '❌ Error processing file: ' + error.message;
    }
}

function displayStemResults(stems) {
    stemResults.innerHTML = '<h3>Separated Stems:</h3>';
    
    stems.forEach(stem => {
        const stemItem = document.createElement('div');
        stemItem.className = 'stem-item';
        stemItem.innerHTML = `
            <div>
                <h4>${stem.type}</h4>
                <p>Status: ${stem.status}</p>
            </div>
            <button class="btn-primary">Download</button>
        `;
        stemResults.appendChild(stemItem);
    });
}

// AI Generation Tabs
const aiTabBtns = document.querySelectorAll('.ai-tab-btn');
const aiTabContents = document.querySelectorAll('.ai-tab-content');

aiTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        aiTabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        aiTabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === `${targetTab}-tab`) {
                content.classList.add('active');
            }
        });
    });
});

// Sound FX Generation
const sfxForm = document.getElementById('sfx-form');
const sfxStatus = document.getElementById('sfx-status');

sfxForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const prompt = document.getElementById('sfx-prompt').value;
    const duration = document.getElementById('sfx-duration').value;
    
    sfxStatus.className = 'status-message processing';
    sfxStatus.textContent = '🎨 Generating sound effect...';
    
    try {
        const response = await fetch('/api/generate-sfx', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, duration })
        });
        
        const result = await response.json();
        
        if (result.success) {
            sfxStatus.className = 'status-message success';
            sfxStatus.textContent = `✅ Sound effect generation started! Prompt: "${prompt}"`;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        sfxStatus.className = 'status-message error';
        sfxStatus.textContent = '❌ Error generating sound effect: ' + error.message;
    }
});

// Music Generation
const musicForm = document.getElementById('music-form');
const musicStatus = document.getElementById('music-status');

musicForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const genre = document.getElementById('music-genre').value;
    const mood = document.getElementById('music-mood').value;
    const tempo = document.getElementById('music-tempo').value;
    const duration = document.getElementById('music-duration').value;
    
    musicStatus.className = 'status-message processing';
    musicStatus.textContent = '🎵 Generating music...';
    
    try {
        const response = await fetch('/api/generate-music', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genre, mood, tempo, duration })
        });
        
        const result = await response.json();
        
        if (result.success) {
            musicStatus.className = 'status-message success';
            musicStatus.textContent = `✅ Music generation started! Genre: ${genre}, Mood: ${mood}`;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        musicStatus.className = 'status-message error';
        musicStatus.textContent = '❌ Error generating music: ' + error.message;
    }
});

console.log('ForgeAI-Music initialized');
