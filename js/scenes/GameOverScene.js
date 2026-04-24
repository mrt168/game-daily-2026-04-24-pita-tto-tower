class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  init(data) {
    this.finalScore = data.score || 0;
    this.finalHeight = data.height || 0;
    this.reason = data.reason || 'miss';
  }

  create() {
    const W = GAME_CONFIG.WIDTH, H = GAME_CONFIG.HEIGHT;

    if (this.textures.exists('background')) {
      this.add.image(W / 2, H / 2, 'background').setDisplaySize(W, H).setAlpha(0.5);
    } else {
      this.cameras.main.setBackgroundColor('#0f3460');
    }

    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55);

    this.add.text(W / 2, 90, 'ゲームオーバー', {
      fontSize: '48px', color: '#ffffff', fontStyle: 'bold',
      fontFamily: 'Hiragino Sans, sans-serif',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5);

    const best = parseInt(localStorage.getItem('best_height') || '0', 10);
    const bestScore = parseInt(localStorage.getItem('best_score') || '0', 10);
    const isNewBest = this.finalHeight > 0 && this.finalHeight >= best;

    this.add.text(W / 2, 180, `${this.finalHeight} 階`, {
      fontSize: '72px', color: '#f1c40f', fontStyle: 'bold',
      fontFamily: 'Hiragino Sans, sans-serif',
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(W / 2, 260, `${this.finalScore} 点`, {
      fontSize: '36px', color: '#ffffff',
      fontFamily: 'Hiragino Sans, sans-serif',
    }).setOrigin(0.5);

    if (isNewBest) {
      const nb = this.add.text(W / 2, 310, '🎉 NEW BEST! 🎉', {
        fontSize: '28px', color: '#e74c3c', fontStyle: 'bold',
        fontFamily: 'Hiragino Sans, sans-serif',
      }).setOrigin(0.5);
      this.tweens.add({ targets: nb, scale: { from: 1, to: 1.2 }, duration: 500, yoyo: true, repeat: -1 });
    } else {
      this.add.text(W / 2, 310, `ベスト: ${best}階 / ${bestScore}点`, {
        fontSize: '20px', color: '#cccccc',
        fontFamily: 'Hiragino Sans, sans-serif',
      }).setOrigin(0.5);
    }

    const title = this._titleForHeight(this.finalHeight);
    if (title) {
      this.add.text(W / 2, 360, `あなたは「${title}」！`, {
        fontSize: '22px', color: '#f39c12',
        fontFamily: 'Hiragino Sans, sans-serif',
      }).setOrigin(0.5);
    }

    const retryBg = this.add.rectangle(W / 2 - 130, 450, 220, 60, 0xf1c40f)
      .setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 - 130, 450, 'リトライ', {
      fontSize: '26px', color: '#1a1a2e', fontStyle: 'bold',
      fontFamily: 'Hiragino Sans, sans-serif',
    }).setOrigin(0.5);

    retryBg.on('pointerdown', () => {
      try { AudioGen.tap(); this.scene.start('GameScene'); }
      catch (e) { console.error(e); }
    });

    const shareBg = this.add.rectangle(W / 2 + 130, 450, 220, 60, 0x1da1f2)
      .setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(W / 2 + 130, 450, 'シェア', {
      fontSize: '26px', color: '#ffffff', fontStyle: 'bold',
      fontFamily: 'Hiragino Sans, sans-serif',
    }).setOrigin(0.5);

    shareBg.on('pointerdown', () => this._share());

    const menuBtn = this.add.text(W / 2, 530, 'タイトルに戻る', {
      fontSize: '20px', color: '#ffffff',
      fontFamily: 'Hiragino Sans, sans-serif',
      backgroundColor: '#333355', padding: { x: 16, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menuBtn.on('pointerdown', () => {
      try { this.scene.start('MenuScene'); }
      catch (e) { console.error(e); }
    });
  }

  _titleForHeight(h) {
    if (h >= 50) return '神';
    if (h >= 30) return '名匠';
    if (h >= 10) return 'ルーキー';
    return null;
  }

  _share() {
    try {
      const text = `ピタッとタワーで ${this.finalHeight}階 / ${this.finalScore}点 達成！\n#ピタッとタワー #pitaTtoTower\n`;
      const url = window.location.href.replace(/[?#].*$/, '');
      const intentUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url);
      window.open(intentUrl, '_blank');
    } catch (e) { console.error(e); }
  }
}
