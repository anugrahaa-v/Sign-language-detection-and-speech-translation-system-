export class HandTracker {
    constructor() {
        // Hands is available globally from the CDN script
        this.hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });
    }

    onResults(callback) {
        this.hands.onResults(callback);
    }

    async send(videoElement) {
        await this.hands.send({ image: videoElement });
    }
}
