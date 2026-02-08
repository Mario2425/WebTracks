# WebTracks 🎵
A completely online audio and music production solution with AI capabilities. Free* to use


## Features

### 1. 🎚️ Full Online Digital Audio Workstation (DAW)
- **Multi-track Audio Editor**: Create and manage multiple audio tracks
- **Transport Controls**: Play, pause, stop, and record functionality
- **Timeline Visualization**: Visual timeline with playhead for precise editing
- **Track Controls**: Individual track volume, mute, and solo controls
- **Master Controls**: Master volume and tempo (BPM) adjustment
- **Waveform Visualization**: Visual representation of audio on each track
- **Project Management**: Save and export your projects
- **Transposing Audio**: Transpose your audio to any pitch and key you want

### 2. 🎼 AI Stem Splitting
- **Audio Separation**: Separate your audio file to individual stems, just simply right click your track and stem split your track
- **Four Stem Types**: 
  - Vocals
  - Drums
  - Bass
  - Other instruments
- **Drag & Drop Upload**: Easy file upload interface, instantly adds the file as a track to your project
- **Download Stems**: Download individual stems for further processing

### 3. Sharing Your Songs With The Planet

#### A Worldwide Avaible Shared Songs Page 
- **Go to --> Top bar --> Export --> Share with the planet 🌍**
- **Search bar**: Describe the song you want
- **View likes, view count, view saves and view the user's other shared song projects**: Set the length of your sound effect (1-30 seconds)
- **Save**: Liked it? Save instantly to your 'Likes' library or download directly to your device

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Mario2425/ForgeAI-Music.git
cd ForgeAI-Music
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
5. Save your project, share it or export when finished

### AI Stem Splitting
1. Drag and drop your audio file to your project
2. Right click your track and hit 'Stem split'
3. Wait for processing
4. Download individual stems (vocals, drums, bass, other)

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

- Better integration with AI music generation models (MusicGen, AudioCraft)
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

