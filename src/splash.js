import Phaser from "phaser";

export default class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: "SplashScene" });
  }

  preload() {
    // You can replace this with your own image asset
    this.load.image('guitar', '/public/assets/images/guitare.png');
  }

  create() {
    // Microphone activation overlay
    const activateMic = async () => {
      if (!globalThis.guitarAudioController) {
        try {
          const { startAudio } = await import("./audio.js");
          globalThis.guitarAudioController = await startAudio(() => {});
        } catch (err) {
          console.log("Erreur audio: " + err.message);
        }
    };
    };

    const activateMic2 = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 16384;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      const sampleRate = audioCtx.sampleRate;
      const binCount = analyser.frequencyBinCount;
      const freqData = new Float32Array(binCount);

      function freqForBin(binIndex) {
        return binIndex * sampleRate / analyser.fftSize;
      }

      function computeChroma() {
        analyser.getFloatFrequencyData(freqData);
        const chroma = new Array(12).fill(0);
        for (let i = 1; i < binCount; i++) {
          const db = freqData[i];
          if (db === -Infinity) continue;
          const mag = magFromDb(db);
          const freq = freqForBin(i);
          if (freq < 55 || freq > 5000) continue;
          const midi = Math.round(69 + 12 * Math.log2(freq / 440));
          if (!Number.isFinite(midi)) continue;
          const pitchClass = ((midi % 12) + 12) % 12;
          chroma[pitchClass] += mag;
        }
        const max = Math.max(...chroma);
        if (max > 0) for (let i=0;i<12;i++) chroma[i] /= max;
        return chroma;
      }

      let lastChord = {root: null, type: null, score:0};
      let stableCount = 0;
    };
          

    this.cameras.main.setBackgroundColor('#222');
    this.add.text(400, 120, "Guitar Learner", { fontSize: "48px", color: "#ffd700", fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 200, "Apprends la guitare en t'amusant !", { fontSize: "24px", color: "#fff" }).setOrigin(0.5);
    this.add.image(400, 320, 'guitar').setScale(0.7);
    const btn = this.add.text(400, 480, "Riffs", {
      fontSize: "32px", color: "#00bfff", backgroundColor: "#333", padding: { left: 16, right: 16, top: 8, bottom: 8 }, borderRadius: 12
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      activateMic();
      this.scene.start('MenuScene');
    });
    const btn2 = this.add.text(400, 540, "Accords", {
      fontSize: "32px", color: "#00bfff", backgroundColor: "#333", padding: { left: 16, right: 16, top: 8, bottom: 8 }, borderRadius: 8
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn2.on('pointerdown', () => {
      this.scene.start('ChordScene');
    });
  }
}
