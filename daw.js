/* ============================================================
   ForgeAI DAW — FL Studio-inspired JS
   ============================================================ */

// ─── Track color palette (FL Studio-inspired) ────────────────
const TRACK_COLORS = [
    '#e05a5a', '#e07a5a', '#e0a85a', '#d4c45a',
    '#a0d45a', '#5ad45a', '#5ad4a0', '#5abcd4',
    '#5a8ad4', '#7a5ad4', '#b45ad4', '#d45ab4',
];

// ─── State ───────────────────────────────────────────────────
const state = {
    isPlaying:    false,
    isRecording:  false,
    isLooping:    false,
    tempo:        140,
    rootNote:     'C',
    scale:        'Major',
    beatsPerBar:  4,
    totalBars:    32,
    currentBeat:  0,          // float: current playhead position in beats
    tracks:       [],
    selectedTrack: null,
    gridData:     {},          // key: `${trackIdx}-${beatIdx}` -> true
    activeTool:   'select',
    playbackTimer: null,
};

// ─── DOM refs ─────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    createInitialTracks();
    buildGrid();
    buildMixer();
    bindTransport();
    bindTools();
    bindKeyshortcuts();
    bindKeyDropdown();
    bindBpm();
    bindTabs();
    animatePerfMeters();
});

// ─── Tracks ──────────────────────────────────────────────────
function createInitialTracks() {
    const names = [
        'Kick', 'Snare', 'Hi-Hat', 'Clap',
        'Bass', 'Lead Synth', 'Pad', 'Arp',
        'Perc', 'FX',
    ];
    names.forEach((name, i) => addTrack(name, TRACK_COLORS[i % TRACK_COLORS.length]));
}

function addTrack(name, color) {
    const track = {
        id:     state.tracks.length,
        name,
        color:  color || TRACK_COLORS[state.tracks.length % TRACK_COLORS.length],
        volume: 100,
        pan:    0,
        muted:  false,
        soloed: false,
    };
    state.tracks.push(track);
    renderTrackList();
    return track;
}

function renderTrackList() {
    const container = $('trackListContainer');
    container.innerHTML = '';

    state.tracks.forEach((track, idx) => {
        const el = document.createElement('div');
        el.className = 'track-item' + (state.selectedTrack === track ? ' selected' : '');
        el.dataset.trackId = idx;

        el.innerHTML = `
            <div class="track-color-swatch" style="background:${track.color}" data-track="${idx}"></div>
            <span class="track-number">${idx + 1}</span>
            <span class="track-name">${track.name}</span>
            <div class="track-controls">
                <button class="track-mute-btn${track.muted ? ' muted' : ''}" data-track="${idx}" title="Mute">M</button>
                <button class="track-solo-btn${track.soloed ? ' soloed' : ''}" data-track="${idx}" title="Solo">S</button>
                <div class="track-vol-wrap">
                    <input type="range" class="track-vol-slider" min="0" max="125" value="${track.volume}" data-track="${idx}" title="Volume">
                </div>
            </div>
        `;

        // Click on track row → select
        el.addEventListener('click', e => {
            if (e.target.closest('.track-mute-btn, .track-solo-btn, .track-vol-slider, .track-color-swatch')) return;
            state.selectedTrack = track;
            renderTrackList();
        });

        // Mute
        el.querySelector('.track-mute-btn').addEventListener('click', e => {
            e.stopPropagation();
            track.muted = !track.muted;
            renderTrackList();
        });

        // Solo
        el.querySelector('.track-solo-btn').addEventListener('click', e => {
            e.stopPropagation();
            track.soloed = !track.soloed;
            renderTrackList();
        });

        // Volume
        el.querySelector('.track-vol-slider').addEventListener('input', e => {
            track.volume = parseInt(e.target.value);
            updateMixerChannelLabel(idx);
        });

        container.appendChild(el);
    });
}

// ─── Grid ────────────────────────────────────────────────────
const TOTAL_BEATS = () => state.totalBars * state.beatsPerBar;

function buildGrid() {
    buildRuler();
    const content = $('gridContent');
    content.innerHTML = '';

    state.tracks.forEach((track, tIdx) => {
        const row = document.createElement('div');
        row.className = 'grid-row';
        row.dataset.track = tIdx;

        for (let b = 0; b < TOTAL_BEATS(); b++) {
            const cell = document.createElement('div');
            const barPos = b % state.beatsPerBar;

            cell.className = 'grid-cell' +
                (barPos === 0 ? ' bar-start' : '') +
                (Math.floor(b / state.beatsPerBar) % 2 === 1 ? ' bar-shade' : '');

            cell.dataset.track = tIdx;
            cell.dataset.beat  = b;

            // Restore any existing note
            if (state.gridData[`${tIdx}-${b}`]) {
                paintCell(cell, track.color);
            }

            cell.addEventListener('mousedown', e => onCellMousedown(e, tIdx, b, cell, track));
            row.appendChild(cell);
        }
        content.appendChild(row);
    });
}

function buildRuler() {
    const inner = $('rulerInner');
    if (!inner) return;
    inner.innerHTML = '';
    for (let bar = 1; bar <= state.totalBars; bar++) {
        const mark = document.createElement('div');
        mark.className = 'ruler-mark';
        mark.textContent = bar;
        inner.appendChild(mark);
    }
}

function onCellMousedown(e, tIdx, beat, cell, track) {
    const key = `${tIdx}-${beat}`;
    if (state.activeTool === 'eraser') {
        delete state.gridData[key];
        cell.innerHTML = '';
        cell.style.background = '';
    } else {
        // draw / select tool — toggle
        if (state.gridData[key]) {
            delete state.gridData[key];
            cell.innerHTML = '';
            cell.style.background = '';
        } else {
            state.gridData[key] = true;
            paintCell(cell, track.color);
        }
    }
}

function paintCell(cell, color) {
    cell.innerHTML = '';
    const block = document.createElement('div');
    block.className = 'note-block';
    block.style.background = `linear-gradient(180deg, ${lighten(color, 20)} 0%, ${color} 100%)`;
    block.style.boxShadow = `inset 0 0 0 1px rgba(255,255,255,0.15)`;
    cell.appendChild(block);
}

function lighten(hex, amount) {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ─── Playhead ────────────────────────────────────────────────
const CELL_WIDTH_PX = 48; // must match --cell-w CSS var

function startPlayhead() {
    const playhead  = $('playhead');
    const phRuler   = $('playheadRuler');
    const gridScroll = $('gridScroll');

    playhead.classList.add('visible');

    const secPerBeat = 60 / state.tempo;
    let lastTime = null;

    function frame(ts) {
        if (!state.isPlaying) return;
        if (lastTime === null) lastTime = ts;

        const delta = (ts - lastTime) / 1000; // seconds elapsed
        lastTime = ts;

        state.currentBeat += delta / secPerBeat;

        const totalBeats = TOTAL_BEATS();
        if (state.currentBeat >= totalBeats) {
            if (state.isLooping) {
                state.currentBeat = 0;
            } else {
                stopPlayback();
                return;
            }
        }

        const px = state.currentBeat * CELL_WIDTH_PX;
        playhead.style.left  = px + 'px';
        phRuler.style.left   = px + 'px';

        // Update position display
        const bar  = Math.floor(state.currentBeat / state.beatsPerBar) + 1;
        const beat = Math.floor(state.currentBeat % state.beatsPerBar) + 1;
        const tick = Math.floor((state.currentBeat % 1) * 96);
        $('timeDisplay').textContent =
            `${bar}:${beat}:${String(tick).padStart(3, '0')}`;

        // Auto-scroll grid when playhead nears right edge
        const visibleWidth = gridScroll.clientWidth;
        if (px > gridScroll.scrollLeft + visibleWidth - 80) {
            gridScroll.scrollLeft = px - 60;
        }

        state.playbackTimer = requestAnimationFrame(frame);
    }

    state.playbackTimer = requestAnimationFrame(frame);
}

function stopPlayback() {
    if (state.playbackTimer) {
        cancelAnimationFrame(state.playbackTimer);
        state.playbackTimer = null;
    }
    state.isPlaying = false;
    $('playBtn').classList.remove('is-playing');
    $('playIcon').innerHTML = '<path d="M8 5v14l11-7z"/>';

    // Stop VU animation
    animateVU(false);
}

// ─── Transport ───────────────────────────────────────────────
function bindTransport() {
    $('playBtn').addEventListener('click', togglePlay);
    $('stopBtn').addEventListener('click', handleStop);
    $('recordBtn').addEventListener('click', toggleRecord);
    $('rewindBtn').addEventListener('click', rewindToStart);
    $('loopBtn').addEventListener('click', toggleLoop);
    $('addTrackBtn').addEventListener('click', () => {
        const n = state.tracks.length + 1;
        addTrack(`Track ${n}`);
        buildGrid();
        buildMixer();
    });
    $('saveBtn').addEventListener('click', () => {
        // serialise & offer download
        const data = JSON.stringify({ tempo: state.tempo, rootNote: state.rootNote, scale: state.scale, tracks: state.tracks.map(t => t.name), gridData: state.gridData }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'project.forgeai';
        a.click();
    });
}

function togglePlay() {
    if (state.isPlaying) {
        // Pause
        stopPlayback();
    } else {
        state.isPlaying = true;
        $('playBtn').classList.add('is-playing');
        $('playIcon').innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
        startPlayhead();
        animateVU(true);
    }
}

function handleStop() {
    stopPlayback();
    rewindToStart();
}

function rewindToStart() {
    state.currentBeat = 0;
    $('playhead').style.left = '0px';
    $('playheadRuler').style.left = '0px';
    $('timeDisplay').textContent = '1:1:000';
    $('gridScroll').scrollLeft = 0;
}

function toggleRecord() {
    state.isRecording = !state.isRecording;
    $('recordBtn').classList.toggle('is-recording', state.isRecording);
}

function toggleLoop() {
    state.isLooping = !state.isLooping;
    $('loopBtn').classList.toggle('is-looping', state.isLooping);
}

// ─── BPM ─────────────────────────────────────────────────────
function bindBpm() {
    const display = $('bpmDisplay');

    // Click display → inline edit
    display.addEventListener('dblclick', () => {
        const val = prompt('Enter BPM (40–300):', state.tempo);
        if (val !== null) setBpm(parseInt(val));
    });

    // Arrow buttons
    $('bpmUp').addEventListener('click', () => setBpm(state.tempo + 1));
    $('bpmDown').addEventListener('click', () => setBpm(state.tempo - 1));

    // Scroll wheel on display
    display.addEventListener('wheel', e => {
        e.preventDefault();
        setBpm(state.tempo + (e.deltaY < 0 ? 1 : -1));
    }, { passive: false });

    // Drag up/down on display
    let dragStartY = null, dragStartBpm = null;
    display.addEventListener('mousedown', e => {
        dragStartY   = e.clientY;
        dragStartBpm = state.tempo;
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (dragStartY === null) return;
        const diff = Math.round((dragStartY - e.clientY) / 2);
        setBpm(dragStartBpm + diff);
    });
    document.addEventListener('mouseup', () => { dragStartY = null; dragStartBpm = null; });
}

function setBpm(v) {
    state.tempo = Math.max(40, Math.min(300, v || 40));
    $('bpmDisplay').textContent = state.tempo;
    $('tempoInput').value = state.tempo;
}

// ─── Key / Scale dropdown ────────────────────────────────────
function bindKeyDropdown() {
    const block = $('keyBlock');

    // Toggle on click
    block.addEventListener('click', e => {
        block.classList.toggle('open');
        e.stopPropagation();
    });

    // Close when clicking outside
    document.addEventListener('click', () => block.classList.remove('open'));
    $('keyDropdown').addEventListener('click', e => e.stopPropagation());

    // Root note buttons
    document.querySelectorAll('.key-note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.key-note-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.rootNote = btn.dataset.note;
            updateKeyDisplay();
        });
    });

    // Scale buttons
    document.querySelectorAll('.key-scale-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.key-scale-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.scale = btn.dataset.scale;
            updateKeyDisplay();
        });
    });
}

function updateKeyDisplay() {
    const abbrev = {
        Major: 'Maj', Minor: 'Min', Dorian: 'Dor',
        Mixolydian: 'Mix', Phrygian: 'Phr', Lydian: 'Lyd', Locrian: 'Loc',
    };
    $('keyDisplay').textContent = `${state.rootNote} ${abbrev[state.scale] || state.scale}`;
}

// ─── Tools ───────────────────────────────────────────────────
function bindTools() {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.activeTool = btn.dataset.tool;
        });
    });
}

// ─── Tabs ────────────────────────────────────────────────────
function bindTabs() {
    document.querySelectorAll('.pattern-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.pattern-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// ─── Mode toggle (PAT / SONG) ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// ─── Mixer ───────────────────────────────────────────────────
function buildMixer() {
    const container = $('mixerTrackChannels');
    container.innerHTML = '';

    state.tracks.forEach((track, idx) => {
        const ch = document.createElement('div');
        ch.className = 'mixer-channel';
        ch.id = `mixerCh${idx}`;
        ch.innerHTML = `
            <div class="channel-name">${track.name.slice(0, 5)}</div>
            <div class="channel-fader-wrap">
                <div class="vu-meter" id="vu${idx}">
                    <div class="vu-bar" id="vuBar${idx}" style="height:0%"></div>
                </div>
                <input type="range" orient="vertical" min="0" max="125" value="${track.volume}"
                    class="fader" id="fader${idx}" title="${track.name} Volume">
            </div>
            <div class="channel-vol-label" id="volLabel${idx}">${track.volume}%</div>
            <div class="channel-knobs">
                <div class="knob-wrap" title="Pan">
                    <div class="knob" id="panKnob${idx}"></div>
                    <div class="knob-label">PAN</div>
                </div>
            </div>
            <div style="width:38px;height:4px;border-radius:2px;margin-top:2px;background:${track.color};opacity:0.8"></div>
        `;

        ch.querySelector(`#fader${idx}`).addEventListener('input', e => {
            track.volume = parseInt(e.target.value);
            $(`volLabel${idx}`).textContent = track.volume + '%';
            // sync track vol slider in track list
            const trackSlider = document.querySelector(`.track-vol-slider[data-track="${idx}"]`);
            if (trackSlider) trackSlider.value = track.volume;
        });

        container.appendChild(ch);
    });

    // Master fader
    $('masterFader').addEventListener('input', e => {
        $('masterVolLabel').textContent = e.target.value + '%';
    });
}

function updateMixerChannelLabel(idx) {
    const label = $(`volLabel${idx}`);
    const fader = $(`fader${idx}`);
    if (label) label.textContent = state.tracks[idx].volume + '%';
    if (fader) fader.value = state.tracks[idx].volume;
}

// ─── VU meter animation ──────────────────────────────────────
let vuAnimFrame = null;

function animateVU(run) {
    if (!run) {
        if (vuAnimFrame) { cancelAnimationFrame(vuAnimFrame); vuAnimFrame = null; }
        // Zero out all VUs
        state.tracks.forEach((_, i) => {
            const bar = $(`vuBar${i}`);
            if (bar) bar.style.height = '0%';
        });
        $('masterVuBar').style.height = '0%';
        return;
    }

    function tick() {
        state.tracks.forEach((track, i) => {
            if (track.muted) {
                const bar = $(`vuBar${i}`);
                if (bar) bar.style.height = '0%';
                return;
            }
            const bar = $(`vuBar${i}`);
            if (!bar) return;
            const level = Math.max(0, Math.min(100,
                (track.volume / 125) * (55 + Math.random() * 45)
            ));
            bar.style.height = level + '%';
        });
        const masterLevel = 60 + Math.random() * 35;
        $('masterVuBar').style.height = masterLevel + '%';
        vuAnimFrame = requestAnimationFrame(tick);
    }
    vuAnimFrame = requestAnimationFrame(tick);
}

// ─── Perf meters (fake CPU/BUF animation) ────────────────────
function animatePerfMeters() {
    setInterval(() => {
        const cpu = 8 + Math.random() * 18;
        const buf = 3 + Math.random() * 8;
        const cpuFill = $('cpuFill');
        const bufFill = $('bufFill');
        if (cpuFill) cpuFill.style.width = cpu + '%';
        if (bufFill) bufFill.style.width = buf + '%';
    }, 1200);
}

// ─── AI Generate ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const aiBtn = $('aiGenerateBtn');
    if (aiBtn) aiBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// ─── Keyboard shortcuts ───────────────────────────────────────
function bindKeyshortcuts() {
    document.addEventListener('keydown', e => {
        if (e.target.tagName === 'INPUT') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'KeyP':
                setActiveTool('pencil');
                break;
            case 'KeyE':
                setActiveTool('eraser');
                break;
            case 'Escape':
                setActiveTool('select');
                break;
            case 'KeyC':
                setActiveTool('cut');
                break;
            case 'KeyL':
                toggleLoop();
                break;
        }

        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            $('saveBtn').click();
        }
    });
}

function setActiveTool(tool) {
    state.activeTool = tool;
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
    if (btn) btn.classList.add('active');
}

console.log('🎵 ForgeAI DAW ready');
