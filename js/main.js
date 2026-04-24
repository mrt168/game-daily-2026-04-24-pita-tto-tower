const phaserConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, MenuScene, TutorialScene, GameScene, GameOverScene],
  render: { pixelArt: false, antialias: true },
  input: { activePointers: 2 },
};

window.game = new Phaser.Game(phaserConfig);

window.addEventListener('error', (e) => {
  try {
    console.error('Game error:', e.message, e.error);
    if (window.game && window.game.scene.isActive('GameScene')) {
      window.game.scene.stop('GameScene');
      window.game.scene.start('GameOverScene', { score: 0, height: 0, reason: 'error' });
    }
  } catch (_) { /* noop */ }
});
