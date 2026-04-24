class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }
  preload() {
    const { W, H } = { W: GAME_CONFIG.WIDTH, H: GAME_CONFIG.HEIGHT };
    const loadingText = this.add.text(W / 2, H / 2, 'Loading...', {
      fontSize: '28px', color: '#ffffff', fontFamily: 'sans-serif',
    }).setOrigin(0.5);

    const bar = this.add.rectangle(W / 2, H / 2 + 40, 400, 8, 0x444466);
    const fill = this.add.rectangle(W / 2 - 200, H / 2 + 40, 0, 8, 0xf1c40f).setOrigin(0, 0.5);

    this.load.on('progress', v => { fill.width = 400 * v; });
    this.load.on('complete', () => { loadingText.destroy(); bar.destroy(); fill.destroy(); });

    this.load.image('block', 'assets/images/block.png');
    this.load.image('crane', 'assets/images/crane.png');
    this.load.image('logo', 'assets/images/logo.png');
    this.load.image('background', 'assets/images/background.png');
    this.load.image('icon', 'assets/images/icon.png');

    this.load.on('loaderror', file => console.warn('load failed:', file.key));
  }
  create() {
    this.scene.start('MenuScene');
  }
}
