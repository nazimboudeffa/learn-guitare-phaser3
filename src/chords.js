import Phaser from "phaser";
import { matchChord, noteNames } from "chord-detector";

export default class ChordsScene extends Phaser.Scene {
  constructor() {
    super({ key: "ChordsScene" });
  }

  create() {
    this.chordsToPractice = ["C maj", "G maj", "D maj", "A maj", "E maj"];
    this.currentChordIndex = 0;
    this.showChord(this.chordsToPractice[this.currentChordIndex]);
    this.feedback = this.add.text(400, 180, "Joue l'accord demandé et il sera détecté.", { fontSize: "22px", color: "#ffff00" }).setOrigin(0.5);
    this.stats = { success: 0, fail: 0 };
    this.notesGroup = this.add.group();
    this.start();
  }

  showChord(chordName) {
    // Efface l'ancien label si présent
    if (this.chordLabel) {
      this.chordLabel.destroy();
      this.chordLabel = null;
    }
    // Affiche le nom de l'accord
    this.chordLabel = this.add.text(400, 100, `Joue l'accord : ${chordName}`,
      { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
  }

  start = async () => {
      function magFromDb(db) {
        return Math.pow(10, db / 20);
      }
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

      const loop = () => {
        const chroma = computeChroma();
        const best = matchChord(chroma);
        const expectedChord = this.chordsToPractice[this.currentChordIndex];
        let feedbackText = '';
        if (best.root === null) {
          feedbackText = '—';
        } else {
          const playedChord = `${noteNames[best.root]}${best.type ? ' ' + best.type : ''}`.trim();
          feedbackText = `${playedChord} (score: ${best.score.toFixed(2)})`;
          // Check if played chord matches expected chord (case-insensitive, ignore type for now)
          if (
            playedChord.replaceAll(' ', '').toLowerCase() === expectedChord.replaceAll(' ', '').toLowerCase()
          ) {
            feedbackText = `Bravo !\n${playedChord}`;
          }
        }
        if (this.feedback) {
          this.feedback.setText(feedbackText);
        }
        const SCORE_THRESHOLD = 0.35;
        if (best.score > SCORE_THRESHOLD) {
          if (lastChord.root === best.root && lastChord.type === best.type) {
            stableCount++;
          } else {
            stableCount = 1;
          }
          if (stableCount >= 3) {
            lastChord = { ...best };
          }
        } else {
          stableCount = 0;
        }
        requestAnimationFrame(loop);
      };
      loop();
    }
  }