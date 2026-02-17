export class GestureRecognizer {
    constructor(gestures) {
        this.gestures = gestures.sort((a, b) => b.priority - a.priority);
    }

    recognize(landmarks) {
        const state = this.getFingerState(landmarks);

        for (const g of this.gestures) {
            if (this.match(g.fingers, state)) {
                return { name: g.name, state };
            }
        }
        return { name: null, state };
    }

    match(cfg, state) {
        return Object.keys(cfg).every(f => cfg[f] === state[f]);
    }

    getFingerState(lm) {
        // Helper: Calculate distance between two landmarks
        const d = (idx1, idx2) => {
            return Math.hypot(lm[idx1].x - lm[idx2].x, lm[idx1].y - lm[idx2].y);
        };

      
        
        const thumbLen = d(3, 4); // Length of thumb tip segment
        const thumbTipToPinky = d(4, 17);
        const thumbIpToPinky = d(3, 17);
        const thumbTipToIndexBase = d(4, 5);

        // Logic: Thumb is open if it sticks OUT, and is NOT tucked against the index finger
        const isThumbOpen = (thumbTipToPinky > thumbIpToPinky * 1.1) && (thumbTipToIndexBase > thumbLen * 1.2);


        // --- IMPROVED FINGER LOGIC ---
        // A finger is "open" if the Tip is further from the Wrist than the PIP (middle joint)
        // We add a 'strictness' multiplier (1.1) so a slightly curled finger counts as closed.
        
        const isFingerOpen = (tip, pip) => {
            return d(tip, 0) > (d(pip, 0) * 1.15); // 1.15 is the strictness factor
        };

        return {
            thumb: isThumbOpen,
            index: isFingerOpen(8, 6),   // Index Tip vs PIP
            middle: isFingerOpen(12, 10), // Middle Tip vs PIP
            ring: isFingerOpen(16, 14),  // Ring Tip vs PIP
            pinky: isFingerOpen(20, 18)  // Pinky Tip vs PIP
        };
    }
}
