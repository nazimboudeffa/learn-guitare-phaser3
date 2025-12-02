import Phaser from "phaser";
import { startAudio } from "./audio.js";
import { freqToStringName } from "./scene.js";

export default class ChordScene extends Phaser.Scene {
  constructor() {
    super({ key: "ChordScene" });
  }

  create() {
    this.chordsToPractice = ["C", "G", "D", "A", "E"];
    this.currentChordIndex = 0;
    this.showChord(this.chordsToPractice[this.currentChordIndex]);
    this.feedback = this.add.text(400, 180, "Joue l'accord demandé et il sera détecté.", { fontSize: "22px", color: "#ffff00" }).setOrigin(0.5);
    this.stats = { success: 0, fail: 0 };
    this.notesGroup = this.add.group();
    startAudio(({ pitch, clarity }) => this.onPitch({ pitch, clarity }));
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

  onPitch({ pitch, clarity }) {
    if (!pitch || clarity < 0.7) return;
    const played = freqToStringName(pitch);
    if (!played) return;
    const now = performance.now();
    this.currentNotes = this.currentNotes || [];
    this.currentNotes.push({ note: played, time: now });
    // Nettoyer le buffer (garder uniquement les notes < 200ms)
    this.currentNotes = this.currentNotes.filter(n => now - n.time < 200);
    const notesInWindow = this.currentNotes.map(n => n.note);
    // Deviner l'accord probable
    const chord = this.guessChord(notesInWindow);
    // Vérification automatique
    const targetChord = this.chordsToPractice[this.currentChordIndex];
    if (chord === targetChord) {
      this.feedback?.setText?.(`Bravo ! Accord ${chord} reconnu !`);
      this.currentChordIndex++;
      if (this.currentChordIndex < this.chordsToPractice.length) {
        this.showChord(this.chordsToPractice[this.currentChordIndex]);
        this.feedback?.setText?.("Joue l'accord demandé et il sera détecté.");
      } else {
        this.feedback?.setText?.("Tous les accords ont été joués !");
      }
    } else if (chord) {
      this.feedback?.setText?.(`Accord détecté : ${chord} (ce n'est pas le bon accord)`);
    } else {
      this.feedback?.setText?.(`Aucun accord reconnu. Joue l'accord demandé.`);
    }

    // --- 4. Vérification des notes dans la zone cible ---
    const notesInZone = this.notesGroup.getChildren().filter(note => note.x > 130 && note.x < 170 && !note.hit);

    if (notesInZone.length > 0) {
        // Match note
        const matchedNote = notesInZone.find(note => note.noteName === played);
        if (matchedNote) {
        matchedNote.hit = true;
        matchedNote.setFillStyle(0x00ff00);
        this.stats.success++;
        this.time.delayedCall(400, () => matchedNote.destroy());
        } else {
        this.stats.fail++;
        }
    } else {
        this.stats.fail++;
    }
    }

    // --- Fonction de devinette d'accord simple (majeurs)
    guessChord(notes) {
    const chords = {
        "C": ["C", "E", "G"],
        "D": ["D", "F#", "A"],
        "E": ["E", "G#", "B"],
        "F": ["F", "A", "C"],
        "G": ["G", "B", "D"],
        "A": ["A", "C#", "E"],
        "B": ["B", "D#", "F#"]
    };

    for (const chordName in chords) {
        const chordNotes = chords[chordName];
        const matchCount = notes.filter(n => chordNotes.includes(n)).length;
        if (matchCount >= 2) return chordName; // au moins 2 notes correspondent
    }
    return null;
    }

}