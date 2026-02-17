export class SentenceBuilder {
    constructor(onUpdate) {
        this.sentence = [];
        this.currentGesture = null;
        this.gestureStartTime = 0;
        this.onUpdate = onUpdate;
        
        // Settings
        this.debounceTime = 1000; // Require holding gesture for 1 second to confirm
        this.lastAddedGesture = null;
    }

    process(gestureName) {
        const now = Date.now();

        // If the gesture is the same as what we are currently "holding"
        if (gestureName === this.currentGesture) {
            // Check if we have held it long enough
            if (now - this.gestureStartTime > this.debounceTime) {
                // Only add if it's different from the *immediately previously added* word
                // OR if enough time has passed to allow a repeat (optional logic)
                if (gestureName !== this.lastAddedGesture) {
                    this.addWord(gestureName);
                }
            }
        } else {
            // New gesture detected (or noise), reset timer
            this.currentGesture = gestureName;
            this.gestureStartTime = now;
        }
    }

    addWord(word) {
        this.sentence.push(word);
        this.lastAddedGesture = word; // Lock this word so it doesn't spam
        this.onUpdate(this.sentence.join(" "));
        
        // Visual feedback logic could go here (e.g., flash the box)
        console.log("Word added:", word);
    }

    clear() {
        this.sentence = [];
        this.lastAddedGesture = null;
        this.currentGesture = null;
        this.onUpdate(""); // Update UI to empty
    }
}
