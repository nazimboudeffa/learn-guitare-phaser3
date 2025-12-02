import Phaser from "phaser";

export default class StatsScene extends Phaser.Scene {
  constructor() {
    super({ key: "StatsScene" });
  }

  init(data) {
    this.stats = data.stats || {};
    this.exercise = data.exercise || {};
  }

  create() {
    this.add.text(400, 80, "Statistiques de l'exercice", { fontSize: "28px", color: "#fff" }).setOrigin(0.5);
    this.add.text(400, 120, this.exercise.title || "", { fontSize: "20px", color: "#fff" }).setOrigin(0.5);
    this.add.text(400, 160, this.exercise.description || "", { fontSize: "16px", color: "#aaa" }).setOrigin(0.5);

    // Show stats
    this.add.text(400, 220, `Notes jouées : ${this.stats.total}` , { fontSize: "20px", color: "#fff" }).setOrigin(0.5);
    this.add.text(400, 260, `Réussites : ${this.stats.success}` , { fontSize: "20px", color: "#00ff00" }).setOrigin(0.5);
    this.add.text(400, 300, `Ratés : ${this.stats.fail}` , { fontSize: "20px", color: "#ff4444" }).setOrigin(0.5);
    this.add.text(400, 340, `Précision : ${this.stats.accuracy}%` , { fontSize: "20px", color: "#ffd700" }).setOrigin(0.5);

    // Button to return to menu
    const btn = this.add.text(400, 420, "Retour au menu", {
      fontSize: "26px", color: "#00bfff", backgroundColor: "#222", padding: { left: 16, right: 16, top: 8, bottom: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
