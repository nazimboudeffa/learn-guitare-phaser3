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

export function freqToStringName(freq) {
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

export default class CoursesPracticeScene extends Phaser.Scene {
  constructor() {
    super({ key: "CoursesPracticeScene" });
  }

  preload() {
    // Get exercise key from menu (default to ex1)
    const courseKey = (this.scene.settings.data && this.scene.settings.data.courseKey) || 'course-1-1';
    this.courseKey = courseKey;
    this.load.json(this.courseKey, `courses/${courseKey}.json`);
  }

  create() {
      // Index for note spawning
      this.courseIndex = 0;
    // Back to menu button - modern style
    const backBtn = this.add.text(32, 32, '← Menu', {
      fontSize: '26px', color: '#fff', backgroundColor: '#00bfff', padding: { left: 18, right: 18, top: 8, bottom: 8 }, fontStyle: 'bold', borderRadius: 12, shadow: { offsetX: 2, offsetY: 2, color: '#222', blur: 4, fill: true }
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2d7c45, 0x00bfff, 0x32cd32, 0x222222, 1);
    bg.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);
    bg.setDepth(-1);

    // Title with drop shadow
    this.add.text(450, 60, this.course?.title || "Course", {
      fontSize: "38px", color: "#fff", fontStyle: "bold", shadow: { offsetX: 0, offsetY: 4, color: '#00bfff', blur: 12, fill: true }, wordWrap: { width: 700 }
    }).setOrigin(0.5);
    this.add.text(450, 110, this.course?.description || "", {
      fontSize: "22px", color: "#ffd700", fontStyle: "italic", shadow: { offsetX: 0, offsetY: 2, color: '#222', blur: 6, fill: true }, wordWrap: { width: 700 }
    }).setOrigin(0.5);

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

    // draw lines + labels with animated highlight
    for (let i = 0; i < 6; i++) {
      const line = this.add.line(0, 0, 0, this.targetY[i], 900, this.targetY[i], 0xffffff, 0.10).setLineWidth(6);
      line.setAlpha(0.5);
      this.tweens.add({ targets: line, alpha: 1, duration: 1200, yoyo: true, repeat: -1, delay: i * 120 });
      this.add.text(60, this.targetY[i], this.noteTypes[i].name, { fontSize: "24px", color: Phaser.Display.Color.IntegerToColor(this.noteTypes[i].color).rgba, fontStyle: "bold", shadow: { offsetX: 0, offsetY: 2, color: '#222', blur: 4, fill: true } }).setOrigin(0.5);
    }

    // target area rectangle (where player should play) - rounded, glowing
    const targetRect = this.add.rectangle(150, 300, 48, 360, 0xffffff, 0.1).setOrigin(0.5);
    targetRect.setStrokeStyle(4, 0x00bfff, 0.8);
    this.tweens.add({ targets: targetRect, alpha: 0.25, duration: 800, yoyo: true, repeat: -1 });

    // notes group
    this.notesGroup = this.add.group();

    // spawn control
    this.exerciseStartTime = null;

    this.currentTargetNote = null;

    // Load exercise data
    this.course = this.cache.json.get(this.courseKey) || {};
    this.courseNotes = Array.isArray(this.course.notes) ? this.course.notes : [];

    // Stats tracking
    this.stats = {
      total: this.courseNotes.length,
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
    const notesInZone = this.notesGroup.getChildren().filter(container => container.x > 130 && container.x < 170 && !container.hit);
    if (notesInZone.length > 0) {
      // Try to match played note with any note in zone
      const matchedNote = notesInZone.find(container => container.noteName === played);
      if (matchedNote) {
        matchedNote.hit = true;
        matchedNote.circle?.setFillStyle?.(0x00ff00); // green for hit
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
    this.moveAndHandleNotes(delta);

    // Exercise timing
    if (!this.exerciseStartTime) {
      this.exerciseStartTime = time;
    }
    const elapsed = (time - this.exerciseStartTime) / 1000;

    // Spawn notes according to exercise sequence
    while (
      this.courseIndex < this.courseNotes.length &&
      elapsed >= this.courseNotes[this.courseIndex].time
    ) {
      const noteObj = this.courseNotes[this.courseIndex];
      this.spawnNote(noteObj.string, noteObj.fret, noteObj.length ?? 1);
      this.courseIndex++;
    }

    // Show stats scene when exercise is finished
    if (
      this.courseIndex >= this.courseNotes.length &&
      this.notesGroup.getLength() === 0 &&
      !this.shownStatsScene
    ) {
      this.shownStatsScene = true;
      this.showStatsScene();
    }
  }

  moveAndHandleNotes(delta) {
    // move notes left and check if in target zone
    for (const container of this.notesGroup.getChildren()) {
      let speed = 0.12; // vitesse normale
      if (container.length && container.length > 1.2) {
        speed *= 0.5;  // les notes longues vont 2x moins vite
      }
      container.x -= delta * speed;
      container.isInTargetZone = container.x > 130 && container.x < 170;
      // If note leaves the screen and was not hit, count as missed ONCE
      if (container.x < -40) {
        if (!container.hit && !container.missed) {
          container.missed = true;
          this.stats.fail++;
        }
        container.destroy();
      }
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
        title: this.course.title,
        description: this.course.description
      }
    });
  }

  spawnNote(noteName, fret = null, length = 1) {
    const idx = this.noteTypes.findIndex(n => n.name === noteName);
    const noteType = this.noteTypes[idx];
    if (!noteType) return;

    // Couleur du doigt
    let color = 0x888888; // défaut gris
    if (typeof fret === 'number') {
      if (fret === 1) color = 0xffeb3b;
      else if (fret === 2) color = 0x9c27b0;
      else if (fret === 3) color = 0x2196f3;
      else if (fret >= 4) color = 0xf44336;
    }

    // Gestion si noteName est un objet
    if (typeof noteName === 'object' && noteName !== null) {
      fret = noteName.fret ?? fret;
      length = noteName.length ?? length;
      noteName = noteName.string;
    }

    // Container pour note
    const container = this.add.container(900, this.targetY[idx]);

    // -------------------------------
    // Queue de la note
    // -------------------------------
    const baseHeight = 36;
    const baseWidth = 20; // tête
    const queueWidth = baseWidth * length; // queue proportionnelle à length

    // Queue : rectangle fin
    const queue = this.add.rectangle(queueWidth / 2, 0, queueWidth, baseHeight / 3, color)
      .setOrigin(0.5, 0.5)
      .setAlpha(0.6); // légèrement transparent

    // Tête de la note : cercle
    const head = this.add.circle(0, 0, baseHeight / 2, color)
      .setStrokeStyle(2, 0xffffff);

    container.add([queue, head]);

    // -------------------------------
    // Texte de frette au-dessus
    // -------------------------------
    if (typeof fret === 'number') {
      const fretText = this.add.text(0, -baseHeight * 0.75, fret.toString(), {
        fontSize: '18px',
        color: '#fff',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      container.add(fretText);
    }

    // -------------------------------
    // Données utiles
    // -------------------------------
    container.noteName = noteType.name;
    container.fret = fret;
    container.noteLength = length;
    container.hit = false;
    container.head = head;
    container.queue = queue;

    this.notesGroup.add(container);
    this.currentTargetNote = noteType.name;
  }

  // stop audio when scene shuts down
  shutdownAudio() {
    stopAudio();
  }
}