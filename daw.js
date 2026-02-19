// DAW State Management
const dawState = {
    isPlaying: false,
    isRecording: false,
    tempo: 140,
    currentTime: 0,
    tracks: [],
    selectedTrack: null,
    totalMeasures: 32,
    beatsPerMeasure: 4,
    gridData: {}
};

// Initialize DAW
document.addEventListener('DOMContentLoaded', () => {
    initializeDAW();
    setupEventListeners();
    createInitialTracks();
    generateGrid();
});

function initializeDAW() {
    console.log('🎵 ForgeAI Music DAW Initialized');
}

function setupEventListeners() {
    // Transport Controls
    document.getElementById('playBtn').addEventListener('click', togglePlay);
    document.getElementById('stopBtn').addEventListener('click', stop);
    document.getElementById('recordBtn').addEventListener('click', toggleRecord);
    
    // Tempo Control
    document.getElementById('tempoInput').addEventListener('change', (e) => {
        dawState.tempo = parseInt(e.target.value);
        console.log(`Tempo set to: ${dawState.tempo} BPM`);
    });
    
    // Track Management
    document.getElementById('addTrackBtn').addEventListener('click', addNewTrack);
    
    // Property Controls
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        const volume = e.target.value;
        document.getElementById('volumeValue').textContent = `${volume}%`;
        if (dawState.selectedTrack) {
            dawState.selectedTrack.volume = volume;
        }
    });
    
    document.getElementById('panSlider').addEventListener('input', (e) => {
        const pan = e.target.value;
        let panText = 'Center';
        if (pan < 0) panText = `${Math.abs(pan)}% L`;
        else if (pan > 0) panText = `${pan}% R`;
        document.getElementById('panValue').textContent = panText;
        if (dawState.selectedTrack) {
            dawState.selectedTrack.pan = pan;
        }
    });
    
    document.getElementById('trackNameInput').addEventListener('change', (e) => {
        if (dawState.selectedTrack) {
            dawState.selectedTrack.name = e.target.value;
            updateTrackList();
        }
    });
    
    // AI Generation
    document.getElementById('aiGenerateBtn').addEventListener('click', openAIGeneration);
}

// Transport Controls
function togglePlay() {
    dawState.isPlaying = !dawState.isPlaying;
    const playBtn = document.getElementById('playBtn');
    
    if (dawState.isPlaying) {
        console.log('▶️ Playing...');
        playBtn.style.backgroundColor = '#7aaa76';
        startPlayback();
    } else {
        console.log('⏸️ Paused');
        playBtn.style.backgroundColor = '#5a8ac6';
        pausePlayback();
    }
}

function stop() {
    dawState.isPlaying = false;
    dawState.currentTime = 0;
    document.getElementById('playBtn').style.backgroundColor = '#5a8ac6';
    document.getElementById('timeDisplay').textContent = '0:00:00';
    console.log('⏹️ Stopped');
}

function toggleRecord() {
    dawState.isRecording = !dawState.isRecording;
    const recordBtn = document.getElementById('recordBtn');
    
    if (dawState.isRecording) {
        console.log('⏺️ Recording...');
        recordBtn.style.backgroundColor = '#d66a6a';
    } else {
        console.log('Recording stopped');
        recordBtn.style.backgroundColor = '#c65a5a';
    }
}

let playbackInterval;

function startPlayback() {
    playbackInterval = setInterval(() => {
        dawState.currentTime += 1000 / ((dawState.tempo / 60) * 4); // Update based on tempo
        updateTimeDisplay();
        updatePlaybackPosition();
    }, 250);
}

function pausePlayback() {
    if (playbackInterval) {
        clearInterval(playbackInterval);
    }
}

function updateTimeDisplay() {
    const totalSeconds = Math.floor(dawState.currentTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((dawState.currentTime % 1000) / 10);
    
    document.getElementById('timeDisplay').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}

function updatePlaybackPosition() {
    // Visual feedback for playing position
    // This would be enhanced with actual audio playback
}

// Track Management
function createInitialTracks() {
    for (let i = 1; i <= 10; i++) {
        addTrack(`Track ${i}`);
    }
}

function addNewTrack() {
    const trackNumber = dawState.tracks.length + 1;
    addTrack(`Track ${trackNumber}`);
    generateGrid(); // Regenerate grid with new track
}

function addTrack(name) {
    const track = {
        id: dawState.tracks.length,
        name: name,
        volume: 80,
        pan: 0,
        muted: false,
        solo: false,
        notes: []
    };
    
    dawState.tracks.push(track);
    updateTrackList();
}

function updateTrackList() {
    const container = document.getElementById('trackListContainer');
    container.innerHTML = '';
    
    dawState.tracks.forEach((track, index) => {
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        if (dawState.selectedTrack === track) {
            trackElement.classList.add('selected');
        }
        
        trackElement.innerHTML = `
            <div class="track-indicator"></div>
            <div class="track-name">${track.name}</div>
        `;
        
        trackElement.addEventListener('click', () => selectTrack(track));
        container.appendChild(trackElement);
    });
}

function selectTrack(track) {
    dawState.selectedTrack = track;
    updateTrackList();
    
    // Update property panel
    document.getElementById('volumeSlider').value = track.volume;
    document.getElementById('volumeValue').textContent = `${track.volume}%`;
    document.getElementById('panSlider').value = track.pan;
    
    let panText = 'Center';
    if (track.pan < 0) panText = `${Math.abs(track.pan)}% L`;
    else if (track.pan > 0) panText = `${track.pan}% R`;
    document.getElementById('panValue').textContent = panText;
    
    document.getElementById('trackNameInput').value = track.name;
}

// Grid Generation
function generateGrid() {
    generateGridHeader();
    generateGridContent();
}

function generateGridHeader() {
    const header = document.getElementById('gridHeader');
    header.innerHTML = '';
    
    for (let i = 1; i <= dawState.totalMeasures; i++) {
        const measure = document.createElement('div');
        measure.className = 'measure-number';
        measure.textContent = i;
        header.appendChild(measure);
    }
}

function generateGridContent() {
    const content = document.getElementById('gridContent');
    content.innerHTML = '';
    
    dawState.tracks.forEach((track, trackIndex) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        
        for (let measure = 0; measure < dawState.totalMeasures; measure++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            
            if ((measure + 1) % 4 === 0) {
                cell.classList.add('bar');
            } else {
                cell.classList.add('beat');
            }
            
            cell.dataset.track = trackIndex;
            cell.dataset.measure = measure;
            
            cell.addEventListener('click', () => toggleNote(trackIndex, measure, cell));
            
            row.appendChild(cell);
        }
        
        content.appendChild(row);
    });
}

function toggleNote(trackIndex, measure, cell) {
    const key = `${trackIndex}-${measure}`;
    
    if (dawState.gridData[key]) {
        delete dawState.gridData[key];
        cell.classList.remove('active');
        cell.innerHTML = '';
    } else {
        dawState.gridData[key] = {
            track: trackIndex,
            measure: measure,
            duration: 1
        };
        cell.classList.add('active');
        const noteBlock = document.createElement('div');
        noteBlock.className = 'note-block';
        cell.appendChild(noteBlock);
    }
    
    console.log(`Toggled note at Track ${trackIndex + 1}, Measure ${measure + 1}`);
}

// AI Generation
function openAIGeneration() {
    console.log('🤖 Opening AI Generation...');
    // Navigate to AI generation page
    window.location.href = 'ai-generation.html';
}

// Menu Actions
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
        const menuName = e.target.textContent;
        console.log(`Menu clicked: ${menuName}`);
        
        switch(menuName) {
            case 'FILE':
                console.log('File menu');
                break;
            case 'EDIT':
                console.log('Edit menu');
                break;
            case 'VIEW':
                console.log('View menu');
                break;
            default:
                console.log(`${menuName} menu not implemented yet`);
        }
    });
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Spacebar - Play/Pause
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
    }
    
    // Ctrl+S - Save
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        console.log('💾 Saving project...');
        // Implement save functionality
    }
    
    // Delete - Remove selected notes
    if (e.key === 'Delete') {
        console.log('Deleting selected notes...');
        // Implement delete functionality
    }
});

console.log('🎹 DAW Interface Ready');
