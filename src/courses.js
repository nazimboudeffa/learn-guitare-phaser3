import Phaser from "phaser";

export default class CoursesScene extends Phaser.Scene {
  constructor() {
    super({ key: "CoursesScene" });
  }

  preload() {
    // Load all exercises in the folder (for now, hardcoded)
    this.load.json('ex1', '/courses/ex1.json');
    this.load.json('ex2', '/courses/ex2.json');
    this.load.json('ex3', '/courses/ex3.json');
    this.load.json('ex4', '/courses/ex4.json');
  }

  create() {
    
    this.add.text(400, 80, "Guitar Learner", { fontSize: "32px", color: "#fff" }).setOrigin(0.5);
    this.add.text(400, 140, "Choisis un exercice :", { fontSize: "20px", color: "#fff" }).setOrigin(0.5);

    // List of exercises (for now, hardcoded)
    const exercises = [
      { key: 'ex1', data: this.cache.json.get('ex1') },
      { key: 'ex2', data: this.cache.json.get('ex2') },
      { key: 'ex3', data: this.cache.json.get('ex3') },
      { key: 'ex4', data: this.cache.json.get('ex4') },
    ];

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.data) continue; // skip if not loaded
      const y = 200 + i * 60;
      const btn = this.add.text(400, y, ex.data.title, {
        fontSize: "22px", color: "#00bfff", backgroundColor: "#222", padding: { left: 12, right: 12, top: 6, bottom: 6 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        // Start GuitarScene, pass exercise key
        this.scene.start('CoursesPracticeScene', { exerciseKey: ex.key });
      });
      this.add.text(400, y + 24, ex.data.description, { fontSize: "14px", color: "#aaa" }).setOrigin(0.5);
    }
  }
}
