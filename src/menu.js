import Phaser from "phaser";

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    // Load all exercises in the folder (for now, hardcoded)
    this.load.json('ex1', '/exercises/ex1.json');
    this.load.json('ex2', '/exercises/ex2.json');
  }

  create() {
    // Microphone activation overlay
    const activateMic = () => {
      if (!globalThis.guitarAudioController) {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
          position:fixed;top:0;left:0;width:100vw;height:100vh;
          display:flex;align-items:center;justify-content:center;
          z-index:1000;background:rgba(0,0,0,0.5);
          font-size:1.5rem;color:white;
        `;
        overlay.innerHTML = `<div style="text-align:center">
          <div style="margin-bottom:12px">Clique pour activer le micro et démarrer</div>
          <div style="font-size:0.9rem;opacity:0.9">Conseil : utilise une guitare acoustique ou électrique avec un manche confortable</div>
        </div>`;
        document.body.appendChild(overlay);

        overlay.addEventListener("click", async () => {
          overlay.remove();
          try {
            const { startAudio } = await import("./audio.js");
            globalThis.guitarAudioController = await startAudio(() => {});
            // Add visible feedback
            const okText = document.createElement("div");
            okText.textContent = "Micro activé ! (audio OK)";
            okText.style.cssText = `
              position:fixed;top:20px;left:50%;transform:translateX(-50%);
              background:#222;color:#0f0;padding:12px 24px;border-radius:8px;z-index:1001;font-size:1.2rem;
            `;
            document.body.appendChild(okText);
            setTimeout(() => okText.remove(), 2000);
          } catch (err) {
            alert("Erreur audio: " + err.message);
          }
        });
      }
    };

    activateMic();

    this.add.text(400, 80, "Guitar Learner", { fontSize: "32px", color: "#fff" }).setOrigin(0.5);
    this.add.text(400, 140, "Choisis un exercice :", { fontSize: "20px", color: "#fff" }).setOrigin(0.5);

    // List of exercises (for now, hardcoded)
    const exercises = [
      { key: 'ex1', data: this.cache.json.get('ex1') },
      { key: 'ex2', data: this.cache.json.get('ex2') }
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
        this.scene.start('GuitarScene', { exerciseKey: ex.key });
      });
      this.add.text(400, y + 24, ex.data.description, { fontSize: "14px", color: "#aaa" }).setOrigin(0.5);
    }
  }
}
