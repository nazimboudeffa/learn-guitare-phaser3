import Phaser from "phaser";

export default class SongsScene extends Phaser.Scene {
  constructor() {
    super({ key: "SongsScene" });
  }

  preload() {
    this.load.json('amazing-grace', '/songs/amazing-grace.json');
    this.load.json('happy-birthday', '/songs/happy-birthday.json');
  }

  create() {
        // Back to menu button
        const backBtn = this.add.text(30, 30, '← Menu', {
          fontSize: '22px', color: '#fff', backgroundColor: '#00bfff', padding: { left: 10, right: 10, top: 4, bottom: 4 }
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => {
          this.scene.start('MenuScene');
        });
    
    this.add.text(400, 80, "Guitar Learner", { fontSize: "32px", color: "#fff" }).setOrigin(0.5);
    this.add.text(400, 140, "Choisis un exercice :", { fontSize: "20px", color: "#fff" }).setOrigin(0.5);

    // List of exercises (for now, hardcoded)
    const exercises = [
      { key: 'amazing-grace', data: this.cache.json.get('amazing-grace') },
      { key: 'happy-birthday', data: this.cache.json.get('happy-birthday') }
    ];

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.data) continue; // skip if not loaded
      const y = 200 + i * 60;
      const btn = this.add.text(400, y, ex.data.title, {
        fontSize: "22px", color: "#00bfff", backgroundColor: "#222", padding: { left: 12, right: 12, top: 6, bottom: 6 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        // Start SongsPracticeScene, pass exercise key
        this.scene.start('SongsPracticeScene', { exerciseKey: ex.key });
      });
      this.add.text(400, y + 24, ex.data.description, { fontSize: "14px", color: "#aaa" }).setOrigin(0.5);
    }
  }
}
