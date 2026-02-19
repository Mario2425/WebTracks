# WebTracks 🎵
A completely online audio and music production solution with AI capabilities and integration. Free* to use


## Features

### 1. 🎚️ Full Online Digital Audio Workstation (DAW)

- **Multi-track Audio Editor**: Create and manage multiple audio tracks
- **Transport Controls**: Play, pause, stop, and record functionality
- **Real-Time Recording**: Record your performance lively
- **Timeline Visualization**: Visual timeline with playhead for precise editing
- **Track Controls**: Individual track volume, mute, and solo controls
- **Plugins**: Upload and import your favorite VSTs or browse built in ones from the selection library
- **Master Controls**: Master volume and tempo (BPM) adjustment
- **Waveform Visualization**: Visual representation of audio on each track
- **Performance Monitor**: Monitor your device's vitals real-time (CPU, Memory, I/O)
- **Project Settings**: Easily manage and tweak your project's name, author, performance options, connected audio devices, latency, buffer size and more
- **Project Management**: Save and export your projects
- **Transposing Audio**: Transpose your audio to any pitch and key you want

### 2. 🎼 AI Stem Splitting

- **Audio Separation**: Upload any audio file and separate it into individual stems
- **Four Stem Types**: 
  - Vocals
  - Drums
  - Bass
  - Other instruments
- **Drag & Drop Upload**: Easy file upload interface
- **Download Stems**: Download individual stems for further processing

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Mario2425/WebTracks.git
cd WebTracks
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

### Digital Audio Workstation
1. Use the transport controls to play, pause, or stop playback
2. Add new tracks with the "+ Add Track" button
3. Adjust individual track volumes and use mute/solo controls
4. Set the master volume and tempo
5. Save your project or export when finished

### AI Stem Splitting
1. Navigate to the "AI Stem Splitting" tab
2. Drag and drop an audio file or click to browse
3. Wait for processing
4. Download individual stems (vocals, drums, bass, other)

### AI Generation
1. Navigate to the "AI Generation" tab
2. Choose between "Sound Effects" or "Music" tab
3. For Sound Effects:
   - Enter a description of the sound you want
   - Set the duration
   - Click "Generate Sound FX"
4. For Music:
   - Select genre and mood
   - Set tempo and duration
   - Click "Generate Music"

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **File Upload**: Multer
- **Audio Visualization**: HTML5 Canvas

## API Endpoints

- `POST /api/stem-split` - Upload audio for stem separation
- `POST /api/generate-sfx` - Generate AI sound effects
- `POST /api/generate-music` - Generate AI music
- `POST /api/save-project` - Save DAW project

## Future Enhancements

- Integration with actual AI models for stem splitting (Demucs, Spleeter)
- Integration with AI music generation models (MusicGen, AudioCraft)
- Real-time audio recording and processing
- Audio effects and plugins
- MIDI support
- Export to various audio formats
- Cloud storage for projects
- Collaboration features
- Rate limiting for API endpoints in production
- User authentication and authorization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by professional DAWs like Ableton Live, FL Studio, and Logic Pro
- Built with modern web technologies for cross-platform compatibility

