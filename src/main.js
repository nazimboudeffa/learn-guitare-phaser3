import Phaser from "phaser";
import SplashScene from "./splash.js";
import CoursesScene from "./courses.js";
import CoursePracticeScene from "./courses-practice.js";
import SongsScene from "./songs.js";
import SongsPracticeScene from "./songs-practice.js";
import StatsScene from "./stats.js";
import ChordsScene from "./chords.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#111111",
  parent: "game-container",
  scene: [SplashScene, CoursesScene, CoursePracticeScene, ChordsScene, SongsScene, SongsPracticeScene, StatsScene],
  // scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

window.addEventListener("load", () => {
  const game = new Phaser.Game(config);
});