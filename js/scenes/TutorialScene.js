class TutorialScene extends Phaser.Scene {
  constructor() { super({ key: 'TutorialScene' }); }

  create() {
    const W = GAME_CONFIG.WIDTH, H = GAME_CONFIG.HEIGHT;

    if (this.textures.exists('background')) {
      this.add.image(W / 2, H / 2, 'background').setDisplaySize(W, H).setAlpha(0.6);
    } else {
      this.cameras.main.setBackgroundColor('#0f3460');
    }

    this.add.text(W / 2, 50, 'あそびかた', {
      fontSize: '32px', color: '#ffffff', fontStyle: 'bold',
      fontFamily: 'Hiragino Sans, sans-serif',
    }).setOrigin(0.5);

    this.step = 0;
    this.steps = [
      {
        title: '① タップでブロック落下',
        body: '画面をタップすると\nクレーンからブロックが落ちる',
        demoY: 200,
      },
      {
        title: '② 前のブロックに重ねよう',
        body: 'ちょうどいいタイミングで\nタップして積み上げ！',
        demoY: 200,
      },
      {
        title: '③ はみ出すと縮む',
        body: 'ずれた部分は切り落とし\n幅がゼロになると終了',
        demoY: 200,
      },
      {
        title: '④ パーフェクトで爆発！',
        body: 'ピッタリ重ねると コンボ×2 x4 x8\n何階まで積めるか挑戦！',
        demoY: 200,
      },
    ];

    this.uiGroup = this.add.container(0, 0);
    this.showStep(0);
  }

  showStep(idx) {
    try {
      this.uiGroup.removeAll(true);
      const W = GAME_CONFIG.WIDTH, H = GAME_CONFIG.HEIGHT;
      const s = this.steps[idx];

      const panel = this.add.rectangle(W / 2, 380, 640, 280, 0x1a1a2e, 0.85)
        .setStrokeStyle(3, 0xf1c40f);

      const titleText = this.add.text(W / 2, 280, s.title, {
        fontSize: '28px', color: '#f1c40f', fontStyle: 'bold',
        fontFamily: 'Hiragino Sans, sans-serif',
      }).setOrigin(0.5);

      const bodyText = this.add.text(W / 2, 360, s.body, {
        fontSize: '22px', color: '#ffffff', align: 'center',
        fontFamily: 'Hiragino Sans, sans-serif', lineSpacing: 8,
      }).setOrigin(0.5);

      const demoBlock = this.add.rectangle(W / 2, 460, 120, 36, 0xe74c3c)
        .setStrokeStyle(2, 0xffffff);
      this.tweens.add({ targets: demoBlock, y: { from: 150, to: 460 }, duration: 1200, repeat: -1, ease: 'Cubic.In' });

      const tapHint = this.add.text(W / 2, 540,
        idx === this.steps.length - 1 ? 'タップでゲーム開始！' : '画面をタップして次へ',
        {
          fontSize: '20px', color: '#cccccc',
          fontFamily: 'Hiragino Sans, sans-serif',
        }).setOrigin(0.5);
      this.tweens.add({ targets: tapHint, alpha: { from: 0.5, to: 1 }, duration: 800, yoyo: true, repeat: -1 });

      const pageText = this.add.text(W - 40, H - 40, `${idx + 1} / ${this.steps.length}`, {
        fontSize: '18px', color: '#ffffff',
        fontFamily: 'sans-serif',
      }).setOrigin(1, 1);

      this.uiGroup.add([panel, titleText, bodyText, demoBlock, tapHint, pageText]);

      this.input.removeAllListeners('pointerdown');
      this.input.once('pointerdown', () => this.nextStep());
    } catch (e) { console.error('showStep error', e); this.scene.start('GameScene'); }
  }

  nextStep() {
    try {
      AudioGen.tap();
      this.step++;
      if (this.step >= this.steps.length) {
        localStorage.setItem('tutorial_done', 'true');
        this.scene.start('GameScene');
      } else {
        this.showStep(this.step);
      }
    } catch (e) { console.error(e); this.scene.start('GameScene'); }
  }
}
