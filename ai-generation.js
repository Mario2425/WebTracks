// ============================================
// AI GENERATION PAGE - JAVASCRIPT
// ============================================

const chatInput = document.getElementById('chatInput');
const btnSend = document.getElementById('btnSend');
const btnUpload = document.querySelector('.btn-upload');
const fileInput = document.getElementById('fileInput');
const chatMessages = document.getElementById('chatMessages');
const suggestionChips = document.querySelectorAll('.suggestion-chip');

// Auto-resize textarea
chatInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

// Send message on button click
btnSend.addEventListener('click', sendMessage);

// Send message on Enter (Shift+Enter for new line)
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Upload button
btnUpload.addEventListener('click', () => {
    fileInput.click();
});

// Handle file upload
fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const fileName = this.files[0].name;
        addUserMessage(`📎 Uploaded reference: ${fileName}`);
        addAssistantMessage('✅ Reference file received! I\'ll analyze it and create similar audio. Please describe what you\'d like me to generate based on this reference.');
        
        // Store file for later use
        window.uploadedReferenceFile = this.files[0];
    }
});

// Suggestion chips
suggestionChips.forEach(chip => {
    chip.addEventListener('click', function() {
        const chipText = this.textContent.trim();
        chatInput.value = chipText;
        chatInput.focus();
        // Send immediately
        setTimeout(() => sendMessage(), 100);
    });
});

// Function to send message
function sendMessage() {
    const message = chatInput.value.trim();
    
    if (message === '') return;
    
    // Add user message
    addUserMessage(message);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Call API to generate music/SFX
    generateWithSunoAI(message);
}

// Generate audio with Suno AI
async function generateWithSunoAI(prompt) {
    addAssistantMessage('🎵 Processing your request with Suno AI...');
    
    try {
        // Call backend API
        const response = await fetch('/api/generate-music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                make_instrumental: true,
                duration: 30
            })
        });

        const data = await response.json();

        if (!data.success) {
            addAssistantMessage(`❌ Error: ${data.error}`);
            return;
        }

        // Check if it's demo mode
        if (data.demo) {
            addAssistantMessage(`⚠️ ${data.message}`);
            addAssistantMessage('💡 To use real Suno AI generation, you need a valid API key. Visit https://suno.ai or a Suno API provider to get your key, then add it to your .env file.');
        }

        // Show generation in progress or immediate result
        const generationId = data.id;
        
        if (data.audio_url && data.status === 'demo') {
            // Demo mode - show audio immediately
            displayGeneratedAudio(data.audio_url, generationId, true);
        } else if (data.audio_url) {
            // Audio ready immediately
            displayGeneratedAudio(data.audio_url, generationId, false);
        } else {
            // Need to poll for completion
            const progressDiv = addGenerationProgress(generationId);
            pollGenerationStatus(generationId, progressDiv);
        }

    } catch (error) {
        console.error('Error generating audio:', error);
        addAssistantMessage(`❌ Error: ${error.message}`);
    }
}

// Display generated audio
function displayGeneratedAudio(audioUrl, generationId, isDemo) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    messageDiv.id = `generation-${generationId}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>✨ ${isDemo ? 'Demo audio ready!' : 'Your audio has been generated successfully!'}</p>
            ${isDemo ? '<p style="color: var(--secondary-color); font-size: 0.9rem;">⚠️ This is demo audio. Configure your Suno AI API key for real generation.</p>' : ''}
            <div class="generation-progress">
                <audio controls style="width: 100%; margin-top: 0.5rem;">
                    <source src="${audioUrl}" type="audio/mpeg">
                </audio>
                <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <a href="${audioUrl}" download style="text-decoration: none;">
                        <button style="padding: 0.5rem 1rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.9rem;">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </a>
                    <button onclick="regenerateAudio('${generationId}')" style="padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.15); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary); cursor: pointer; font-size: 0.9rem;">
                        <i class="fas fa-redo"></i> Regenerate
                    </button>
                </div>
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add generation progress message
function addGenerationProgress(id) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    messageDiv.id = `generation-${id}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>⏳ Generating your audio...</p>
            <div class="generation-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 30%"></div>
                </div>
                <span class="progress-text">Processing... Please wait</span>
            </div>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    return messageDiv;
}

// Poll for generation status
async function pollGenerationStatus(id, messageDiv) {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
        try {
            const response = await fetch(`/api/generation-status/${id}`);
            const data = await response.json();

            if (data.success && data.audio_url) {
                // Generation complete
                messageDiv.querySelector('.message-content').innerHTML = `
                    <p>✨ Your audio has been generated successfully!</p>
                    <div class="generation-progress">
                        <audio controls style="width: 100%; margin-top: 0.5rem;">
                            <source src="${data.audio_url}" type="audio/mpeg">
                        </audio>
                        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <a href="${data.audio_url}" download style="text-decoration: none;">
                                <button style="padding: 0.5rem 1rem; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.9rem;">
                                    <i class="fas fa-download"></i> Download
                                </button>
                            </a>
                            <button onclick="regenerateAudio('${messageDiv.id}')" style="padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.15); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary); cursor: pointer; font-size: 0.9rem;">
                                <i class="fas fa-redo"></i> Regenerate
                            </button>
                        </div>
                    </div>
                `;
                scrollToBottom();
                return;
            }

            // Update progress
            attempts++;
            const progress = Math.min(30 + (attempts * 2), 95);
            const progressBar = messageDiv.querySelector('.progress-fill');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }

// Regenerate audio function (global scope for inline onclick)
window.regenerateAudio = function(messageId) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        messageDiv.remove();
    }
    addAssistantMessage('🔄 Regenerating your audio with new variations...');
    // Get the last user message prompt
    const userMessages = document.querySelectorAll('.user-message .message-content p');
    if (userMessages.length > 0) {
        const lastPrompt = userMessages[userMessages.length - 1].textContent;
        setTimeout(() => generateWithSunoAI(lastPrompt), 500);
    }
};

            if (attempts >= maxAttempts) {
                messageDiv.querySelector('.message-content').innerHTML = `
                    <p>⚠️ Generation is taking longer than expected. Please check back later or try again.</p>
                `;
                return;
            }

            // Poll again after 5 seconds
            setTimeout(poll, 5000);

        } catch (error) {
            console.error('Error polling status:', error);
            messageDiv.querySelector('.message-content').innerHTML = `
                <p>❌ Error checking generation status: ${error.message}</p>
            `;
        }
    };

    // Start polling
    setTimeout(poll, 5000);
}

// Add user message to chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
        <div class="message-avatar user-avatar">
            <i class="fas fa-user"></i>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add assistant message to chat
function addAssistantMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Project item click handlers
document.querySelectorAll('.project-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        const projectName = this.querySelector('h4').textContent;
        addAssistantMessage(`📂 Loaded project: "${projectName}". What would you like to create next?`);
    });
});

// New project button
document.querySelector('.btn-new-project').addEventListener('click', function() {
    // Clear chat
    chatMessages.innerHTML = `
        <div class="message assistant-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>🆕 New project created! Let's start creating something amazing. What would you like to generate?</p>
            </div>
        </div>
    `;
    
    // Deselect all projects
    document.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
});

console.log('🎵 AI Generation Page - Ready!');
