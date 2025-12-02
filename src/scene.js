// src/scene.js
import { startAudio, stopAudio } from "./audio.js";

/**
 * Simple mapping frequency -> closest open string (E A D G B e)
 * We'll use standard tuning frequencies for strings:
 * E2(82.41), A2(110.00), D3(146.83), G3(196.00), B3(246.94), E4(329.63)
 */

const STRING_NOTES = [
  { name: "E", freq: 82.41 },
  { name: "A", freq: 110 },
  { name: "D", freq: 146.83 },
  { name: "G", freq: 196 },
  { name: "B", freq: 246.94 },
  { name: "e", freq: 329.63 }
];

function freqToStringName(freq) {
  if (!freq || freq <= 0) return null;
  let closest = STRING_NOTES[0];
  let minDiff = Math.abs(freq - closest.freq);
  for (let s of STRING_NOTES) {
    const d = Math.abs(freq - s.freq);
    if (d < minDiff) {
      minDiff = d;
      closest = s;
    }
  }
  return closest.name;
}

export default class GuitarScene extends Phaser.Scene {
  constructor() {
    super({ key: "GuitarScene" });
  }

  preload() {
    // Get exercise key from menu (default to ex1)
    const exerciseKey = (this.scene.settings.data && this.scene.settings.data.exerciseKey) || 'ex1';
    this.exerciseKey = exerciseKey;
    this.load.json(this.exerciseKey, `exercises/${exerciseKey}.json`);
  }

  create() {
    // Layout
    this.targetY = [420, 360, 300, 240, 180, 120];
    this.noteTypes = [
      { name: "E", color: 0x00bfff },
      { name: "A", color: 0x32cd32 },
      { name: "D", color: 0xffd700 },
      { name: "G", color: 0xff69b4 },
      { name: "B", color: 0xff8c00 },
      { name: "e", color: 0xffffff }
    ];

    // Load exercise data
    this.exercise = this.cache.json.get(this.exerciseKey);
    this.exerciseNotes = this.exercise.notes || [];
    this.exerciseIndex = 0;
    this.exerciseStartTime = null;

    // draw lines + labels
    for (let i = 0; i < 6; i++) {
      this.add.line(0, 0, 0, this.targetY[i], 900, this.targetY[i], 0xffffff, 0.08).setLineWidth(4);
      this.add.text(40, this.targetY[i], this.noteTypes[i].name, { fontSize: "20px", color: "#fff" }).setOrigin(0.5);
    }

    // target area rectangle (where player should play)
    this.add.rectangle(150, 300, 40, 360, 0xffffff, 0.06).setOrigin(0.5);
    this.add.text(150, 80, "Joue ici", { fontSize: "18px", color: "#fff" }).setOrigin(0.5);

    // notes group
    this.notesGroup = this.add.group();

    // spawn control
    this.exerciseStartTime = null;

    this.currentTargetNote = null;

    // Stats tracking
    this.stats = {
      total: this.exerciseNotes.length,
      success: 0,
      fail: 0
    };
    this.shownStatsScene = false;
    
    this.feedback = this.add.text(400, 550, "", { fontSize: "18px", color: "#ffff00" }).setOrigin(0.5);

    this.isListening = true;

    // Ensure pitch detection is active with the correct callback
    if (globalThis.guitarAudioController) {
      globalThis.guitarAudioController.stop();
    }
    startAudio(({ pitch, clarity }) => this.onPitch({ pitch, clarity })).then(controller => {
      globalThis.guitarAudioController = controller;
    });
  }

  // createOverlay removed: mic activation is now handled in MenuScene

  async startListening() {
    // Microphone is already activated in MenuScene
    // Optionally, subscribe to pitch updates here if needed
  }

  onPitch({ pitch, clarity }) {
    if (!pitch || clarity < 0.7) {
      // ...existing code...
      return;
    }

    const played = freqToStringName(pitch);
    if (!played) {
      // ...existing code...
      return;
    }

    // Check for notes in target zone
    const notesInZone = this.notesGroup.getChildren().filter(note => note.x > 130 && note.x < 170 && !note.hit);
    if (notesInZone.length > 0) {
      // Try to match played note with any note in zone
      const matchedNote = notesInZone.find(note => note.noteName === played);
      if (matchedNote) {
        matchedNote.hit = true;
        matchedNote.setFillStyle(0x00ff00); // green for hit
        this.stats.success++;
        this.feedback?.setText?.(`Bravo ! Note ${played} réussie (clarité ${Math.round(clarity * 100)}%)`);
        this.time.delayedCall(400, () => matchedNote.destroy());
        return;
      } else {
        this.stats.fail++;
        this.feedback?.setText?.(`Note jouée (${played}) mais ce n'est pas la bonne corde !`);
        return;
      }
    } else {
      this.stats.fail++;
      this.feedback?.setText?.(`Tu as joué ${played} — aucune note dans la zone cible`);
    }
  }

  update(time, delta) {
    // move notes left and check if in target zone
    for (const note of this.notesGroup.getChildren()) {
      note.x -= delta * 0.22;
      note.isInTargetZone = note.x > 130 && note.x < 170;
      if (note.x < -40) note.destroy();
    }

    // Exercise timing
    if (!this.exerciseStartTime) {
      this.exerciseStartTime = time;
    }
    const elapsed = (time - this.exerciseStartTime) / 1000;

    // Spawn notes according to exercise sequence
    while (
      this.exerciseIndex < this.exerciseNotes.length &&
      elapsed >= this.exerciseNotes[this.exerciseIndex].time
    ) {
      this.spawnNote(this.exerciseNotes[this.exerciseIndex].string);
      this.exerciseIndex++;
    }

    // Show stats scene when exercise is finished
    if (
      this.exerciseIndex >= this.exerciseNotes.length &&
      this.notesGroup.getLength() === 0 &&
      !this.shownStatsScene
    ) {
      this.shownStatsScene = true;
      this.showStatsScene();
    }
  }

  showStatsScene() {
    this.shutdownAudio();
    // Calculate accuracy
    const totalAttempts = this.stats.success + this.stats.fail;
    const accuracy = totalAttempts > 0 ? Math.round((this.stats.success / totalAttempts) * 100) : 0;
    this.scene.start('StatsScene', {
      stats: {
        total: this.stats.total,
        success: this.stats.success,
        fail: this.stats.fail,
        accuracy
      },
      exercise: {
        title: this.exercise.title,
        description: this.exercise.description
      }
    });
  }

  spawnNote(noteName) {
    // Find note type by name
    const idx = this.noteTypes.findIndex(n => n.name === noteName);
    const noteType = this.noteTypes[idx];
    if (!noteType) return;

    const note = this.add.circle(900, this.targetY[idx], 18, noteType.color).setStrokeStyle(2, 0xffffff);
    note.noteName = noteType.name;
    note.hit = false;
    this.notesGroup.add(note);

    // update expected note (the next note that should be played)
    this.currentTargetNote = noteType.name;
  }

  // stop audio when scene shuts down
  shutdownAudio() {
    stopAudio();
  }
}