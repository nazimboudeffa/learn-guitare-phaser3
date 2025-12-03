import Phaser from "phaser";
import MenuScene from "./menu.js";
import CoursesScene from "./courses.js";
import CoursePracticeScene from "./courses-practice.js";
import SongsScene from "./songs.js";
import SongsPracticeScene from "./songs-practice.js";
import StatsScene from "./stats.js";
import ChordsScene from "./chords.js";

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#1b1b1b",
  scale : {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600
  },
  parent: "game-container",
  scene: [MenuScene, CoursesScene, CoursePracticeScene, ChordsScene, SongsScene, SongsPracticeScene, StatsScene],
  // scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

const game = new Phaser.Game(config);