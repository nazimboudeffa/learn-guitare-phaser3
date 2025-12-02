import Phaser from "phaser";
import MenuScene from "./menu.js";
import GuitarScene from "./scene.js";
import StatsScene from "./stats.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#111111",
  parent: "game-container",
  scene: [MenuScene, GuitarScene, StatsScene],
  // scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});