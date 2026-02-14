// ============================================
// DAW JAVASCRIPT - Main Functionality
// ============================================

class DAW {
    constructor() {
        this.audioContext = null;
        this.tracks = [];
        this.isPlaying = false;
        this.isRecording = false;
        this.currentTime = 0;
        this.bpm = 120;
        this.playbackStartTime = 0;
        this.animationFrameId = null;
        this.projectName = 'Untitled Project';
        this.sampleRate = 48000;
        this.bufferSize = 512;
        
        this.init();
    }

    init() {
        this.initAudioContext();
        this.setupEventListeners();
        this.setupPerformanceMonitor();
        this.drawTimelineRuler();
        this.updateUI();
        
        // Add initial track
        this.addTrack();
    }

    initAudioContext() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.sampleRate = this.audioContext.sampleRate;
            console.log('Audio Context initialized:', this.audioContext.state);
            console.log('Sample Rate:', this.sampleRate);
        } catch (e) {
            console.error('Web Audio API not supported:', e);
            alert('Your browser does not support Web Audio API');
        }
    }

    setupEventListeners() {
        // Transport controls
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecord());
        document.getElementById('rewindBtn').addEventListener('click', () => this.rewind());
        document.getElementById('loopBtn').addEventListener('click', () => this.toggleLoop());
        document.getElementById('metronomeBtn').addEventListener('click', () => this.toggleMetronome());
        
        // Track management
        document.getElementById('addTrackBtn').addEventListener('click', () => this.addTrack());
        
        // Project management
        document.getElementById('newProjectBtn').addEventListener('click', () => this.newProject());
        document.getElementById('openProjectBtn').addEventListener('click', () => this.openProject());
        document.getElementById('saveProjectBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('exportProjectBtn').addEventListener('click', () => this.exportProject());
        
        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());
        
        // BPM control
        document.getElementById('bpmInput').addEventListener('change', (e) => {
            this.bpm = parseInt(e.target.value);
        });
        
        // Master volume
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('masterVolumeValue').textContent = value + '%';
            if (this.audioContext) {
                this.audioContext.destination.volume = value / 100;
            }
        });
        
        // Close modal on outside click
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });
    }

    setupPerformanceMonitor() {
        setInterval(() => {
            // Simulate CPU usage
            const cpuUsage = Math.random() * 30 + 10;
            document.getElementById('cpuBar').style.width = cpuUsage + '%';
            document.getElementById('cpuValue').textContent = cpuUsage.toFixed(1) + '%';
            
            // Simulate memory usage
            const memUsage = Math.random() * 40 + 20;
            document.getElementById('memoryBar').style.width = memUsage + '%';
            document.getElementById('memoryValue').textContent = memUsage.toFixed(1) + '%';
            
            // Buffer size display
            document.getElementById('bufferValue').textContent = this.bufferSize;
            document.getElementById('bufferBar').style.width = (this.bufferSize / 2048 * 100) + '%';
            
            // Master meter simulation
            if (this.isPlaying) {
                const meterL = Math.random() * 80 + 20;
                const meterR = Math.random() * 80 + 20;
                document.getElementById('masterMeterL').style.height = meterL + '%';
                document.getElementById('masterMeterR').style.height = meterR + '%';
            } else {
                document.getElementById('masterMeterL').style.height = '0%';
                document.getElementById('masterMeterR').style.height = '0%';
            }
        }, 100);
    }

    // Transport Controls
    togglePlay() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.playbackStartTime = this.audioContext.currentTime - this.currentTime;
        document.getElementById('playBtn').classList.add('active');
        document.getElementById('playBtn').querySelector('i').classList.replace('fa-play', 'fa-pause');
        this.updatePlayhead();
    }

    pause() {
        this.isPlaying = false;
        document.getElementById('playBtn').classList.remove('active');
        document.getElementById('playBtn').querySelector('i').classList.replace('fa-pause', 'fa-play');
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    stop() {
        this.isPlaying = false;
        this.isRecording = false;
        this.currentTime = 0;
        document.getElementById('playBtn').classList.remove('active');
        document.getElementById('playBtn').querySelector('i').classList.replace('fa-pause', 'fa-play');
        document.getElementById('recordBtn').classList.remove('active');
        this.updateTimeDisplay();
        this.updatePlayheadPosition();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    rewind() {
        this.currentTime = 0;
        this.updateTimeDisplay();
        this.updatePlayheadPosition();
    }

    toggleRecord() {
        if (!this.isRecording) {
            this.isRecording = true;
            document.getElementById('recordBtn').classList.add('active');
            console.log('Recording started');
            // Start recording logic here
        } else {
            this.isRecording = false;
            document.getElementById('recordBtn').classList.remove('active');
            console.log('Recording stopped');
        }
    }

    toggleLoop() {
        const btn = document.getElementById('loopBtn');
        btn.classList.toggle('active');
    }

    toggleMetronome() {
        const btn = document.getElementById('metronomeBtn');
        btn.classList.toggle('active');
    }

    updatePlayhead() {
        if (!this.isPlaying) return;
        
        this.currentTime = this.audioContext.currentTime - this.playbackStartTime;
        this.updateTimeDisplay();
        this.updatePlayheadPosition();
        
        this.animationFrameId = requestAnimationFrame(() => this.updatePlayhead());
    }

    updatePlayheadPosition() {
        const playhead = document.getElementById('playhead');
        const pixelsPerSecond = 100; // 100 pixels per second
        const position = this.currentTime * pixelsPerSecond;
        playhead.style.left = (200 + position) + 'px';
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = Math.floor(this.currentTime % 60);
        const milliseconds = Math.floor((this.currentTime % 1) * 1000);
        
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
        document.getElementById('currentTime').textContent = timeStr;
    }

    drawTimelineRuler() {
        const canvas = document.getElementById('rulerCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '10px Inter, sans-serif';
        
        const secondWidth = 100; // pixels per second
        const totalSeconds = Math.ceil(canvas.width / secondWidth);
        
        for (let i = 0; i <= totalSeconds; i++) {
            const x = i * secondWidth;
            
            // Major tick
            ctx.beginPath();
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
            
            // Time label
            const minutes = Math.floor(i / 60);
            const seconds = i % 60;
            const label = `${minutes}:${String(seconds).padStart(2, '0')}`;
            ctx.fillText(label, x + 2, 20);
            
            // Minor ticks (quarter seconds)
            for (let j = 1; j < 4; j++) {
                const minorX = x + (j * secondWidth / 4);
                ctx.beginPath();
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 0.5;
                ctx.moveTo(minorX, canvas.height - 10);
                ctx.lineTo(minorX, canvas.height);
                ctx.stroke();
            }
        }
    }

    // Track Management
    addTrack() {
        const trackId = this.tracks.length + 1;
        const track = {
            id: trackId,
            name: `Track ${trackId}`,
            volume: 80,
            muted: false,
            solo: false,
            clips: [],
            plugins: []
        };
        
        this.tracks.push(track);
        this.renderTrack(track);
        this.updateUI();
    }

    renderTrack(track) {
        // Create track header
        const trackHeader = document.createElement('div');
        trackHeader.className = 'track-header';
        trackHeader.innerHTML = `
            <input type="text" class="track-name" value="${track.name}" data-track-id="${track.id}">
            <div class="track-volume">
                <input type="range" min="0" max="100" value="${track.volume}" data-track-id="${track.id}" class="track-volume-slider">
                <span class="track-volume-value">${track.volume}%</span>
            </div>
            <div class="track-controls">
                <button class="track-btn track-mute" data-track-id="${track.id}" title="Mute">M</button>
                <button class="track-btn track-solo" data-track-id="${track.id}" title="Solo">S</button>
                <button class="track-btn track-record" data-track-id="${track.id}" title="Arm Record">R</button>
                <button class="track-btn track-delete" data-track-id="${track.id}" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        document.getElementById('trackHeaders').appendChild(trackHeader);
        
        // Create track lane
        const trackLane = document.createElement('div');
        trackLane.className = 'track-lane';
        trackLane.dataset.trackId = track.id;
        trackLane.addEventListener('click', (e) => this.handleTrackClick(e, track));
        
        document.getElementById('trackContent').appendChild(trackLane);
        
        // Add event listeners
        trackHeader.querySelector('.track-name').addEventListener('change', (e) => {
            track.name = e.target.value;
        });
        
        trackHeader.querySelector('.track-volume-slider').addEventListener('input', (e) => {
            track.volume = e.target.value;
            trackHeader.querySelector('.track-volume-value').textContent = track.volume + '%';
        });
        
        trackHeader.querySelector('.track-mute').addEventListener('click', (e) => {
            track.muted = !track.muted;
            e.target.classList.toggle('active');
        });
        
        trackHeader.querySelector('.track-solo').addEventListener('click', (e) => {
            track.solo = !track.solo;
            e.target.classList.toggle('active');
        });
        
        trackHeader.querySelector('.track-record').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
        });
        
        trackHeader.querySelector('.track-delete').addEventListener('click', () => {
            this.deleteTrack(track.id);
        });
    }

    handleTrackClick(e, track) {
        if (e.target.classList.contains('track-lane')) {
            // Add audio clip at click position
            const rect = e.target.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const startTime = clickX / 100; // 100 pixels per second
            
            this.addClipToTrack(track, startTime);
        }
    }

    addClipToTrack(track, startTime) {
        const clip = {
            id: Date.now(),
            startTime: startTime,
            duration: 2, // 2 seconds default
            name: 'Audio Clip'
        };
        
        track.clips.push(clip);
        this.renderClip(track, clip);
    }

    renderClip(track, clip) {
        const trackLane = document.querySelector(`.track-lane[data-track-id="${track.id}"]`);
        
        const clipElement = document.createElement('div');
        clipElement.className = 'track-clip';
        clipElement.dataset.clipId = clip.id;
        clipElement.style.left = (clip.startTime * 100) + 'px';
        clipElement.style.width = (clip.duration * 100) + 'px';
        
        // Create canvas for waveform
        const canvas = document.createElement('canvas');
        canvas.width = clip.duration * 100;
        canvas.height = 80;
        clipElement.appendChild(canvas);
        
        // Draw simple waveform
        this.drawWaveform(canvas);
        
        trackLane.appendChild(clipElement);
        
        // Make clip draggable
        this.makeClipDraggable(clipElement, track, clip);
    }

    drawWaveform(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;
        
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        for (let x = 0; x < width; x++) {
            const y = midY + Math.sin(x / 10) * Math.random() * (height / 3);
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    makeClipDraggable(element, track, clip) {
        let isDragging = false;
        let startX = 0;
        let startLeft = 0;
        
        element.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startLeft = parseFloat(element.style.left);
            element.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const newLeft = Math.max(0, startLeft + deltaX);
            element.style.left = newLeft + 'px';
            clip.startTime = newLeft / 100;
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'move';
            }
        });
    }

    deleteTrack(trackId) {
        const trackIndex = this.tracks.findIndex(t => t.id === trackId);
        if (trackIndex > -1) {
            this.tracks.splice(trackIndex, 1);
            
            // Remove from DOM
            const headers = document.getElementById('trackHeaders');
            const content = document.getElementById('trackContent');
            
            const trackHeader = headers.children[trackIndex];
            const trackLane = content.children[trackIndex];
            
            if (trackHeader) trackHeader.remove();
            if (trackLane) trackLane.remove();
            
            this.updateUI();
        }
    }

    // Project Management
    newProject() {
        if (confirm('Create a new project? Any unsaved changes will be lost.')) {
            this.tracks = [];
            this.currentTime = 0;
            this.projectName = 'Untitled Project';
            
            document.getElementById('trackHeaders').innerHTML = '';
            document.getElementById('trackContent').innerHTML = '';
            
            this.stop();
            this.addTrack();
            this.updateUI();
        }
    }

    openProject() {
        // In a real implementation, this would open a file dialog
        alert('Open Project feature coming soon! This would load a saved project file.');
    }

    async saveProject() {
        const projectData = {
            name: this.projectName,
            bpm: this.bpm,
            sampleRate: this.sampleRate,
            bufferSize: this.bufferSize,
            tracks: this.tracks,
            timestamp: new Date().toISOString()
        };
        
        try {
            const response = await fetch('/api/save-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectName: this.projectName,
                    projectData: projectData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Project saved successfully!');
                console.log('Project saved:', result.filename);
            } else {
                alert('Error saving project: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project. Check console for details.');
        }
    }

    exportProject() {
        alert('Export feature coming soon! This will render your project to audio file.');
    }

    // Settings
    openSettings() {
        document.getElementById('settingsModal').classList.add('active');
        document.getElementById('projectNameInput').value = this.projectName;
        document.getElementById('sampleRateSelect').value = this.sampleRate;
        document.getElementById('bufferSizeSelect').value = this.bufferSize;
    }

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
    }

    saveSettings() {
        this.projectName = document.getElementById('projectNameInput').value;
        this.sampleRate = parseInt(document.getElementById('sampleRateSelect').value);
        this.bufferSize = parseInt(document.getElementById('bufferSizeSelect').value);
        
        this.updateUI();
        this.closeSettings();
    }

    updateUI() {
        document.getElementById('trackCount').textContent = this.tracks.length;
        document.getElementById('sampleRate').textContent = this.sampleRate + ' Hz';
        
        // Calculate total project duration
        let maxDuration = 0;
        this.tracks.forEach(track => {
            track.clips.forEach(clip => {
                const clipEnd = clip.startTime + clip.duration;
                if (clipEnd > maxDuration) {
                    maxDuration = clipEnd;
                }
            });
        });
        
        const minutes = Math.floor(maxDuration / 60);
        const seconds = Math.floor(maxDuration % 60);
        document.getElementById('projectDuration').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

// Initialize DAW when page loads
let daw;

document.addEventListener('DOMContentLoaded', () => {
    daw = new DAW();
    console.log('🎵 WebTracks DAW - Ready!');
});

// Mobile menu toggle (from main script)
const dawHamburger = document.querySelector('.hamburger');
const dawNavMenu = document.querySelector('.nav-menu');

if (dawHamburger) {
    dawHamburger.addEventListener('click', () => {
        dawHamburger.classList.toggle('active');
        dawNavMenu.classList.toggle('active');
    });
}

// Close mobile menu when a nav link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (dawHamburger) {
            dawHamburger.classList.remove('active');
            dawNavMenu.classList.remove('active');
        }
    });
});
