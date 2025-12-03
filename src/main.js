import Phaser from "phaser";
import SplashScene from "./splash.js";
import MenuScene from "./menu.js";
import RiffScene from "./riff.js";
import StatsScene from "./stats.js";
import ChordScene from "./chord.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#111111",
  parent: "game-container",
  scene: [SplashScene, MenuScene, ChordScene, RiffScene, StatsScene],
  // scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});