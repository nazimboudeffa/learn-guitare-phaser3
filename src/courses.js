import Phaser from "phaser";

export default class CoursesScene extends Phaser.Scene {
  constructor() {
    super({ key: "CoursesScene" });
  }

  preload() {
    // Load all exercises in the folder (for now, hardcoded)
    this.load.json('course-1-1', '/courses/course-1-1.json');
    this.load.json('course-1-2', '/courses/course-1-2.json');
    this.load.json('course-1-3', '/courses/course-1-3.json');
    this.load.json('course-1-4', '/courses/course-1-4.json');
    this.load.json('course-1-5', '/courses/course-1-5.json');
    this.load.json('course-2-1', '/courses/course-2-1.json');
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
    const courses = [
      { key: 'course-1-1', data: this.cache.json.get('course-1-1') },
      { key: 'course-1-2', data: this.cache.json.get('course-1-2') },
      { key: 'course-1-3', data: this.cache.json.get('course-1-3') },
      { key: 'course-1-4', data: this.cache.json.get('course-1-4') },
      { key: 'course-1-5', data: this.cache.json.get('course-1-5') },
      { key: 'course-2-1', data: this.cache.json.get('course-2-1') },
    ];

    // Create a container for horizontal scrolling
    const scrollContainer = this.add.container(0, 400);
    let xOffset = 0;
    for (const course of courses) {
      if (!course.data) continue;
      // Create a square background
      const bg = this.add.rectangle(0, 0, 200, 200, 0x222222, 1).setStrokeStyle(2, 0x00bfff);
      // Title text
      const title = this.add.text(0, -60, course.data.title, {
        fontSize: "22px", color: "#00bfff", fontStyle: "bold", wordWrap: { width: 180 }
      }).setOrigin(0.5);
      // Description text
      const desc = this.add.text(0, 20, course.data.description || '', {
        fontSize: "14px", color: "#aaa", wordWrap: { width: 180 }
      }).setOrigin(0.5);
      // Group into a mini container
      const courseBox = this.add.container(xOffset, 0, [bg, title, desc]);
      courseBox.setSize(200, 200);
      courseBox.setInteractive();

      // Distinguish click from drag
      let pointerDownX = null;
      courseBox.on('pointerdown', (pointer) => {
        pointerDownX = pointer.x;
      });
      courseBox.on('pointerup', (pointer) => {
        if (pointerDownX !== null && Math.abs(pointer.x - pointerDownX) < 10) {
          this.scene.start('CoursesPracticeScene', { courseKey: course.key });
        }
        pointerDownX = null;
      });

      scrollContainer.add(courseBox);
      xOffset += 220;
    }

    // Custom smooth drag scroll
    scrollContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, 800, 200), Phaser.Geom.Rectangle.Contains, true);
    let dragPointerId = null;
    let dragStartX = 0;
    let pointerStartX = 0;
    scrollContainer.on('pointerdown', (pointer) => {
      dragPointerId = pointer.id;
      dragStartX = scrollContainer.x;
      pointerStartX = pointer.x;
    });
    this.input.on('pointermove', (pointer) => {
      if (dragPointerId !== null && pointer.id === dragPointerId && pointer.isDown && pointer.y > 400 && pointer.y < 600) {
        const deltaX = pointer.x - pointerStartX;
        const minX = Math.min(0, 800 - xOffset);
        const maxX = 0;
        scrollContainer.x = Phaser.Math.Clamp(dragStartX + deltaX, minX, maxX);
      }
    });
    this.input.on('pointerup', (pointer) => {
      if (pointer.id === dragPointerId) {
        dragPointerId = null;
      }
    });
  }
}
