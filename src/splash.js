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

    this.cameras.main.setBackgroundColor('#222');
    this.add.text(400, 120, "Guitar Learner", { fontSize: "48px", color: "#ffd700", fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 200, "Apprends la guitare en t'amusant !", { fontSize: "24px", color: "#fff" }).setOrigin(0.5);
    this.add.image(400, 320, 'guitar').setScale(0.7);
    const btn = this.add.text(400, 500, "Riffs", {
      fontSize: "32px", color: "#00bfff", backgroundColor: "#333", padding: { left: 24, right: 24, top: 12, bottom: 12 }, borderRadius: 12
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn.on('pointerdown', () => {
      activateMic();
      this.scene.start('MenuScene');
    });
    const btn2 = this.add.text(400, 560, "Accords (bientôt disponible)", {
      fontSize: "24px", color: "#00bfff", backgroundColor: "#333", padding: { left: 16, right: 16, top: 8, bottom: 8 }, borderRadius: 8
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    btn2.on('pointerdown', () => {
        activateMic();
        this.scene.start('ChordScene');
    });
  }
}
