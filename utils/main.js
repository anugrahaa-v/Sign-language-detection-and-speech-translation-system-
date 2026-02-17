import { HandTracker } from './services/hand_tracker.js';
import { GestureRecognizer } from './services/gesture_recognizer.js';
import { SentenceBuilder } from './utils/sentence_builder.js';

// 1. Select DOM Elements
const video = document.getElementById('input_video');
const canvas = document.getElementById('output_canvas');
const ctx = canvas.getContext('2d');
const statusBadge = document.getElementById('status-badge');
const sentenceBox = document.getElementById('sentence-box');
const speakBtn = document.getElementById('speak-btn');
const clearBtn = document.getElementById('clear-btn');

let recognizer;
const tracker = new HandTracker();

// 2. Initialize SentenceBuilder with a callback to update UI
const sentenceBuilder = new SentenceBuilder((sentence) => {
    // If sentence is empty, show placeholder, otherwise show text
    if (sentence.length === 0) {
        sentenceBox.innerHTML = '<span class="placeholder">Start signing...</span>';
    } else {
        sentenceBox.textContent = sentence;
    }
});

async function init() {
    // Load config from server
    const res = await fetch('/api/gestures');
    const data = await res.json();
    recognizer = new GestureRecognizer(data.gestures);

    // Initialize Camera
    const cam = new Camera(video, {
        onFrame: async () => await tracker.send(video),
        width: 1280,
        height: 720
    });
    cam.start();
}

// 3. Handle Hand Tracking Results
tracker.onResults(results => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
        // Optional: Reset current processing if hands are lost
        // sentenceBuilder.process(null); 
        return;
    }

    for (const lm of results.multiHandLandmarks) {
        drawConnectors(ctx, lm, HAND_CONNECTIONS, { color: '#00ff00' });
        drawLandmarks(ctx, lm, { color: '#ff0000' });

        // A. Recognize Gesture
        const res = recognizer.recognize(lm);
        const gestureName = res.name;

        // B. Update Status Badge (Visual feedback)
        statusBadge.textContent = gestureName ? `Detected: ${gestureName}` : "Tracking...";
        statusBadge.style.background = gestureName ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)";

        // C. Send to Sentence Builder
        if (gestureName) {
            sentenceBuilder.process(gestureName);
        }

        // D. Debug overlay (optional)
        let y = 30;
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        if(res.state) {
            for (const [k, v] of Object.entries(res.state)) {
                ctx.fillStyle = v ? "#4ade80" : "#f87171"; // Green/Red text
                ctx.fillText(`${k}`, 10, y);
                y += 20;
            }
        }
    }
});

// 4. Button Logic

// Clear Button
clearBtn.addEventListener('click', () => {
    sentenceBuilder.clear();
});

// Speak Button
speakBtn.addEventListener('click', () => {
    const text = sentenceBox.textContent;
    
    // Don't speak the placeholder text
    if (!text || text === "Start signing...") return;

    // Browser Text-to-Speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // Speed
    utterance.pitch = 1;
    
    // After speaking, clear the sentence as requested
    utterance.onend = () => {
        sentenceBuilder.clear();
    };

    window.speechSynthesis.speak(utterance);
});

// Start the app
init();
