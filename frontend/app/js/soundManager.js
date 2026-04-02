class SoundManager {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterVolume = 0.4;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            await this.createToneBuffer();
        } catch (error) {
            console.error('SoundManager initialization failed:', error);
        }
    }

    async createToneBuffer() {
        if (!this.audioContext) return null;
        
        const sampleRate = this.audioContext.sampleRate;
        const duration = 0.3;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = buffer.getChannelData(0);
        
        const frequency = 880;
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / sampleRate;
            const amplitude = Math.exp(-t * 8);
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude;
        }
        
        this.toneBuffer = buffer;
        return buffer;
    }

    playDing() {
        if (!this.initialized || !this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            if (!this.toneBuffer) {
                this.createToneBuffer();
            }
            
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = this.toneBuffer;
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
            
            source.start(this.audioContext.currentTime);
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }

    playDoubleDing() {
        if (!this.initialized || !this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            if (!this.toneBuffer) {
                this.createToneBuffer();
            }
            
            const playSingleDing = (delay) => {
                const source = this.audioContext.createBufferSource();
                const gainNode = this.audioContext.createGain();
                
                source.buffer = this.toneBuffer;
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime + delay);
                
                source.start(this.audioContext.currentTime + delay);
            };
            
            playSingleDing(0);
            playSingleDing(0.2);
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }
}

const soundManager = new SoundManager();
