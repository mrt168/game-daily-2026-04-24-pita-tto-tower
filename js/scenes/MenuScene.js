class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    const W = GAME_CONFIG.WIDTH, H = GAME_CONFIG.HEIGHT;

    if (this.textures.exists('background')) {
      this.add.image(W / 2, H / 2, 'background').setDisplaySize(W, H);
    } else {
      this.cameras.main.setBackgroundColor('#1a1a2e');
    }

    if (this.textures.exists('logo')) {
      const logo = this.add.image(W / 2, H / 2 - 120, 'logo');
      const targetW = Math.min(520, W - 80);
      const scale = targetW / logo.width;
      logo.setScale(scale);
    } else {
      this.add.text(W / 2, H / 2 - 120, 'ピタッとタワー', {
        fontSize: '56px', color: '#ffffff', fontStyle: 'bold',
        fontFamily: 'Hiragino Sans, sans-serif',
      }).setOrigin(0.5);
    }

    this.add.text(W / 2, H / 2 + 20, 'ワンタップで積み上げろ！', {
      fontSize: '22px', color: '#cccccc',
      fontFamily: 'Hiragino Sans, sans-serif',
    }).setOrigin(0.5);

    const best = parseInt(localStorage.getItem('best_height') || '0', 10);
    const bestScore = parseInt(localStorage.getItem('best_score') || '0', 10);
    if (best > 0) {
      this.add.text(W / 2, H / 2 + 60, `ベスト: ${best}階 / ${bestScore}点`, {
        fontSize: '18px', color: '#f1c40f',
        fontFamily: 'Hiragino Sans, sans-serif',
      }).setOrigin(0.5);
    }

    const btnBg = this.add.rectangle(W / 2, H / 2 + 140, 260, 64, 0xf1c40f)
      .setStrokeStyle(3, 0xffffff);
    const btnText = this.add.text(W / 2, H / 2 + 140, 'タップでスタート', {
      fontSize: '24px', color: '#1a1a2e', fontStyle: 'bold',
      fontFamily: 'Hiragino Sans, sans-serif',
    }).setOrigin(0.5);

    this.tweens.add({ targets: btnBg, scale: { from: 1, to: 1.05 }, duration: 700, yoyo: true, repeat: -1 });

    const tutorialDone = localStorage.getItem('tutorial_done') === 'true';

    const helpBtn = this.add.text(W - 30, 30, '?', {
      fontSize: '28px', color: '#ffffff',
      backgroundColor: '#0f3460', padding: { x: 12, y: 6 },
      fontFamily: 'sans-serif',
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    helpBtn.on('pointerdown', () => {
      try {
        AudioGen.tap();
        this.scene.start('TutorialScene');
      } catch (e) { console.error(e); }
    });

    this.input.once('pointerdown', () => {
      try {
        AudioGen.tap();
        if (!tutorialDone) {
          this.scene.start('TutorialScene');
        } else {
          this.scene.start('GameScene');
        }
      } catch (e) { console.error(e); this.scene.start('GameScene'); }
    });
  }
}
