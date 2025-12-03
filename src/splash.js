import Phaser from "phaser";

export default class SplashScene extends Phaser.Scene {
  constructor() {
    super({ key: "SplashScene" });
  }

  preload() {
    // You can replace this with your own image asset
    this.load.image('guitar', '/assets/images/guitare.png');
    this.load.image('courses', '/assets/images/courses.png');
    this.load.image('chords', '/assets/images/chords.png');
    this.load.image('songs', '/assets/images/songs.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#222');
    this.add.text(400, 120, "Guitar Learner", { fontSize: "48px", color: "#ffd700", fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(400, 200, "Apprends la guitare en t'amusant !", { fontSize: "24px", color: "#fff" }).setOrigin(0.5);
    this.add.image(400, 320, 'guitar').setScale(0.7);
    const coursesImage = this.add.image(200, 480, 'courses').setScale(0.7);
    const chordsImage = this.add.image(400, 480, 'chords').setScale(0.7);
    const songsImage = this.add.image(600, 480, 'songs').setScale(0.7);

    coursesImage.setInteractive({ useHandCursor: true });
    coursesImage.on('pointerdown', () => {
      this.scene.start('CoursesScene');
    });

    chordsImage.setInteractive({ useHandCursor: true });
    chordsImage.on('pointerdown', () => {
      this.scene.start('ChordsScene');
    });

    songsImage.setInteractive({ useHandCursor: true });
    songsImage.on('pointerdown', () => {
      this.scene.start('SongsScene');
    });
  }
}
